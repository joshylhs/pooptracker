import { create } from 'zustand';
import {
  AcknowledgedSignal,
  listAcknowledgedSignals,
  acknowledgeSignal,
  resolveSignal,
  incrementBloodCleanCount,
} from '../services/signals';
import { RomeFinding } from '../utils/romeIV';

interface SignalsState {
  acknowledged: AcknowledgedSignal[];
  loaded: boolean;
  loading: boolean;

  loadAcknowledged: (uid: string) => Promise<void>;
  acknowledge: (uid: string, finding: RomeFinding, plainTitle: string) => Promise<void>;
  resolve: (uid: string, findingId: string) => Promise<void>;
  // Called after each log save — increments blood clean count if blood is current,
  // and auto-resolves once 3 consecutive clean logs are reached.
  onLogSaved: (uid: string, hasBlood: boolean) => Promise<void>;
  clear: () => void;
}

export const useSignalsStore = create<SignalsState>((set, get) => ({
  acknowledged: [],
  loaded: false,
  loading: false,

  loadAcknowledged: async uid => {
    if (get().loading || get().loaded) return;
    set({ loading: true });
    try {
      const acknowledged = await listAcknowledgedSignals(uid);
      set({ acknowledged, loaded: true });
    } catch {
      // silently fail — signals are non-critical
    } finally {
      set({ loading: false });
    }
  },

  acknowledge: async (uid, finding, plainTitle) => {
    const record = await acknowledgeSignal(uid, finding, plainTitle);
    set(s => ({
      acknowledged: [
        ...s.acknowledged.filter(a => a.findingId !== finding.id),
        record,
      ],
    }));
  },

  resolve: async (uid, findingId) => {
    await resolveSignal(uid, findingId);
    set(s => ({
      acknowledged: s.acknowledged.map(a =>
        a.findingId === findingId ? { ...a, state: 'resolved' as const } : a,
      ),
    }));
  },

  onLogSaved: async (uid, hasBlood) => {
    const blood = get().acknowledged.find(
      a => a.findingId === 'blood' && a.state === 'current',
    );
    if (!blood) return;
    if (hasBlood) {
      // New blood log resets the clean count
      const reset = { ...blood, cleanLogCount: 0 };
      await acknowledgeSignal(uid, { id: 'blood', severity: 'urgent' }, blood.plainTitle);
      set(s => ({
        acknowledged: s.acknowledged.map(a => a.findingId === 'blood' ? reset : a),
      }));
    } else {
      const updated = await incrementBloodCleanCount(uid, blood);
      set(s => ({
        acknowledged: s.acknowledged.map(a => a.findingId === 'blood' ? updated : a),
      }));
    }
  },

  clear: () => set({ acknowledged: [], loaded: false, loading: false }),
}));
