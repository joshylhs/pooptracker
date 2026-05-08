import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { getUserProfile } from '../services/users';
import {
  loadFriends,
  loadPendingIncoming,
  loadPendingOutgoing,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  fetchLeaderboardWindow,
  FriendProfile,
  PendingFriend,
  LeaderboardEntry,
  LeaderboardWindow,
} from '../services/friends';

// Cache TTL for leaderboard + friends lists. Within this window, navigating
// back to the Friends tab reuses cached data — saves N–7N Firestore reads
// per visit. Pull-to-refresh and write actions bypass via `force: true`.
const CACHE_TTL_MS = 5 * 60 * 1000;

interface FriendsState {
  friends: FriendProfile[];
  pendingIncoming: PendingFriend[];
  pendingOutgoing: PendingFriend[];
  leaderboard: { window: LeaderboardWindow; entries: LeaderboardEntry[] } | null;
  loading: boolean;
  leaderboardLoading: boolean;
  error: string | null;

  // Cache freshness — null means "never fetched / invalidated".
  friendsFetchedAt: number | null;
  leaderboardFetchedAt: number | null;

  loadAll: (opts?: { force?: boolean }) => Promise<void>;
  loadLeaderboard: (window: LeaderboardWindow, opts?: { force?: boolean }) => Promise<void>;
  sendRequest: (targetUid: string) => Promise<void>;
  accept: (uid: string) => Promise<void>;
  decline: (uid: string) => Promise<void>;
  remove: (uid: string) => Promise<void>;
  invalidateLeaderboard: () => void;
  clear: () => void;
}

function isFresh(timestamp: number | null): boolean {
  return timestamp !== null && Date.now() - timestamp < CACHE_TTL_MS;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  pendingIncoming: [],
  pendingOutgoing: [],
  leaderboard: null,
  loading: false,
  leaderboardLoading: false,
  error: null,
  friendsFetchedAt: null,
  leaderboardFetchedAt: null,

  loadAll: async ({ force = false } = {}) => {
    if (!force && isFresh(get().friendsFetchedAt)) return;
    set({ loading: true, error: null });
    try {
      const [friends, pendingIncoming, pendingOutgoing] = await Promise.all([
        loadFriends(),
        loadPendingIncoming(),
        loadPendingOutgoing(),
      ]);
      set({ friends, pendingIncoming, pendingOutgoing, friendsFetchedAt: Date.now() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load friends.' });
    } finally {
      set({ loading: false });
    }
  },

  loadLeaderboard: async (window, { force = false } = {}) => {
    const uid = useAuthStore.getState().user?.uid;
    if (!uid) return;
    const cached = get().leaderboard;
    if (!force && cached?.window === window && isFresh(get().leaderboardFetchedAt)) return;

    set({ leaderboardLoading: true, error: null });
    try {
      const friends = get().friends.length ? get().friends : await loadFriends();
      const myProfile = await getUserProfile(uid);
      if (!myProfile) return;
      const entries = await fetchLeaderboardWindow(window, uid, friends, {
        username: myProfile.username,
        avatarInitials: myProfile.avatarInitials,
        avatarColour: myProfile.avatarColour,
      });
      set({ leaderboard: { window, entries }, leaderboardFetchedAt: Date.now() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load leaderboard.' });
    } finally {
      set({ leaderboardLoading: false });
    }
  },

  sendRequest: async targetUid => {
    await sendFriendRequest(targetUid);
    await get().loadAll({ force: true });
  },

  accept: async uid => {
    await acceptFriendRequest(uid);
    // Friendship change affects leaderboard membership too.
    set({ leaderboardFetchedAt: null });
    await get().loadAll({ force: true });
  },

  decline: async uid => {
    await declineFriendRequest(uid);
    await get().loadAll({ force: true });
  },

  remove: async uid => {
    await removeFriend(uid);
    set({ leaderboardFetchedAt: null });
    await get().loadAll({ force: true });
  },

  invalidateLeaderboard: () => set({ leaderboardFetchedAt: null }),

  clear: () => set({
    friends: [],
    pendingIncoming: [],
    pendingOutgoing: [],
    leaderboard: null,
    error: null,
    friendsFetchedAt: null,
    leaderboardFetchedAt: null,
  }),
}));
