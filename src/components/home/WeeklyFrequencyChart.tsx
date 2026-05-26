import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { LogEntry } from '../../database/logRepository';

const WEEKS = 8;

function mondayOf(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(m.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function dateString(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function shortLabel(monday: Date): string {
  return monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface WeekBucket {
  label: string;
  count: number;
  startDate: string;
  endDate: string;
}

interface Props {
  logs: LogEntry[];
}

export default function WeeklyFrequencyChart({ logs }: Props) {
  const { surface, colours } = useTheme();

  const buckets: WeekBucket[] = useMemo(() => {
    const now = new Date();
    const thisMonday = mondayOf(now);

    const weeks: WeekBucket[] = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const start = new Date(thisMonday);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      weeks.push({
        label: shortLabel(start),
        count: 0,
        startDate: dateString(start),
        endDate: dateString(end),
      });
    }

    for (const log of logs) {
      for (const w of weeks) {
        if (log.date >= w.startDate && log.date <= w.endDate) {
          w.count++;
          break;
        }
      }
    }

    return weeks;
  }, [logs]);

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {buckets.map((b, i) => {
          const heightPct = b.count / maxCount;
          const isCurrentWeek = i === WEEKS - 1;
          return (
            <View key={b.startDate} style={styles.col}>
              <AppText style={[styles.countLabel, { color: b.count > 0 ? surface.textPrimary : 'transparent' }]}>
                {b.count}
              </AppText>
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPct * 100, b.count > 0 ? 4 : 0)}%`,
                      backgroundColor: isCurrentWeek ? colours.primary400 : colours.primary600,
                      opacity: b.count === 0 ? 0.15 : 1,
                    },
                  ]}
                />
              </View>
              <AppText style={[styles.weekLabel, { color: isCurrentWeek ? colours.primary400 : surface.textSecondary }]}>
                {b.label}
              </AppText>
            </View>
          );
        })}
      </View>
      <AppText variant="caption" colour="textSecondary" style={styles.footnote}>
        Weekly log counts · current week highlighted
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  col: { flex: 1, alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' },
  countLabel: { fontSize: 10, fontWeight: '600', height: 14 },
  barArea: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  weekLabel: { fontSize: 9, textAlign: 'center' },
  footnote: { marginTop: 4 },
});
