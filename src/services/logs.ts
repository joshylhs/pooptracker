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
import { loadNotificationPrefs } from './notificationPrefs';
import { suppressTodayIfNeeded } from './notifications';

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

function suppressNotificationAsync(): void {
  void loadNotificationPrefs().then(suppressTodayIfNeeded);
}

export async function quickLog(): Promise<LogEntry> {
  const userId = requireUserId();
  const entry = await repoInsertLog({ userId, isQuickLog: true });
  suppressNotificationAsync();
  return entry;
}

export async function saveDetailedLog(details: LogDetails): Promise<LogEntry> {
  const userId = requireUserId();
  const entry = await repoInsertLog({
    userId,
    timestamp: details.timestamp,
    bristolType: details.bristolType,
    duration: details.duration,
    notes: details.notes,
    isQuickLog: false,
  });
  suppressNotificationAsync();
  return entry;
}

export async function listAllLogs(): Promise<LogEntry[]> {
  return repoListLogsForUser(requireUserId());
}

export async function listLogsForDate(date: string): Promise<LogEntry[]> {
  return repoListLogsForDate(requireUserId(), date);
}

export async function editLog(logId: string, patch: LogDetails): Promise<void> {
  const userId = requireUserId();
  await repoUpdateLog(userId, logId, patch);
}

export async function removeLog(logId: string): Promise<void> {
  const userId = requireUserId();
  await repoDeleteLog(userId, logId);
}
