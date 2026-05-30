import { useMemo } from 'react';
import { useLogStore } from '../store/logStore';
import { useSignalsStore } from '../store/signalsStore';
import { assessRomeIV, RomeFinding } from '../utils/romeIV';
import { AcknowledgedSignal } from '../services/signals';

export interface HealthFindings {
  /** New, unacknowledged findings — drive stripe colour + badge */
  latest: RomeFinding[];
  /** Acknowledged, still active in logs */
  current: RomeFinding[];
  /** No longer detected in logs, or blood cleared via 3-clean-log rule */
  past: AcknowledgedSignal[];
  /** All raw findings from Rome IV assessment */
  all: RomeFinding[];
  /** All acknowledgement records */
  acknowledged: AcknowledgedSignal[];
  /** Stripe/badge status — driven by latest only */
  status: {
    colour: string;
    text: string;
    severity: 'urgent' | 'gp' | 'info' | 'none';
  };
  /** Number of unacknowledged findings for badge */
  latestCount: number;
}

export function useHealthFindings(): HealthFindings {
  const logs = useLogStore(s => s.logs);
  const acknowledged = useSignalsStore(s => s.acknowledged);

  return useMemo(() => {
    const all = assessRomeIV(logs);

    const acknowledgedIds = new Set(acknowledged.map(a => a.findingId));
    const currentIds = new Set(
      acknowledged.filter(a => a.state === 'current').map(a => a.findingId),
    );
    const resolvedIds = new Set(
      acknowledged.filter(a => a.state === 'resolved').map(a => a.findingId),
    );

    // LATEST: detected by Rome IV, not yet acknowledged (excludes info-only status findings)
    const latest = all.filter(
      f => !acknowledgedIds.has(f.id) &&
        f.id !== 'all_clear' &&
        f.id !== 'insufficient_data',
    );

    // CURRENT: acknowledged + still in active Rome IV findings
    const activeIds = new Set(all.map(f => f.id));
    const current = all.filter(
      f => currentIds.has(f.id) && activeIds.has(f.id) && !resolvedIds.has(f.id),
    );

    // PAST: acknowledged records that are resolved
    const past = acknowledged.filter(a => a.state === 'resolved');

    // Status driven by LATEST only
    let status: HealthFindings['status'];
    if (latest.some(f => f.severity === 'urgent')) {
      status = { colour: '#D85A30', text: 'blood logged — see health signals', severity: 'urgent' };
    } else if (latest.some(f => f.severity === 'gp')) {
      const gpCount = latest.filter(f => f.severity === 'gp').length;
      status = {
        colour: '#BA7517',
        text: `${gpCount} pattern${gpCount > 1 ? 's' : ''} flagged`,
        severity: 'gp',
      };
    } else if (all.some(f => f.id === 'insufficient_data')) {
      status = { colour: '#7A6F60', text: 'keep logging for health signals', severity: 'none' };
    } else {
      // Nothing in latest — green regardless of current
      status = { colour: '#1D9E75', text: 'no new patterns', severity: 'info' };
    }

    return {
      latest,
      current,
      past,
      all,
      acknowledged,
      status,
      latestCount: latest.length,
    };
  }, [logs, acknowledged]);
}
