import { useAuthStore } from '../store/authStore';
import {
  LogEntry,
  insertLog as repoInsertLog,
  listLogsForUser as repoListLogsForUser,
  listLogsForDate as repoListLogsForDate,
  deleteLog as repoDeleteLog,
  updateLog as repoUpdateLog,
} from '../database/logRepository';
import { BristolTypeNumber } from '../utils/bristolData';

export type { LogEntry };

function requireUserId(): string {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw new Error('No authenticated user; cannot read or write logs.');
  }
  return user.uid;
}

export interface LogDetails {
  bristolType?: BristolTypeNumber | null;
  duration?: number | null;
  notes?: string | null;
  timestamp?: number;
}

export function quickLog(): LogEntry {
  return repoInsertLog({
    userId: requireUserId(),
    isQuickLog: true,
  });
}

export function saveDetailedLog(details: LogDetails): LogEntry {
  return repoInsertLog({
    userId: requireUserId(),
    timestamp: details.timestamp,
    bristolType: details.bristolType,
    duration: details.duration,
    notes: details.notes,
    isQuickLog: false,
  });
}

export function listAllLogs(): LogEntry[] {
  return repoListLogsForUser(requireUserId());
}

export function listLogsForDate(date: string): LogEntry[] {
  return repoListLogsForDate(requireUserId(), date);
}

export function editLog(logId: string, patch: LogDetails): void {
  repoUpdateLog(logId, patch);
}

export function removeLog(logId: string): void {
  repoDeleteLog(logId);
}
