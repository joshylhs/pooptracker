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

interface LogState {
  logs: LogEntry[];
  isInitialised: boolean;
  refresh: () => void;
  quickLog: () => void;
  saveDetailedLog: (details: LogDetails) => void;
  editLog: (logId: string, patch: LogDetails) => void;
  removeLog: (logId: string) => void;
  clear: () => void;
}

export const useLogStore = create<LogState>(set => ({
  logs: [],
  isInitialised: false,

  refresh: () => {
    try {
      const logs = listAllLogs();
      set({ logs, isInitialised: true });
    } catch {
      // listAllLogs throws when no user is signed in; treat as empty.
      set({ logs: [], isInitialised: true });
    }
  },

  quickLog: () => {
    svcQuickLog();
    set({ logs: listAllLogs() });
  },

  saveDetailedLog: details => {
    svcSaveDetailedLog(details);
    set({ logs: listAllLogs() });
  },

  editLog: (logId, patch) => {
    svcEditLog(logId, patch);
    set({ logs: listAllLogs() });
  },

  removeLog: logId => {
    svcRemoveLog(logId);
    set({ logs: listAllLogs() });
  },

  clear: () => set({ logs: [], isInitialised: false }),
}));
