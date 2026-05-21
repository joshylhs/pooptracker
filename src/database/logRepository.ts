import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import { db } from '../services/firebase';
import { formatDate } from '../utils/dateUtils';
import { BristolTypeNumber } from '../utils/bristolData';

// All log persistence goes through the native Firestore SDK. The SDK's
// persistent cache (enabled by default on @react-native-firebase) makes
// reads-from-cache free across sessions and queues writes when offline,
// flushing them when the network returns — even across app restarts.

export type SymptomScale = 'mild' | 'severe';

export interface Symptoms {
  blood?: boolean;
  pain?: SymptomScale | null;
  straining?: SymptomScale | null;
  bloating?: boolean;
  incomplete?: boolean;
  assisted?: boolean;
}

export interface LogEntry {
  logId: string;
  userId: string;
  timestamp: number;       // ms since epoch
  bristolType: BristolTypeNumber | null;
  symptoms: Symptoms;
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
  symptoms?: Symptoms;
  notes?: string | null;
  isQuickLog: boolean;
}

interface LogDoc {
  timestamp: number;
  bristolType: BristolTypeNumber | null;
  symptoms: Symptoms;
  notes: string | null;
  isQuickLog: boolean;
  date: string;
  createdAt: number;
  updatedAt: number;
}

function cleanSymptoms(s: Symptoms): Record<string, boolean | string> {
  return Object.fromEntries(
    Object.entries(s).filter(([, v]) => v !== undefined && v !== null),
  ) as Record<string, boolean | string>;
}

function logsCol(userId: string) {
  return collection(db, 'users', userId, 'logs');
}

function logRef(userId: string, logId: string) {
  return doc(db, 'users', userId, 'logs', logId);
}

function dailyRef(userId: string, date: string) {
  return doc(db, 'users', userId, 'dailySummaries', date);
}

function monthlyRef(userId: string, date: string) {
  return doc(db, 'users', userId, 'monthlyTotals', date.slice(0, 7));
}

function yearlyRef(userId: string, date: string) {
  return doc(db, 'users', userId, 'yearlyTotals', date.slice(0, 4));
}

function generateId(): string {
  // Time-prefixed random id — collision-resistant enough for on-device data.
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${stamp}-${random}`;
}

function docToEntry(userId: string, logId: string, data: LogDoc): LogEntry {
  return {
    logId,
    userId,
    timestamp: data.timestamp,
    bristolType: data.bristolType,
    symptoms: data.symptoms ?? {},
    notes: data.notes,
    isQuickLog: data.isQuickLog,
    date: data.date,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function insertLog(input: NewLogInput): Promise<LogEntry> {
  const now = Date.now();
  const timestamp = input.timestamp ?? now;
  const date = formatDate(new Date(timestamp));
  const entry: LogEntry = {
    logId: generateId(),
    userId: input.userId,
    timestamp,
    bristolType: input.bristolType ?? null,
    symptoms: input.symptoms ?? {},
    notes: input.notes ?? null,
    isQuickLog: input.isQuickLog,
    date,
    createdAt: now,
    updatedAt: now,
  };

  const docData: LogDoc = {
    timestamp: entry.timestamp,
    bristolType: entry.bristolType,
    symptoms: cleanSymptoms(entry.symptoms),
    notes: entry.notes,
    isQuickLog: entry.isQuickLog,
    date: entry.date,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };

  const batch = writeBatch(db);
  batch.set(logRef(input.userId, entry.logId), docData);
  batch.set(dailyRef(input.userId, date), { count: increment(1) }, { merge: true });
  batch.set(monthlyRef(input.userId, date), { count: increment(1) }, { merge: true });
  batch.set(yearlyRef(input.userId, date), { count: increment(1) }, { merge: true });
  await batch.commit();

  return entry;
}

export async function listLogsForUser(userId: string): Promise<LogEntry[]> {
  const snap = await getDocs(query(logsCol(userId), orderBy('timestamp', 'desc')));
  return snap.docs.map(d => docToEntry(userId, d.id, d.data() as LogDoc));
}

export async function getLogById(userId: string, logId: string): Promise<LogEntry | null> {
  const snap = await getDoc(logRef(userId, logId));
  if (!snap.exists()) return null;
  return docToEntry(userId, snap.id, snap.data() as LogDoc);
}

export async function listLogsForDate(userId: string, date: string): Promise<LogEntry[]> {
  const snap = await getDocs(
    query(logsCol(userId), where('date', '==', date), orderBy('timestamp', 'asc')),
  );
  return snap.docs.map(d => docToEntry(userId, d.id, d.data() as LogDoc));
}

export async function deleteLog(userId: string, logId: string): Promise<void> {
  const existing = await getLogById(userId, logId);
  if (!existing) return;

  const batch = writeBatch(db);
  batch.delete(logRef(userId, logId));
  batch.set(dailyRef(userId, existing.date), { count: increment(-1) }, { merge: true });
  batch.set(monthlyRef(userId, existing.date), { count: increment(-1) }, { merge: true });
  batch.set(yearlyRef(userId, existing.date), { count: increment(-1) }, { merge: true });
  await batch.commit();
}

export async function updateLog(
  userId: string,
  logId: string,
  patch: {
    bristolType?: BristolTypeNumber | null;
    symptoms?: Symptoms;
    notes?: string | null;
    timestamp?: number;
  },
): Promise<void> {
  const existing = await getLogById(userId, logId);
  if (!existing) return;

  const next: LogDoc = {
    timestamp: patch.timestamp ?? existing.timestamp,
    bristolType: patch.bristolType !== undefined ? patch.bristolType : existing.bristolType,
    symptoms: cleanSymptoms(patch.symptoms !== undefined ? patch.symptoms : existing.symptoms),
    notes: patch.notes !== undefined ? patch.notes : existing.notes,
    isQuickLog: existing.isQuickLog,
    date: patch.timestamp !== undefined
      ? formatDate(new Date(patch.timestamp))
      : existing.date,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  };

  const batch = writeBatch(db);
  batch.set(logRef(userId, logId), next);

  if (next.date !== existing.date) {
    batch.set(dailyRef(userId, existing.date), { count: increment(-1) }, { merge: true });
    batch.set(monthlyRef(userId, existing.date), { count: increment(-1) }, { merge: true });
    batch.set(yearlyRef(userId, existing.date), { count: increment(-1) }, { merge: true });
    batch.set(dailyRef(userId, next.date), { count: increment(1) }, { merge: true });
    batch.set(monthlyRef(userId, next.date), { count: increment(1) }, { merge: true });
    batch.set(yearlyRef(userId, next.date), { count: increment(1) }, { merge: true });
  }

  await batch.commit();
}
