import { create } from 'zustand';
import { DismissedSignal, listDismissedSignals, dismissSignal, SnoozeType } from '../services/signals';
import { RomeFinding } from '../utils/romeIV';

interface SignalsState {
  dismissals: DismissedSignal[];
  loaded: boolean;
  loading: boolean;

  loadDismissals: (uid: string) => Promise<void>;
  dismiss: (uid: string, finding: RomeFinding, plainTitle: string, snoozeType: SnoozeType) => Promise<void>;
  clear: () => void;
}

export const useSignalsStore = create<SignalsState>((set, get) => ({
  dismissals: [],
  loaded: false,
  loading: false,

  loadDismissals: async uid => {
    if (get().loading || get().loaded) return;
    set({ loading: true });
    try {
      const dismissals = await listDismissedSignals(uid);
      set({ dismissals, loaded: true });
    } catch {
      // silently fail — signals are non-critical
    } finally {
      set({ loading: false });
    }
  },

  dismiss: async (uid, finding, plainTitle, snoozeType) => {
    const record = await dismissSignal(uid, finding, plainTitle, snoozeType);
    // Update in-place so the UI reacts immediately without a round-trip
    set(s => ({
      dismissals: [
        ...s.dismissals.filter(d => d.findingId !== finding.id),
        record,
      ],
    }));
  },

  clear: () => set({ dismissals: [], loaded: false, loading: false }),
}));
