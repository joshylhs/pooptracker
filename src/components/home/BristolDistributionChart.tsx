import { useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { LogEntry } from '../../database/logRepository';
import { BristolTypeNumber } from '../../utils/bristolData';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  logs: LogEntry[];
  windowDays?: number;
}

const GROUPS = [
  { key: 'hard',    label: 'Too hard',  types: [1, 2]    as number[], colour: '#854F0B' },
  { key: 'ideal',   label: 'Ideal',     types: [3, 4]    as number[], colour: '#3B6D11' },
  { key: 'loose',   label: 'Too loose', types: [5, 6, 7] as number[], colour: '#D85A30' },
  { key: 'untyped', label: 'Untyped',   types: []        as number[], colour: '#6B7280' },
];

const SIZE    = 160;
const CX      = SIZE / 2;
const CY      = SIZE / 2;
const R_OUTER = 68;
const R_INNER = 40;
const EXPAND  = 5;

const SPRING = { tension: 280, friction: 26, useNativeDriver: false } as const;
const FADE   = { duration: 140, useNativeDriver: false } as const;

function toRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

function pt(r: number, deg: number) {
  const a = toRad(deg);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function arc(startDeg: number, endDeg: number, ro: number, ri: number): string {
  const p1 = pt(ro, startDeg);
  const p2 = pt(ro, endDeg);
  const p3 = pt(ri, endDeg);
  const p4 = pt(ri, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${ro} ${ro} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${ri} ${ri} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

const SEAM = 0.5; // degrees each non-first segment overlaps under its predecessor

export default function BristolDistributionChart({ logs, windowDays = 90 }: Props) {
  const { surface } = useTheme();
  // Fill: untyped uses a translucent tint matching the bar chart's untyped bar colour
  const groupFill = (i: number) => i === 3 ? 'rgba(255,255,255,0.18)' : GROUPS[i].colour;
  // Text: untyped uses a readable muted tone for centre stat / tooltip
  const groupText = (i: number) => i === 3 ? surface.textSecondary : GROUPS[i].colour;
  const [tooltipGroupIndex, setTooltipGroupIndex] = useState<number | null>(null);

  const segOpacity = useRef(GROUPS.map(() => new Animated.Value(1))).current;
  const segExpand  = useRef(GROUPS.map(() => new Animated.Value(0))).current;

  const statOpacity    = useRef(new Animated.Value(1)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = (i: number) => {
    setTooltipGroupIndex(i);
    Animated.parallel([
      ...segOpacity.map((a, j) => Animated.spring(a, { toValue: j === i ? 1 : 0.3, ...SPRING })),
      Animated.spring(segExpand[i], { toValue: 1, ...SPRING }),
      Animated.timing(statOpacity,    { toValue: 0, ...FADE }),
      Animated.timing(tooltipOpacity, { toValue: 1, ...FADE }),
    ]).start();
  };

  const handlePressOut = (i: number) => {
    Animated.parallel([
      ...segOpacity.map(a => Animated.spring(a, { toValue: 1, ...SPRING })),
      Animated.spring(segExpand[i], { toValue: 0, ...SPRING }),
      Animated.timing(tooltipOpacity, { toValue: 0, ...FADE }),
      Animated.timing(statOpacity,    { toValue: 1, ...FADE }),
    ]).start();
    // Do NOT clear tooltipGroupIndex here — let it hold the last value so
    // the tooltip content stays correct during the fade-out animation.
  };

  const distribution = useMemo(() => {
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    const inWindow = logs.filter(l => l.timestamp >= cutoff);
    const total = inWindow.length;
    if (total === 0) return null;
    const counts = new Array(7).fill(0);
    let untypedCount = 0;
    for (const log of inWindow) {
      if (log.bristolType !== null) {
        counts[(log.bristolType as BristolTypeNumber) - 1]++;
      } else {
        untypedCount++;
      }
    }
    return { counts, untypedCount, total };
  }, [logs, windowDays]);

  if (!distribution) {
    return (
      <AppText variant="caption" colour="textSecondary" style={styles.empty}>
        No Bristol type data yet — tap a log entry and record the type.
      </AppText>
    );
  }

  const { counts, untypedCount, total } = distribution;

  const groupCounts = GROUPS.map((g, i) =>
    i === 3 ? untypedCount : g.types.reduce((s, t) => s + counts[t - 1], 0),
  );
  const groupPcts = groupCounts.map(c => Math.round((c / total) * 100));

  let cursor = 0;
  const segments = GROUPS.map((g, i) => {
    if (groupCounts[i] === 0) return null;
    const sweep    = Math.min((groupCounts[i] / total) * 360, 359.99);
    const startDeg = cursor > 0 ? cursor - SEAM : cursor;
    cursor += sweep;
    return { group: g, i, startDeg, endDeg: cursor, pct: groupPcts[i] };
  });

  const tooltipRows: { label: string; pct: number }[] = tooltipGroupIndex !== null
    ? GROUPS[tooltipGroupIndex].types
        .map(t => ({
          label: `Type ${t}`,
          pct: total > 0 ? Math.round((counts[t - 1] / total) * 100) : 0,
        }))
        .filter(r => r.pct > 0)
    : [];
  const tooltipPct = tooltipGroupIndex !== null ? groupPcts[tooltipGroupIndex] : 0;
  const tooltipColour = tooltipGroupIndex !== null ? groupText(tooltipGroupIndex) : '#fff';
  const tooltipLabel  = tooltipGroupIndex !== null ? GROUPS[tooltipGroupIndex].label : '';

  return (
    <View style={styles.container}>
      {/* Donut + floating tooltip wrapper */}
      <View style={styles.donutWrapper}>
        <View style={styles.wrap}>
          <Svg width={SIZE} height={SIZE}>
            {segments.map(seg => {
              if (!seg) return null;
              const animD = segExpand[seg.i].interpolate({
                inputRange:  [0, 1],
                outputRange: [
                  arc(seg.startDeg, seg.endDeg, R_OUTER, R_INNER),
                  arc(seg.startDeg, seg.endDeg, R_OUTER + EXPAND, R_INNER),
                ],
              });
              return (
                <AnimatedPath
                  key={seg.group.key}
                  d={animD}
                  fill={groupFill(seg.i)}
                  opacity={segOpacity[seg.i]}
                  onPressIn={() => handlePressIn(seg.i)}
                  onPressOut={() => handlePressOut(seg.i)}
                />
              );
            })}
          </Svg>

          {/* Centre stats (idle state) */}
          <View style={styles.centre} pointerEvents="none">
            <Animated.View style={[styles.centreSlot, { opacity: statOpacity }]}>
              <AppText style={[styles.centreStat, { color: GROUPS[0].colour }]}>{groupPcts[0]}% hard</AppText>
              <AppText style={[styles.centreStatMain, { color: GROUPS[1].colour }]}>{groupPcts[1]}% ideal</AppText>
              <AppText style={[styles.centreStat, { color: GROUPS[2].colour }]}>{groupPcts[2]}% loose</AppText>
            </Animated.View>
          </View>
        </View>

        {/* Floating tooltip — overlays the donut, centred above it */}
        <Animated.View
          pointerEvents="none"
          style={[styles.tooltip, { opacity: tooltipOpacity }]}
        >
          <AppText style={[styles.tooltipGroup, { color: tooltipColour }]}>
            {tooltipLabel}
          </AppText>
          {tooltipRows.length > 0 ? tooltipRows.map(row => (
            <View key={row.label} style={styles.tooltipRow}>
              <AppText style={styles.tooltipTypeLabel}>{row.label}</AppText>
              <AppText style={[styles.tooltipTypePct, { color: tooltipColour }]}>{row.pct}%</AppText>
            </View>
          )) : (
            <AppText style={[styles.tooltipTypePct, { color: tooltipColour }]}>{tooltipPct}%</AppText>
          )}
        </Animated.View>
      </View>

      <AppText style={styles.hint}>Hold a segment to see the breakdown</AppText>
      {untypedCount > 0 && (
        <AppText style={styles.untypedNote}>{untypedCount} untyped</AppText>
      )}
      <AppText variant="caption" colour="textSecondary" style={styles.footnote}>
        Last {windowDays} days · {total} log{total !== 1 ? 's' : ''}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },

  donutWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: { width: SIZE, height: SIZE, flexShrink: 0 },
  centre: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  centreSlot: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  centreStat:     { fontSize: 10, fontWeight: '500', textAlign: 'center' },
  centreStatMain: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  tooltip: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#2A1F30',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  tooltipGroup:    { fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  tooltipRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tooltipTypeLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 44 },
  tooltipTypePct:  { fontSize: 13, fontWeight: '600' },

  empty:       { textAlign: 'center', paddingVertical: 8 },
  hint:        { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center' },
  untypedNote: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
  footnote:    { textAlign: 'center' },
});
