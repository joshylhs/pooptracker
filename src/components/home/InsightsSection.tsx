import { Animated, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import BristolDistributionChart from './BristolDistributionChart';
import WeeklyFrequencyChart, { deriveWeeklyInsight } from './WeeklyFrequencyChart';
import { LogEntry } from '../../database/logRepository';

const LEGEND = [
  { colour: '#D85A30', label: 'Too loose' },
  { colour: '#3B6D11', label: 'Ideal' },
  { colour: '#854F0B', label: 'Too hard' },
];

interface Props {
  logs: LogEntry[];
  onToggle?: (expanded: boolean) => void;
}

export default function InsightsSection({ logs, onToggle }: Props) {
  const { surface } = useTheme();
  const weeklyInsight = deriveWeeklyInsight(logs);
  const [expanded, setExpanded] = useState(true);
  const rotateAnim  = useRef(new Animated.Value(1)).current;
  const chevScale   = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    const newExpanded = !expanded;
    LayoutAnimation.configureNext({
      duration: 400,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    Animated.timing(rotateAnim, { toValue: newExpanded ? 1 : 0, duration: 400, useNativeDriver: true }).start();
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: surface.surface, borderColor: surface.border }]}>
      <View style={styles.header}>
        <Pressable onPress={toggle} style={styles.headerPressable}>
          <AppText variant="sectionHeading">Insights</AppText>
        </Pressable>
        <Pressable
          onPress={toggle}
          hitSlop={8}
          onPressIn={() => Animated.spring(chevScale, { toValue: 0.84, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(chevScale, { toValue: 1,    speed: 40, bounciness: 5, useNativeDriver: true }).start()}
        >
          <Animated.View style={[styles.chevronCircle, { transform: [{ scale: chevScale }] }]}>
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <MCI name="chevron-down" size={20} color={surface.textSecondary} />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.body}>
          {/* Shared legend for both charts */}
          <View style={styles.legendBlock}>
            <View style={styles.legend}>
              {LEGEND.map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.colour }]} />
                  <AppText style={styles.legendLabel}>{item.label}</AppText>
                </View>
              ))}
            </View>
            <AppText style={styles.legendNote}>lighter segments = untyped</AppText>
          </View>

          <View style={styles.chartBlock}>
            <AppText variant="caption" colour="textSecondary" style={styles.chartTitle}>
              STOOL TYPE DISTRIBUTION · LAST 90 DAYS
            </AppText>
            <BristolDistributionChart logs={logs} />
          </View>

          <View style={[styles.divider, { backgroundColor: surface.border }]} />

          <View style={styles.chartBlock}>
            <AppText variant="caption" colour="textSecondary" style={styles.chartTitle}>
              WEEKLY FREQUENCY · LAST 6 WEEKS
            </AppText>
            {weeklyInsight && <AppText style={styles.insight}>{weeklyInsight}</AppText>}
            <WeeklyFrequencyChart logs={logs} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerPressable: { flex: 1 },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCirclePressed: { opacity: 0.4 },
  body: { paddingBottom: 16 },
  legendBlock:{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 5, alignItems: 'center' },
  legend:     { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  legendLabel:{ fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  legendNote: { fontSize: 9, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' },
  divider: { height: 1, marginHorizontal: 16, marginVertical: 14 },
  chartBlock: { paddingHorizontal: 16, gap: 10 },
  chartTitle: { letterSpacing: 0.5 },
  insight: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 17, fontStyle: 'italic' },
});
