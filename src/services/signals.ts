import {
  collection,
  doc,
  getDocs,
  setDoc,
} from '@react-native-firebase/firestore';
import { db } from './firebase';
import { RomeFinding } from '../utils/romeIV';

const SNOOZE_1D_MS = 1 * 24 * 60 * 60 * 1000;
// 90 days = assessment window; "dismiss" hides until the pattern itself resolves
const SNOOZE_DISMISS_MS = 90 * 24 * 60 * 60 * 1000;

export type SnoozeType = 'snooze1d' | 'dismiss';

export interface DismissedSignal {
  findingId: string;
  plainTitle: string;
  severity: RomeFinding['severity'];
  dismissedAt: number;
  snoozedUntil: number;
  snoozeType: SnoozeType;
}

export async function listDismissedSignals(uid: string): Promise<DismissedSignal[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'dismissedSignals'));
  return snap.docs.map(d => d.data() as DismissedSignal);
}

export async function dismissSignal(
  uid: string,
  finding: RomeFinding,
  plainTitle: string,
  snoozeType: SnoozeType,
): Promise<DismissedSignal> {
  const now = Date.now();
  const snoozeMs = snoozeType === 'snooze1d' ? SNOOZE_1D_MS : SNOOZE_DISMISS_MS;
  const record: DismissedSignal = {
    findingId: finding.id,
    plainTitle,
    severity: finding.severity,
    dismissedAt: now,
    snoozedUntil: now + snoozeMs,
    snoozeType,
  };
  await setDoc(doc(db, 'users', uid, 'dismissedSignals', finding.id), record);
  return record;
}
