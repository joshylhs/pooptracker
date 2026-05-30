import { collection, getDocs, query, orderBy, where } from '@react-native-firebase/firestore';
import { db } from './firebase';
import { LogEntry } from '../database/logRepository';

/** Fetches a trusted friend's logs for the last N days. Requires isTrustedBy rule. */
export async function fetchFriendLogs(uid: string, days: number = 42): Promise<LogEntry[]> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'logs'),
      where('timestamp', '>=', cutoff),
      orderBy('timestamp', 'desc'),
    ),
  );
  return snap.docs.map(d => d.data() as LogEntry);
}
