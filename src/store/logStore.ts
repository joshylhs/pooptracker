import { create } from 'zustand';
import {
  LogDetails,
  LogEntry,
  editLog as svcEditLog,
  listAllLogs,
  quickLog as svcQuickLog,
  removeLog as svcRemoveLog,
  saveDetailedLog as svcSaveDetailedLog,
} from '../services/logs';
import { useFriendsStore } from './friendsStore';
import { useAuthStore } from './authStore';
import { checkAndAwardBadges, maybeIncrementNightOwl } from '../services/badgeService';

// Logs are part of the leaderboard's "self" row; any log mutation must
// invalidate that cache so the next Friends-tab visit shows the updated count.
function invalidateLeaderboardCache(): void {
  useFriendsStore.getState().invalidateLeaderboard();
}

function awardBadgesAsync(timestamp?: number): void {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return;
  const ts = timestamp ?? Date.now();
  void maybeIncrementNightOwl(uid, ts).then(() => checkAndAwardBadges(uid));
}

interface LogState {
  logs: LogEntry[];
  isInitialised: boolean;
  refresh: () => Promise<void>;
  quickLog: (timestamp?: number) => Promise<void>;
  saveDetailedLog: (details: LogDetails) => Promise<void>;
  editLog: (logId: string, patch: LogDetails) => Promise<void>;
  removeLog: (logId: string) => Promise<void>;
  clear: () => void;
}

async function reloadLogs(set: (state: Partial<LogState>) => void): Promise<void> {
  try {
    const logs = await listAllLogs();
    set({ logs, isInitialised: true });
  } catch {
    // listAllLogs throws when no user is signed in; treat as empty.
    set({ logs: [], isInitialised: true });
  }
}

export const useLogStore = create<LogState>(set => ({
  logs: [],
  isInitialised: false,

  refresh: () => reloadLogs(set),

  quickLog: async (timestamp) => {
    await svcQuickLog(timestamp);
    await reloadLogs(set);
    invalidateLeaderboardCache();
    awardBadgesAsync(timestamp);
  },

  saveDetailedLog: async details => {
    await svcSaveDetailedLog(details);
    await reloadLogs(set);
    invalidateLeaderboardCache();
    awardBadgesAsync(details.timestamp);
  },

  editLog: async (logId, patch) => {
    await svcEditLog(logId, patch);
    await reloadLogs(set);
    invalidateLeaderboardCache();
  },

  removeLog: async logId => {
    await svcRemoveLog(logId);
    await reloadLogs(set);
    invalidateLeaderboardCache();
  },

  clear: () => set({ logs: [], isInitialised: false }),
}));
