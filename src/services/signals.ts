import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { db } from './firebase';
import { RomeFinding } from '../utils/romeIV';

export type SignalState =
  | 'latest'      // detected, not yet acknowledged
  | 'current'     // acknowledged, still active in logs
  | 'resolved';   // no longer detected in logs

export interface AcknowledgedSignal {
  findingId: string;
  plainTitle: string;
  severity: RomeFinding['severity'];
  acknowledgedAt: number;
  state: SignalState;
  // Blood-specific: counts consecutive non-blood logs after acknowledgement.
  // Once it reaches 3, blood transitions to resolved automatically.
  cleanLogCount?: number;
}

export async function listAcknowledgedSignals(uid: string): Promise<AcknowledgedSignal[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'dismissedSignals'));
  return snap.docs.map(d => d.data() as AcknowledgedSignal);
}

export type FriendSignalStatus = 'urgent' | 'gp' | 'info' | 'clear';

/** Reads a trusted friend's dismissedSignals and returns their worst active severity. */
export async function fetchFriendSignalStatus(uid: string): Promise<FriendSignalStatus> {
  const signals = await listAcknowledgedSignals(uid);
  const active = signals.filter(s => s.state !== 'resolved');
  if (active.some(s => s.severity === 'urgent')) return 'urgent';
  if (active.some(s => s.severity === 'gp')) return 'gp';
  if (active.some(s => s.severity === 'info')) return 'info';
  return 'clear';
}

export async function acknowledgeSignal(
  uid: string,
  finding: RomeFinding,
  plainTitle: string,
): Promise<AcknowledgedSignal> {
  const record: AcknowledgedSignal = {
    findingId: finding.id,
    plainTitle,
    severity: finding.severity,
    acknowledgedAt: Date.now(),
    state: 'current',
    ...(finding.id === 'blood' ? { cleanLogCount: 0 } : {}),
  };
  await setDoc(doc(db, 'users', uid, 'dismissedSignals', finding.id), record);
  return record;
}

export async function resolveSignal(uid: string, findingId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'dismissedSignals', findingId), { state: 'resolved' });
}

export async function incrementBloodCleanCount(
  uid: string,
  current: AcknowledgedSignal,
): Promise<AcknowledgedSignal> {
  const newCount = (current.cleanLogCount ?? 0) + 1;
  const newState: SignalState = newCount >= 3 ? 'resolved' : 'current';
  const updated = { ...current, cleanLogCount: newCount, state: newState };
  await setDoc(doc(db, 'users', uid, 'dismissedSignals', 'blood'), updated);
  return updated;
}
