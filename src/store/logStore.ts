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

// Logs are part of the leaderboard's "self" row; any log mutation must
// invalidate that cache so the next Friends-tab visit shows the updated count.
function invalidateLeaderboardCache(): void {
  useFriendsStore.getState().invalidateLeaderboard();
}

interface LogState {
  logs: LogEntry[];
  isInitialised: boolean;
  refresh: () => Promise<void>;
  quickLog: () => Promise<void>;
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

  quickLog: async () => {
    await svcQuickLog();
    await reloadLogs(set);
    invalidateLeaderboardCache();
  },

  saveDetailedLog: async details => {
    await svcSaveDetailedLog(details);
    await reloadLogs(set);
    invalidateLeaderboardCache();
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
