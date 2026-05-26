import { useMemo } from 'react';
import { useLogStore } from '../store/logStore';
import { useSignalsStore } from '../store/signalsStore';
import { assessRomeIV, RomeFinding } from '../utils/romeIV';
import { DismissedSignal } from '../services/signals';

export interface HealthFindings {
  /** Findings that are not currently snoozed — shown in banner + badge + Health Signals */
  active: RomeFinding[];
  /** All findings from the assessment, regardless of snooze state */
  all: RomeFinding[];
  /** All historical dismissal records */
  dismissals: DismissedSignal[];
  /** Computed banner/badge state */
  status: {
    colour: string;
    text: string;
    severity: 'urgent' | 'gp' | 'info' | 'none';
  };
}

export function useHealthFindings(): HealthFindings {
  const logs = useLogStore(s => s.logs);
  const dismissals = useSignalsStore(s => s.dismissals);

  return useMemo(() => {
    const all = assessRomeIV(logs);
    const now = Date.now();

    const snoozedIds = new Set(
      dismissals
        .filter(d => d.snoozedUntil > now)
        .map(d => d.findingId),
    );

    const active = all.filter(f => !snoozedIds.has(f.id));

    let status: HealthFindings['status'];
    if (active.some(f => f.severity === 'urgent')) {
      status = { colour: '#D85A30', text: 'blood logged — see health signals', severity: 'urgent' };
    } else {
      const gpCount = active.filter(f => f.severity === 'gp').length;
      if (gpCount > 0) {
        status = {
          colour: '#BA7517',
          text: `${gpCount} pattern${gpCount > 1 ? 's' : ''} detected`,
          severity: 'gp',
        };
      } else if (active.some(f => f.id === 'insufficient_data')) {
        status = { colour: '#7A6F60', text: 'keep logging for health signals', severity: 'none' };
      } else {
        status = { colour: '#1D9E75', text: 'no patterns flagged', severity: 'info' };
      }
    }

    return { active, all, dismissals, status };
  }, [logs, dismissals]);
}
