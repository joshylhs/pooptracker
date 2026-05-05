import { getDB } from './schema';
import { formatDate } from '../utils/dateUtils';
import { BristolTypeNumber } from '../utils/bristolData';

export interface LogEntry {
  logId: string;
  userId: string;
  timestamp: number;       // ms since epoch
  bristolType: BristolTypeNumber | null;
  duration: number | null; // minutes
  notes: string | null;
  isQuickLog: boolean;
  date: string;            // "YYYY-MM-DD" — derived from timestamp
  createdAt: number;
  updatedAt: number;
}

export interface NewLogInput {
  userId: string;
  timestamp?: number;
  bristolType?: BristolTypeNumber | null;
  duration?: number | null;
  notes?: string | null;
  isQuickLog: boolean;
}

interface LogRow {
  log_id: string;
  user_id: string;
  timestamp: number;
  bristol_type: number | null;
  duration: number | null;
  notes: string | null;
  is_quick_log: number;
  date: string;
  created_at: number;
  updated_at: number;
}

function rowToEntry(row: LogRow): LogEntry {
  return {
    logId: row.log_id,
    userId: row.user_id,
    timestamp: row.timestamp,
    bristolType: row.bristol_type as BristolTypeNumber | null,
    duration: row.duration,
    notes: row.notes,
    isQuickLog: row.is_quick_log === 1,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  // Time-prefixed random id — collision-resistant enough for on-device data.
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${stamp}-${random}`;
}

export function insertLog(input: NewLogInput): LogEntry {
  const db = getDB();
  const now = Date.now();
  const timestamp = input.timestamp ?? now;
  const entry: LogEntry = {
    logId: generateId(),
    userId: input.userId,
    timestamp,
    bristolType: input.bristolType ?? null,
    duration: input.duration ?? null,
    notes: input.notes ?? null,
    isQuickLog: input.isQuickLog,
    date: formatDate(new Date(timestamp)),
    createdAt: now,
    updatedAt: now,
  };

  db.executeSync(
    `INSERT INTO logs (log_id, user_id, timestamp, bristol_type, duration, notes,
                       is_quick_log, date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.logId,
      entry.userId,
      entry.timestamp,
      entry.bristolType,
      entry.duration,
      entry.notes,
      entry.isQuickLog ? 1 : 0,
      entry.date,
      entry.createdAt,
      entry.updatedAt,
    ],
  );

  return entry;
}

export function listLogsForUser(userId: string): LogEntry[] {
  const db = getDB();
  const result = db.executeSync(
    `SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC`,
    [userId],
  );
  return (result.rows as unknown as LogRow[]).map(rowToEntry);
}

export function getLogById(logId: string): LogEntry | null {
  const db = getDB();
  const result = db.executeSync(`SELECT * FROM logs WHERE log_id = ?`, [logId]);
  const rows = result.rows as unknown as LogRow[];
  return rows.length > 0 ? rowToEntry(rows[0]) : null;
}

export function listLogsForDate(userId: string, date: string): LogEntry[] {
  const db = getDB();
  const result = db.executeSync(
    `SELECT * FROM logs WHERE user_id = ? AND date = ? ORDER BY timestamp ASC`,
    [userId, date],
  );
  return (result.rows as unknown as LogRow[]).map(rowToEntry);
}

export function deleteLog(logId: string): void {
  getDB().execute(`DELETE FROM logs WHERE log_id = ?`, [logId]);
}

export function updateLog(
  logId: string,
  patch: {
    bristolType?: BristolTypeNumber | null;
    duration?: number | null;
    notes?: string | null;
    timestamp?: number;
  },
): void {
  const db = getDB();
  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (patch.bristolType !== undefined) {
    updates.push('bristol_type = ?');
    params.push(patch.bristolType);
  }
  if (patch.duration !== undefined) {
    updates.push('duration = ?');
    params.push(patch.duration);
  }
  if (patch.notes !== undefined) {
    updates.push('notes = ?');
    params.push(patch.notes);
  }
  if (patch.timestamp !== undefined) {
    updates.push('timestamp = ?', 'date = ?');
    params.push(patch.timestamp, formatDate(new Date(patch.timestamp)));
  }
  if (updates.length === 0) return;

  updates.push('updated_at = ?');
  params.push(Date.now());
  params.push(logId);

  db.executeSync(`UPDATE logs SET ${updates.join(', ')} WHERE log_id = ?`, params);
}
