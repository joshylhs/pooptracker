import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { LogEntry } from '../../database/logRepository';

const WEEKS = 6;
const CHART_H = 72;
const Y_AXIS_W = 16;

const C_BELOW = '#854F0B';
const C_IDEAL = '#3B6D11';
const C_OVER  = '#D85A30';
const C_QUICK = 'rgba(255,255,255,0.15)';

function mondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(m.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function dateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function niceStep(max: number): number {
  if (max <= 5)  return 1;
  if (max <= 10) return 2;
  if (max <= 20) return 5;
  return 10;
}

export interface WeekBucket {
  below: number;
  ideal: number;
  over: number;
  quick: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export function buildBuckets(logs: LogEntry[]): WeekBucket[] {
  const now = new Date();
  const thisMonday = mondayOf(now);
  const currentWeekStart = dateString(thisMonday);
  const weeks: WeekBucket[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startStr = dateString(start);
    weeks.push({
      below: 0, ideal: 0, over: 0, quick: 0,
      startDate: startStr,
      endDate: dateString(end),
      isCurrent: startStr === currentWeekStart,
    });
  }
  for (const log of logs) {
    const w = weeks.find(b => log.date >= b.startDate && log.date <= b.endDate);
    if (!w) continue;
    const t = log.bristolType;
    if (!t)          w.quick++;
    else if (t <= 2) w.below++;
    else if (t <= 4) w.ideal++;
    else             w.over++;
  }
  return weeks;
}

interface Props {
  logs: LogEntry[];
  label: string;
  /** If provided, forces the y-axis max to this value (for shared scale). */
  yMax?: number;
}

export default function MiniFrequencyChart({ logs, label, yMax: yMaxProp }: Props) {
  const { surface, colours } = useTheme();

  const buckets = useMemo(() => buildBuckets(logs), [logs]);
  const localMax = Math.max(...buckets.map(b => b.below + b.ideal + b.over + b.quick), 1);
  const step = niceStep(yMaxProp ?? localMax);
  const yMax = yMaxProp ?? Math.ceil(localMax / step) * step;
  const yTicks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);
  const px = (n: number) => (n / yMax) * CHART_H;

  return (
    <View style={styles.container}>
      <AppText style={[styles.label, { color: surface.textSecondary }]}>{label}</AppText>
      <View style={styles.chartRow}>
        {/* Y-axis */}
        <View style={[styles.yAxis, { height: CHART_H }]}>
          {yTicks.slice(1).map(tick => (
            <AppText
              key={tick}
              style={[styles.yLabel, { color: surface.textSecondary, top: CHART_H - px(tick) - 6 }]}
            >
              {tick}
            </AppText>
          ))}
        </View>

        {/* Bars area with gridlines */}
        <View style={[styles.barsArea, { height: CHART_H }]}>
          {/* Gridlines */}
          {yTicks.map(tick => (
            <View
              key={tick}
              style={[
                styles.gridline,
                { backgroundColor: surface.border, bottom: px(tick) },
              ]}
            />
          ))}

          {/* Bars */}
          {buckets.map((b, i) => {
            const total = b.below + b.ideal + b.over + b.quick;
            return (
              <View key={i} style={styles.col}>
                <View style={[styles.stack, { height: CHART_H }]}>
                  {total > 0 && (
                    <View style={[
                      styles.barClip,
                      b.isCurrent && { borderWidth: 1, borderColor: colours.primary400 + '66' },
                    ]}>
                      {b.quick > 0 && <View style={[styles.seg, { height: px(b.quick), backgroundColor: C_QUICK }]} />}
                      {b.over  > 0 && <View style={[styles.seg, { height: px(b.over),  backgroundColor: C_OVER  }]} />}
                      {b.ideal > 0 && <View style={[styles.seg, { height: px(b.ideal), backgroundColor: C_IDEAL }]} />}
                      {b.below > 0 && <View style={[styles.seg, { height: px(b.below), backgroundColor: C_BELOW }]} />}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 4 },
  label: { fontSize: 11, textAlign: 'center', letterSpacing: 0.3 },
  chartRow: { flexDirection: 'row' },
  yAxis: { width: Y_AXIS_W, position: 'relative' },
  yLabel: { position: 'absolute', fontSize: 8, right: 2 },
  barsArea: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, position: 'relative' },
  gridline: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  col: { flex: 1, position: 'relative' },
  stack: { justifyContent: 'flex-end' },
  barClip: {
    overflow: 'hidden',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  seg: { width: '100%' },
});
