import { StyleSheet, View, Animated, PanResponder, LayoutChangeEvent } from 'react-native';
import { useMemo, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { LogEntry } from '../../database/logRepository';

const WEEKS = 6;
const CHART_H = 120;
const Y_AXIS_W = 32;
const LABEL_H = 18;
const AXIS_COLOR = 'rgba(255,255,255,0.35)';
const GRID_COLOR = 'rgba(255,255,255,0.15)';

const C_BELOW = '#854F0B';
const C_IDEAL = '#3B6D11';
const C_OVER  = '#D85A30';
const C_QUICK = 'rgba(255,255,255,0.15)';

const LEGEND = [
  { colour: C_BELOW, label: 'Too hard' },
  { colour: C_IDEAL, label: 'Ideal' },
  { colour: C_OVER,  label: 'Too loose' },
];

function mondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(m.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function dateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shortLabel(monday: Date): string {
  return monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function rangeLabel(startDate: string, endDate: string): string {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const sf = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const ef = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${sf} – ${ef}`;
}

function niceCeiling(max: number): number {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100];
  for (const s of steps) {
    const candidate = Math.ceil(max / s) * s;
    if (candidate / s >= 4 && candidate / s <= 8) return candidate;
  }
  return Math.ceil(max / 10) * 10;
}

function niceStep(ceiling: number): number {
  const targets = [4, 5, 6];
  for (const t of targets) {
    if (ceiling % t === 0) return ceiling / t;
  }
  return Math.ceil(ceiling / 5);
}

interface WeekBucket {
  label: string;
  below: number;
  ideal: number;
  over: number;
  quick: number;
  startDate: string;
  endDate: string;
}

export function deriveWeeklyInsight(logs: LogEntry[]): string | null {
  const now = new Date();
  const thisMonday = mondayOf(now);
  const weeks: WeekBucket[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    weeks.push({ label: '', below: 0, ideal: 0, over: 0, quick: 0, startDate: dateString(start), endDate: dateString(end) });
  }
  for (const log of logs) {
    const w = weeks.find(b => log.date >= b.startDate && log.date <= b.endDate);
    if (!w) continue;
    const t = log.bristolType;
    if (!t) w.quick++; else if (t <= 2) w.below++; else if (t <= 4) w.ideal++; else w.over++;
  }
  return deriveInsight(weeks);
}

function deriveInsight(buckets: WeekBucket[]): string | null {
  const current = buckets[buckets.length - 1];
  const past = buckets.slice(0, WEEKS - 1);

  const currentTotal = current.below + current.ideal + current.over + current.quick;
  const pastTotals = past.map(b => b.below + b.ideal + b.over + b.quick).filter(n => n > 0);

  if (pastTotals.length === 0 && currentTotal === 0) return null;

  const pastAvg = pastTotals.length > 0
    ? pastTotals.reduce((a, b) => a + b, 0) / pastTotals.length
    : null;

  let trend: 'up' | 'down' | 'steady' | 'none' | 'empty' = 'none';
  if (currentTotal === 0) {
    trend = 'empty';
  } else if (pastAvg !== null) {
    const diff = currentTotal - pastAvg;
    if (diff > 1) trend = 'up';
    else if (diff < -1) trend = 'down';
    else trend = 'steady';
  }

  const typed = current.below + current.ideal + current.over;
  let dominant: 'below' | 'ideal' | 'over' | 'mixed' | null = null;
  if (typed >= 2) {
    const max = Math.max(current.below, current.ideal, current.over);
    if (max === current.ideal && current.ideal > current.below + current.over) dominant = 'ideal';
    else if (max === current.below && current.below > current.ideal + current.over) dominant = 'below';
    else if (max === current.over && current.over > current.ideal + current.below) dominant = 'over';
    else dominant = 'mixed';
  }

  if (trend === 'empty') return 'Nothing logged this week yet.';
  if (trend === 'none' && dominant === 'ideal') return 'Most of your logs this week were ideal type (3-4), keep it up!';
  if (trend === 'none' && dominant === 'below') return 'Most logs this week were hard or lumpy stools (1-2). Try drinking more water and increasing fibre to help soften stools!';
  if (trend === 'none' && dominant === 'over') return 'Most logs this week were loose stools (5-7). Consider cutting back on caffeine, alcohol, or spicy food and see if things settle over the next few days!';
  if (trend === 'up' && dominant === 'ideal') return 'Frequency is up this week and most types were ideal. Good week!';
  if (trend === 'up' && dominant === 'below') return 'More logs but harder stools than usual. Try adding an extra glass of water in the morning and consider more fibre (e.g. fruit, veg, or wholegrains)!';
  if (trend === 'up' && dominant === 'over') return 'More logs with looser stools than usual. Try identifying any new foods or drinks introduced this week and cut back to see if it helps. If it persists beyond 3 days, consider speaking to a doctor!';
  if (trend === 'down' && dominant === 'ideal') return 'Fewer logs than usual this week though types look health, consider a short walk after meals!';
  if (trend === 'down' && dominant === 'below') return 'Frequency is down this week with more hard stools than usual. Aim for 8 glasses of water today, and consider adding fruit or oats to your next meal!';
  if (trend === 'down' && dominant === 'over') return "Frequency is down this week with more loose stools than usual. Get some rest and stick to bland foods like rice, toast, and bananas for a day. Also make sure you're staying hydrated with water or electrolytes!";
  if (trend === 'steady' && dominant === 'ideal') return 'Frequency is on track and types look healthy this week! Consistency like this is a great sign, keep your current routine going!';
  if (trend === 'steady' && dominant === 'below') return 'Normal frequency but harder stools than usual this week. Try swapping one daily drink for water and adding a piece of fruit, small changes can often help within a few days!';
  if (trend === 'steady' && dominant === 'over') return 'Normal frequency this week but looser stools than usual. Try reducing caffeine or dairy for a few days and see if consistency improves!';
  if (trend === 'up') return 'Frequency is up this week compared to your recent average!';
  if (trend === 'down') return "Frequency is down this week compared to your recent average. Try a 10 minute walk after your next few meals!";
  if (trend === 'steady') return 'Frequency is on track with your recent average, consistency is a good sign!';
  return null;
}

const TOOLTIP_W = 160;

interface TooltipState {
  bucket: WeekBucket;
  x: number;
}

interface Props {
  logs: LogEntry[];
}

export default function WeeklyFrequencyChart({ logs }: Props) {
  const { surface, colours } = useTheme();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const chartWidth = useRef(0);
  const longPressActive = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barsAreaX = useRef(0);
  const barsAreaY = useRef(0);
  const bucketsRef = useRef<WeekBucket[]>([]);
  const yMaxRef = useRef(1);

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
        below: 0, ideal: 0, over: 0, quick: 0,
        startDate: dateString(start),
        endDate: dateString(end),
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
  }, [logs]);

  const insight = useMemo(() => deriveInsight(buckets), [buckets]);

  const maxCount = Math.max(...buckets.map(b => b.below + b.ideal + b.over + b.quick), 1);
  const yMax = niceCeiling(maxCount);
  bucketsRef.current = buckets;
  yMaxRef.current = yMax;
  const step = niceStep(yMax);
  const tickCount = yMax / step;
  const yTicks = Array.from({ length: tickCount }, (_, i) => (i + 1) * step);

  // converts a count value to a pixel height from the bottom of the chart area
  const toH = (n: number) => (n / yMax) * CHART_H;

  const dismiss = () => {
    longPressActive.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    Animated.timing(tooltipOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => setTooltip(null));
  };

  const updateTooltip = (screenX: number) => {
    const localX = screenX - barsAreaX.current;
    const colW = chartWidth.current / WEEKS;
    const idx = Math.max(0, Math.min(WEEKS - 1, Math.floor(localX / colW)));
    const b = bucketsRef.current[idx];
    if (!b) return;
    const x = Math.max(0, Math.min(chartWidth.current - TOOLTIP_W, localX - TOOLTIP_W / 2));
    setTooltip({ bucket: b, x });
  };

  const isOverBar = (screenX: number, screenY: number): boolean => {
    const localX = screenX - barsAreaX.current;
    const localY = screenY - barsAreaY.current;
    const colW = chartWidth.current / WEEKS;
    const idx = Math.max(0, Math.min(WEEKS - 1, Math.floor(localX / colW)));
    const b = bucketsRef.current[idx];
    if (!b) return false;
    const total = b.below + b.ideal + b.over + b.quick;
    const barH = (total / yMaxRef.current) * CHART_H;
    const barTop = CHART_H - barH;
    return localY >= barTop && localY <= CHART_H;
  };

  const barsPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: () => longPressActive.current,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderMove: (_, gs) => {
      if (!longPressActive.current) return;
      updateTooltip(gs.moveX);
    },
    onPanResponderRelease: () => dismiss(),
    onPanResponderTerminate: () => {
      longPressActive.current = false;
      setTooltip(null);
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const tt = tooltip?.bucket;
  const ttTotal = tt ? tt.below + tt.ideal + tt.over + tt.quick : 0;

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        {LEGEND.map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.colour }]} />
            <AppText style={styles.legendLabel}>{item.label}</AppText>
          </View>
        ))}
      </View>

      {/* Chart: y-axis labels column + plot area */}
      <View style={styles.chartRow}>

        {/* Y-axis: labels + vertical line */}
        <View style={[styles.yAxis, { height: CHART_H + LABEL_H }]}>
          {yTicks.map(tick => (
            <AppText
              key={tick}
              style={[styles.yLabel, { position: 'absolute', top: CHART_H - toH(tick) - 6 }]}
            >
              {tick}
            </AppText>
          ))}
          {/* 0 label sits at the x-axis, above the week labels */}
          <AppText style={[styles.yLabel, { position: 'absolute', top: CHART_H - 6 }]}>0</AppText>
          {/* Vertical axis line — only covers chart area, stops at x-axis */}
          <View style={[styles.yAxisLine, { height: CHART_H }]} />
        </View>

        {/* Plot area: gridlines + bars + tooltip */}
        <View
          style={{ flex: 1 }}
          onLayout={(e: LayoutChangeEvent) => {
            chartWidth.current = e.nativeEvent.layout.width;
            e.target.measure((_x, _y, _w, _h, pageX, pageY) => {
              barsAreaX.current = pageX;
              barsAreaY.current = pageY;
            });
          }}
          {...barsPanResponder.panHandlers}
        >
          {/* Chart area: fixed height, contains gridlines and bars as layers */}
          <View style={{ height: CHART_H }}>

            {/* Layer 1: gridlines only */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {yTicks.map(tick => (
                <View
                  key={tick}
                  style={[styles.gridLine, { position: 'absolute', top: CHART_H - toH(tick), left: 0, right: 0 }]}
                />
              ))}
            </View>

            {/* Layer 2: bars — single responder handles long-press + drag */}
            <View
              style={styles.barsRow}
              onStartShouldSetResponder={() => true}
              onResponderGrant={e => {
                const sx = e.nativeEvent.pageX;
                const sy = e.nativeEvent.pageY;
                longPressTimer.current = setTimeout(() => {
                  if (!isOverBar(sx, sy)) return;
                  longPressActive.current = true;
                  updateTooltip(sx);
                  Animated.timing(tooltipOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
                }, 300);
              }}
              onResponderMove={e => {
                if (!longPressActive.current) return;
                updateTooltip(e.nativeEvent.pageX);
              }}
              onResponderRelease={() => dismiss()}
              onResponderTerminate={() => {
                longPressActive.current = false;
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
                setTooltip(null);
              }}
            >
              {buckets.map((b, i) => {
                const total = b.below + b.ideal + b.over + b.quick;
                const isCurrentWeek = i === WEEKS - 1;
                const belowH = toH(b.below);
                const idealH = toH(b.ideal);
                const overH  = toH(b.over);
                const quickH = toH(b.quick);
                const totalH = toH(total);

                return (
                  <View key={b.startDate} style={styles.col}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                      {total > 0 && (
                        <View style={[
                          { width: '100%', height: totalH, borderTopLeftRadius: 3, borderTopRightRadius: 3, overflow: 'hidden' },
                          isCurrentWeek && { borderWidth: 1, borderColor: colours.primary400 + '66' },
                        ]}>
                          {quickH > 0 && <View style={{ width: '100%', height: quickH, backgroundColor: C_QUICK }} />}
                          {overH  > 0 && <View style={{ width: '100%', height: overH,  backgroundColor: C_OVER  }} />}
                          {idealH > 0 && <View style={{ width: '100%', height: idealH, backgroundColor: C_IDEAL }} />}
                          {belowH > 0 && <View style={{ width: '100%', height: belowH, backgroundColor: C_BELOW }} />}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Layer 3: tooltip */}
            {tooltip && (
              <Animated.View
                style={[styles.tooltip, { opacity: tooltipOpacity, left: tooltip.x }]}
                pointerEvents="none"
              >
                <AppText style={[styles.tooltipDate, { color: surface.textSecondary }]}>
                  {rangeLabel(tt!.startDate, tt!.endDate)}
                </AppText>
                <AppText style={[styles.tooltipTotal, { color: surface.textPrimary }]}>
                  {ttTotal} {ttTotal === 1 ? 'log' : 'logs'}
                </AppText>
                {tt!.below > 0 && <AppText style={[styles.tooltipRow, { color: C_BELOW }]}>{tt!.below} Too hard (Type 1–2)</AppText>}
                {tt!.ideal > 0 && <AppText style={[styles.tooltipRow, { color: C_IDEAL }]}>{tt!.ideal} Ideal (Type 3–4)</AppText>}
                {tt!.over  > 0 && <AppText style={[styles.tooltipRow, { color: C_OVER  }]}>{tt!.over} Too loose (Type 5–7)</AppText>}
                {tt!.quick > 0 && <AppText style={[styles.tooltipRow, { color: surface.textSecondary }]}>{tt!.quick} untyped</AppText>}
                {ttTotal === 0  && <AppText style={[styles.tooltipRow, { color: surface.textSecondary }]}>No logs this week</AppText>}
              </Animated.View>
            )}

            {/* Layer 4: x-axis line on top of bars */}
            <View style={[styles.xAxisLine, { position: 'absolute', bottom: 0, left: 0, right: 0 }]} pointerEvents="none" />
          </View>

          {/* Week labels below chart area, aligned to bar columns */}
          <View style={styles.labelsRow}>
            {buckets.map((b, i) => (
              <AppText
                key={b.startDate}
                style={[styles.weekLabel, { color: i === WEEKS - 1 ? colours.primary400 : surface.textSecondary }]}
              >
                {b.label}
              </AppText>
            ))}
          </View>
        </View>
      </View>

      <AppText style={styles.footnote}>Hold a bar for detailed breakdown</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },

  chartRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 0 },

  yAxis: { width: Y_AXIS_W, position: 'relative' },
  yAxisLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: AXIS_COLOR,
  },
  yLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', width: Y_AXIS_W, textAlign: 'right', paddingRight: 5 },

  gridLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GRID_COLOR,
  },
  xAxisLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AXIS_COLOR,
  },

  barsRow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  col: { flex: 1, height: '100%' },

  labelsRow: { flexDirection: 'row', gap: 3, height: LABEL_H },
  weekLabel: { flex: 1, fontSize: 9, textAlign: 'center', lineHeight: LABEL_H },

  tooltip: {
    position: 'absolute',
    top: 4,
    width: TOOLTIP_W,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    gap: 3,
    zIndex: 10,
    backgroundColor: '#3A2F40',
  },
  tooltipDate: { fontSize: 10, marginBottom: 2 },
  tooltipTotal: { fontSize: 13, fontWeight: '600' },
  tooltipRow: { fontSize: 11 },

  footnote: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center' },
});
