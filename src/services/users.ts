import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  decryptForSelf,
  encryptForRecipient,
  getPublicKeyBase64,
  hashUsername,
} from '../utils/encryption';
import { NotificationPrefs } from './notificationPrefs';

export interface UserStats {
  totalLogs: number;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
}

export interface UserProfile {
  uid: string;
  username: string;
  avatarInitials: string;
  avatarColour: string;
  createdAt: number;
  notifications: {
    enabled: boolean;
    time: string; // "HH:MM" 24h
    smartSuppress: boolean;
  };
  stats: UserStats;
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
 * Creates the three Firestore docs for a new user inside one transaction:
 *   - `users/{uid}` (encrypted to self)
 *   - `publicKeys/{uid}` (unencrypted — public keys are meant to be public)
 *   - `usernameIndex/{hash}` (unencrypted — hash → uid)
 * Throws UsernameTakenError if the username is already in use.
 */
export async function createUserProfile(args: {
  uid: string;
  displayName: string;
  username: string;
  notifications: NotificationPrefs;
}): Promise<UserProfile> {
  const { uid, displayName, username, notifications } = args;
  const publicKey = await getPublicKeyBase64();
  const usernameHashValue = await hashUsername(username);

  const profile: UserProfile = {
    uid,
    username,
    avatarInitials: avatarInitialsFrom(displayName),
    avatarColour: pickAvatarColour(uid),
    createdAt: Date.now(),
    notifications: {
      enabled: notifications.enabled,
      time: timeString(notifications.hour, notifications.minute),
      smartSuppress: notifications.smartSuppress,
    },
    stats: {
      totalLogs: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
    },
  };

  const selfCiphertext = await encryptForRecipient(profile, publicKey);

  await runTransaction(db, async tx => {
    const indexRef = doc(db, 'usernameIndex', usernameHashValue);
    const existing = await tx.get(indexRef);
    if (existing.exists() && existing.data().userId !== uid) {
      throw new UsernameTakenError();
    }
    tx.set(doc(db, 'users', uid), {
      ciphertexts: { [uid]: selfCiphertext },
      updatedAt: serverTimestamp(),
    });
    tx.set(doc(db, 'publicKeys', uid), {
      userId: uid,
      publicKey,
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

/** Reads and decrypts the current user's profile, or null if missing. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { ciphertexts?: Record<string, string> };
  const cipher = data.ciphertexts?.[uid];
  if (!cipher) return null;
  const plaintext = await decryptForSelf(cipher);
  return (plaintext as UserProfile) ?? null;
}

/** Looks up a uid by username via the deterministic hash index. */
export async function findUidByUsername(username: string): Promise<string | null> {
  const usernameHashValue = await hashUsername(username);
  const snap = await getDoc(doc(db, 'usernameIndex', usernameHashValue));
  if (!snap.exists()) return null;
  const data = snap.data() as { userId?: string };
  return data.userId ?? null;
}

/** Reads a user's public key from the unencrypted `publicKeys` collection. */
export async function getPublicKeyForUser(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'publicKeys', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { publicKey?: string };
  return data.publicKey ?? null;
}
