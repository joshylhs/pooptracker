import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { db } from './firebase';
import { hashUsername } from '../utils/encryption';
import { NotificationPrefs } from './notificationPrefs';

export interface UserProfile {
  uid: string;
  username: string;
  avatarInitials: string;
  avatarColour: string;
  createdAt: number;
  notifications: {
    enabled: boolean;
    times: string[]; // ["HH:MM", ...] 24h
    smartSuppress: boolean;
  };
}

export class UsernameTakenError extends Error {
  constructor() {
    super('That username is already taken.');
    this.name = 'UsernameTakenError';
  }
}

const AVATAR_PALETTE = [
  '#7F77DD', '#534AB7', '#3B6D11', '#639922',
  '#BA7517', '#854F0B', '#993C1D', '#D85A30',
];

function pickAvatarColour(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function avatarInitialsFrom(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('');
}

function timeString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Creates two Firestore docs for a new user inside one transaction:
 *   - `users/{uid}` (plaintext profile)
 *   - `usernameIndex/{hash}` (hash → uid, for private friend search)
 * Throws UsernameTakenError if the username is already in use.
 */
export async function createUserProfile(args: {
  uid: string;
  displayName: string;
  username: string;
  notifications: NotificationPrefs;
}): Promise<UserProfile> {
  const { uid, displayName, username, notifications } = args;
  const usernameHashValue = await hashUsername(username);

  const profile: UserProfile = {
    uid,
    username,
    avatarInitials: avatarInitialsFrom(displayName),
    avatarColour: pickAvatarColour(uid),
    createdAt: Date.now(),
    notifications: {
      enabled: notifications.enabled,
      times: notifications.slots.map(s => timeString(s.hour, s.minute)),
      smartSuppress: notifications.smartSuppress,
    },
  };

  await runTransaction(db, async tx => {
    const indexRef = doc(db, 'usernameIndex', usernameHashValue);
    const existing = await tx.get(indexRef);
    if (existing.exists() && existing.data()?.userId !== uid) {
      throw new UsernameTakenError();
    }
    tx.set(doc(db, 'users', uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    });
    tx.set(indexRef, {
      usernameHash: usernameHashValue,
      userId: uid,
      createdAt: serverTimestamp(),
    });
  });

  return profile;
}

/**
 * Reads a user's profile. Works for self and any friend (rule-gated).
 * Native Firestore SDK caches reads automatically, so subsequent calls within
 * the persistent cache window are free.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data) return null;
  return {
    uid,
    username: data.username,
    avatarInitials: data.avatarInitials,
    avatarColour: data.avatarColour,
    createdAt: data.createdAt,
    notifications: data.notifications,
  };
}

/** Looks up a uid by username via the deterministic hash index. */
export async function findUidByUsername(username: string): Promise<string | null> {
  const usernameHashValue = await hashUsername(username);
  const snap = await getDoc(doc(db, 'usernameIndex', usernameHashValue));
  if (!snap.exists()) return null;
  const data = snap.data() as { userId?: string } | undefined;
  return data?.userId ?? null;
}

/** Deletes all Firestore data for a user: profile, subcollections, username index, and friendships. */
export async function deleteUserData(uid: string, username: string): Promise<void> {
  const usernameHashValue = await hashUsername(username);

  // Delete user subcollections
  const subcollections = ['logs', 'dailySummaries', 'monthlyTotals', 'yearlyTotals'];
  await Promise.all(
    subcollections.map(async sub => {
      const snap = await getDocs(query(collection(db, 'users', uid, sub)));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }),
  );

  // Remove this user from every friend's friends list, then delete own friendship doc
  const friendsSnap = await getDocs(query(collection(db, 'friendships', uid, 'friends')));
  await Promise.all([
    ...friendsSnap.docs.map(d => deleteDoc(doc(db, 'friendships', d.id, 'friends', uid))),
    ...friendsSnap.docs.map(d => deleteDoc(d.ref)),
  ]);

  // Delete profile and username index
  await Promise.all([
    deleteDoc(doc(db, 'users', uid)),
    deleteDoc(doc(db, 'usernameIndex', usernameHashValue)),
  ]);
}

/** Patches fields on the user's own profile doc. */
export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, 'username' | 'avatarInitials' | 'avatarColour' | 'notifications'>>,
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
