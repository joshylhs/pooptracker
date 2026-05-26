import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { LogEntry } from '../../database/logRepository';
import { BRISTOL_TYPES, BristolTypeNumber } from '../../utils/bristolData';

interface Props {
  logs: LogEntry[];
  windowDays?: number;
}

export default function BristolDistributionChart({ logs, windowDays = 90 }: Props) {
  const { surface } = useTheme();

  const distribution = useMemo(() => {
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    const inWindow = logs.filter(l => l.timestamp >= cutoff && l.bristolType !== null);
    const total = inWindow.length;
    if (total === 0) return null;

    const counts = new Array(7).fill(0);
    for (const log of inWindow) {
      counts[(log.bristolType as BristolTypeNumber) - 1]++;
    }
    const maxCount = Math.max(...counts);
    return { counts, total, maxCount };
  }, [logs, windowDays]);

  if (!distribution) {
    return (
      <AppText variant="caption" colour="textSecondary" style={styles.empty}>
        No Bristol type data yet — tap a log entry and record the type.
      </AppText>
    );
  }

  const { counts, total, maxCount } = distribution;

  return (
    <View style={styles.container}>
      {BRISTOL_TYPES.map((bt, i) => {
        const count = counts[i];
        const ratio = maxCount > 0 ? count / maxCount : 0;
        const pctOfTotal = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <View key={bt.type} style={styles.row}>
            <AppText style={[styles.typeLabel, { color: surface.textSecondary }]}>
              {bt.type}
            </AppText>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { width: `${Math.max(ratio * 100, count > 0 ? 2 : 0)}%`, backgroundColor: bt.colour },
                ]}
              />
            </View>
            <AppText style={[styles.pctLabel, { color: count > 0 ? surface.textPrimary : surface.textSecondary }]}>
              {count > 0 ? `${pctOfTotal}%` : '—'}
            </AppText>
          </View>
        );
      })}
      <AppText variant="caption" colour="textSecondary" style={styles.footnote}>
        Last {windowDays} days · {total} recorded type{total !== 1 ? 's' : ''}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeLabel: { width: 16, fontSize: 12, textAlign: 'center', fontWeight: '600' },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5 },
  pctLabel: { width: 32, fontSize: 12, textAlign: 'right' },
  empty: { textAlign: 'center', paddingVertical: 8 },
  footnote: { marginTop: 4 },
});
