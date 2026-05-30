import { useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { LogEntry } from '../../database/logRepository';
import { BRISTOL_TYPES, BristolTypeNumber } from '../../utils/bristolData';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  logs: LogEntry[];
  windowDays?: number;
}

const HARD_TYPES    = [1, 2];
const HEALTHY_TYPES = [3, 4, 5];
const LOOSE_TYPES   = [6, 7];

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

export default function BristolDistributionChart({ logs, windowDays = 90 }: Props) {
  const { surface } = useTheme();
  const [active, setActive] = useState<number | null>(null);

  // Keep last active segment so tooltip content stays visible while fading out
  const lastSeg = useRef<{ bt: typeof BRISTOL_TYPES[0]; i: number; pct: number } | null>(null);

  // Per-segment animated values
  const segOpacity = useRef(BRISTOL_TYPES.map(() => new Animated.Value(1))).current;
  const segExpand  = useRef(BRISTOL_TYPES.map(() => new Animated.Value(0))).current;

  // Centre text crossfade
  const statOpacity    = useRef(new Animated.Value(1)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = (i: number) => {
    setActive(i);
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
    ]).start(() => setActive(null));
  };

  const distribution = useMemo(() => {
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    const inWindow = logs.filter(l => l.timestamp >= cutoff && l.bristolType !== null);
    const total = inWindow.length;
    if (total === 0) return null;
    const counts = new Array(7).fill(0);
    for (const log of inWindow) {
      counts[(log.bristolType as BristolTypeNumber) - 1]++;
    }
    return { counts, total };
  }, [logs, windowDays]);

  if (!distribution) {
    return (
      <AppText variant="caption" colour="textSecondary" style={styles.empty}>
        No Bristol type data yet — tap a log entry and record the type.
      </AppText>
    );
  }

  const { counts, total } = distribution;
  const pcts = counts.map(c => Math.round((c / total) * 100));

  const hardPct    = HARD_TYPES.reduce((s, t) => s + pcts[t - 1], 0);
  const healthyPct = HEALTHY_TYPES.reduce((s, t) => s + pcts[t - 1], 0);
  const loosePct   = LOOSE_TYPES.reduce((s, t) => s + pcts[t - 1], 0);

  let cursor = 0;
  const segments = BRISTOL_TYPES.map((bt, i) => {
    if (counts[i] === 0) return null;
    const sweep    = (counts[i] / total) * 360;
    const startDeg = cursor;
    const endDeg   = cursor + sweep;
    cursor = endDeg;
    return { bt, i, startDeg, endDeg, pct: pcts[i] };
  });

  const activeSeg = active !== null ? segments[active] : null;
  if (activeSeg) lastSeg.current = activeSeg;
  const displaySeg = activeSeg ?? lastSeg.current;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.wrap}>
          <Svg width={SIZE} height={SIZE}>
            {segments.map(seg => {
              if (!seg) return null;
              // Interpolate path d between normal and expanded using RN string interpolation
              const animD = segExpand[seg.i].interpolate({
                inputRange:  [0, 1],
                outputRange: [
                  arc(seg.startDeg, seg.endDeg, R_OUTER, R_INNER),
                  arc(seg.startDeg, seg.endDeg, R_OUTER + EXPAND, R_INNER),
                ],
              });
              return (
                <AnimatedPath
                  key={seg.bt.type}
                  d={animD}
                  fill={seg.bt.colour}
                  opacity={segOpacity[seg.i]}
                  onPressIn={() => handlePressIn(seg.i)}
                  onPressOut={() => handlePressOut(seg.i)}
                />
              );
            })}
          </Svg>

          {/* Centre text overlay — two states crossfade */}
          <View style={styles.centre} pointerEvents="none">
            <Animated.View style={[styles.centreSlot, { opacity: statOpacity }]}>
              <AppText style={styles.centreStatHard}>{hardPct}% hard</AppText>
              <AppText style={styles.centreStatHealthy}>{healthyPct}% healthy</AppText>
              <AppText style={styles.centreStatLoose}>{loosePct}% loose</AppText>
            </Animated.View>

            <Animated.View style={[styles.centreSlot, { opacity: tooltipOpacity }]}>
              {displaySeg && (
                <>
                  <AppText style={[styles.centreType, { color: displaySeg.bt.colour }]}>
                    Type {displaySeg.bt.type}
                  </AppText>
                  <AppText style={[styles.centrePct, { color: surface.textPrimary }]}>
                    {displaySeg.pct}%
                  </AppText>
                  <AppText style={[styles.centreLabel, { color: surface.textSecondary }]}>
                    {displaySeg.bt.label}
                  </AppText>
                </>
              )}
            </Animated.View>
          </View>
        </View>

        {/* Legend — no flex:1, naturally sized */}
        <View style={styles.legend}>
          {BRISTOL_TYPES.map((bt, i) => (
            <View key={bt.type} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: bt.colour }]} />
              <AppText style={[styles.legendText, {
                color: counts[i] > 0 ? surface.textPrimary : surface.textSecondary,
              }]}>
                Type {bt.type}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <AppText variant="caption" colour="textSecondary" style={styles.hint}>
        Hold a segment to see the breakdown
      </AppText>
      <AppText variant="caption" colour="textSecondary" style={styles.footnote}>
        Last {windowDays} days · {total} recorded type{total !== 1 ? 's' : ''}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
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
  centreType:        { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  centrePct:         { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
  centreLabel:       { fontSize: 9, textAlign: 'center' },
  centreStatHard:    { fontSize: 10, fontWeight: '500', color: '#854F0B', textAlign: 'center' },
  centreStatHealthy: { fontSize: 11, fontWeight: '700', color: '#3B6D11', textAlign: 'center' },
  centreStatLoose:   { fontSize: 10, fontWeight: '500', color: '#D85A30', textAlign: 'center' },
  legend:     { gap: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch:     { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  legendText: { fontSize: 12 },
  empty:    { textAlign: 'center', paddingVertical: 8 },
  hint:     { textAlign: 'center' },
  footnote: { textAlign: 'center' },
});
