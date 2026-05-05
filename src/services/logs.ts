import { useAuthStore } from '../store/authStore';
import {
  LogEntry,
  insertLog as repoInsertLog,
  listLogsForUser as repoListLogsForUser,
  listLogsForDate as repoListLogsForDate,
  deleteLog as repoDeleteLog,
  updateLog as repoUpdateLog,
  getLogById as repoGetLogById,
} from '../database/logRepository';
import { BristolTypeNumber } from '../utils/bristolData';
import { formatDate } from '../utils/dateUtils';
import { syncDailySummary } from './dailySummaries';
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

function syncDates(uid: string, dates: Iterable<string>): void {
  for (const date of new Set(dates)) {
    void syncDailySummary(uid, date);
  }
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

export function quickLog(): LogEntry {
  const userId = requireUserId();
  const entry = repoInsertLog({ userId, isQuickLog: true });
  syncDates(userId, [entry.date]);
  suppressNotificationAsync();
  return entry;
}

export function saveDetailedLog(details: LogDetails): LogEntry {
  const userId = requireUserId();
  const entry = repoInsertLog({
    userId,
    timestamp: details.timestamp,
    bristolType: details.bristolType,
    duration: details.duration,
    notes: details.notes,
    isQuickLog: false,
  });
  syncDates(userId, [entry.date]);
  suppressNotificationAsync();
  return entry;
}

export function listAllLogs(): LogEntry[] {
  return repoListLogsForUser(requireUserId());
}

export function listLogsForDate(date: string): LogEntry[] {
  return repoListLogsForDate(requireUserId(), date);
}

export function editLog(logId: string, patch: LogDetails): void {
  const userId = requireUserId();
  const previous = repoGetLogById(logId);
  repoUpdateLog(logId, patch);

  const dates: string[] = [];
  if (previous) dates.push(previous.date);
  if (patch.timestamp !== undefined) {
    dates.push(formatDate(new Date(patch.timestamp)));
  }
  syncDates(userId, dates);
}

export function removeLog(logId: string): void {
  const userId = requireUserId();
  const previous = repoGetLogById(logId);
  repoDeleteLog(logId);
  if (previous) syncDates(userId, [previous.date]);
}
