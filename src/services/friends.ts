import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import { db } from './firebase';
import { getUserProfile } from './users';
import { useAuthStore } from '../store/authStore';
import { formatDate, addDays } from '../utils/dateUtils';
import { hashUsername } from '../utils/encryption';
import { AvatarConfig } from '../components/avatar';

export type LeaderboardWindow = 'day' | 'week' | 'month' | 'year';

export interface FriendRecord {
  friendId: string;
  status: 'pending' | 'accepted';
  initiatedBy: string;
  createdAt: number;
  acceptedAt: number | null;
}

export interface FriendProfile {
  uid: string;
  username: string;
  avatarInitials: string;
  avatarColour: string;
  avatarEmoji?: string;
  avatarConfig?: AvatarConfig;
  allowPokes: boolean;
}

export interface PendingFriend {
  uid: string;
  username: string;
  avatarInitials: string;
  avatarColour: string;
  avatarEmoji?: string;
}

export interface LeaderboardEntry {
  uid: string;
  username: string;
  avatarInitials: string;
  avatarColour: string;
  avatarEmoji?: string;
  avatarConfig?: AvatarConfig;
  count: number;
  isSelf: boolean;
  allowPokes: boolean;
}

export interface UserSearchResult {
  uid: string;
  username: string;
  avatarInitials: string;
  avatarColour: string;
  avatarEmoji?: string;
}

const AVATAR_PALETTE = [
  '#7F77DD', '#534AB7', '#3B6D11', '#639922',
  '#BA7517', '#854F0B', '#993C1D', '#D85A30',
];

function deriveAvatarColour(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function deriveAvatarInitials(username: string): string {
  return username.trim().slice(0, 2).toUpperCase();
}

function requireUid(): string {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

/** Hash → usernameIndex lookup. Returns null if not found. */
export async function searchUser(username: string): Promise<UserSearchResult | null> {
  const hash = await hashUsername(username);
  const snap = await getDoc(doc(db, 'usernameIndex', hash));
  if (!snap.exists()) return null;
  const data = snap.data() as { userId?: string } | undefined;
  if (!data?.userId) return null;
  return {
    uid: data.userId,
    username,
    avatarInitials: deriveAvatarInitials(username),
    avatarColour: deriveAvatarColour(data.userId),
  };
}

/**
 * Sends a friend request. Both sides get a friendship record.
 * Recipient can read requester's profile via the knowsUser rule once the
 * record exists — no encrypted name fields needed.
 */
export async function sendFriendRequest(targetUid: string): Promise<void> {
  const myUid = requireUid();
  const batch = writeBatch(db);

  batch.set(doc(db, 'friendships', myUid, 'friends', targetUid), {
    friendId: targetUid,
    status: 'pending',
    initiatedBy: myUid,
    createdAt: serverTimestamp(),
    acceptedAt: null,
  });

  batch.set(doc(db, 'friendships', targetUid, 'friends', myUid), {
    friendId: myUid,
    status: 'pending',
    initiatedBy: myUid,
    createdAt: serverTimestamp(),
    acceptedAt: null,
  });

  await batch.commit();
}

export async function acceptFriendRequest(requesterId: string): Promise<void> {
  const myUid = requireUid();
  const batch = writeBatch(db);
  batch.update(doc(db, 'friendships', myUid, 'friends', requesterId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'friendships', requesterId, 'friends', myUid), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function declineFriendRequest(requesterId: string): Promise<void> {
  const myUid = requireUid();
  const batch = writeBatch(db);
  batch.delete(doc(db, 'friendships', myUid, 'friends', requesterId));
  batch.delete(doc(db, 'friendships', requesterId, 'friends', myUid));
  await batch.commit();
}

export async function removeFriend(friendId: string): Promise<void> {
  const myUid = requireUid();
  const batch = writeBatch(db);
  batch.delete(doc(db, 'friendships', myUid, 'friends', friendId));
  batch.delete(doc(db, 'friendships', friendId, 'friends', myUid));
  await batch.commit();
}

async function loadOtherProfile(uid: string): Promise<FriendProfile> {
  const fallback: FriendProfile = {
    uid,
    username: '(syncing…)',
    avatarInitials: '?',
    avatarColour: deriveAvatarColour(uid),
    allowPokes: true,
  };
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return fallback;
    return {
      uid,
      username: profile.username,
      avatarInitials: profile.avatarInitials,
      avatarColour: profile.avatarColour,
      avatarEmoji: profile.avatarEmoji,
      avatarConfig: profile.avatarConfig,
      allowPokes: profile.allowPokes,
    };
  } catch {
    return fallback;
  }
}

/** Loads accepted friends with their profiles. */
export async function loadFriends(): Promise<FriendProfile[]> {
  const myUid = requireUid();
  const snap = await getDocs(
    query(
      collection(db, 'friendships', myUid, 'friends'),
      where('status', '==', 'accepted'),
    ),
  );
  return Promise.all(snap.docs.map(d => loadOtherProfile(d.id)));
}

/** Returns pending incoming requests (sent by others). */
export async function loadPendingIncoming(): Promise<PendingFriend[]> {
  const myUid = requireUid();
  const snap = await getDocs(
    query(
      collection(db, 'friendships', myUid, 'friends'),
      where('status', '==', 'pending'),
    ),
  );
  // Filter client-side: incoming = not initiated by me. Avoids a composite index.
  const incoming = snap.docs.filter(
    d => (d.data() as FriendRecord).initiatedBy !== myUid,
  );
  return Promise.all(incoming.map(d => loadOtherProfile(d.id)));
}

/** Returns pending outgoing requests (sent by me). */
export async function loadPendingOutgoing(): Promise<PendingFriend[]> {
  const myUid = requireUid();
  const snap = await getDocs(
    query(
      collection(db, 'friendships', myUid, 'friends'),
      where('status', '==', 'pending'),
      where('initiatedBy', '==', myUid),
    ),
  );
  return Promise.all(snap.docs.map(d => loadOtherProfile(d.id)));
}

// --- Leaderboard ---

async function readCount(path: [string, string, string, string]): Promise<number> {
  const snap = await getDoc(doc(db, ...path));
  if (!snap.exists()) return 0;
  const data = snap.data() as { count?: number } | undefined;
  return data?.count ?? 0;
}

async function fetchUserCountForWindow(
  userId: string,
  window: LeaderboardWindow,
): Promise<number> {
  const today = new Date();
  switch (window) {
    case 'day':
      return readCount(['users', userId, 'dailySummaries', formatDate(today)]);
    case 'week': {
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = addDays(today, diffToMonday);
      const dates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(monday, i)));
      const counts = await Promise.all(
        dates.map(d => readCount(['users', userId, 'dailySummaries', d])),
      );
      return counts.reduce((a, b) => a + b, 0);
    }
    case 'month': {
      const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      return readCount(['users', userId, 'monthlyTotals', ym]);
    }
    case 'year':
      return readCount(['users', userId, 'yearlyTotals', String(today.getFullYear())]);
  }
}

export async function fetchLeaderboardWindow(
  window: LeaderboardWindow,
  myUid: string,
  friends: FriendProfile[],
  myDisplayProfile: { username: string; avatarInitials: string; avatarColour: string; avatarEmoji?: string; avatarConfig?: AvatarConfig },
): Promise<LeaderboardEntry[]> {
  const [selfCount, friendEntries] = await Promise.all([
    fetchUserCountForWindow(myUid, window),
    Promise.all(
      friends.map(async (f): Promise<LeaderboardEntry> => ({
        uid: f.uid,
        username: f.username,
        avatarInitials: f.avatarInitials,
        avatarColour: f.avatarColour,
        avatarEmoji: f.avatarEmoji,
        avatarConfig: f.avatarConfig,
        count: await fetchUserCountForWindow(f.uid, window),
        isSelf: false,
        allowPokes: f.allowPokes,
      })),
    ),
  ]);

  const entries: LeaderboardEntry[] = [
    { uid: myUid, ...myDisplayProfile, count: selfCount, isSelf: true, allowPokes: true },
    ...friendEntries,
  ];
  entries.sort((a, b) => b.count !== a.count ? b.count - a.count : a.username.localeCompare(b.username));
  return entries;
}
