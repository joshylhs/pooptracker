import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import BristolDistributionChart from './BristolDistributionChart';
import WeeklyFrequencyChart, { deriveWeeklyInsight } from './WeeklyFrequencyChart';
import { LogEntry } from '../../database/logRepository';

interface Props {
  logs: LogEntry[];
}

export default function InsightsSection({ logs }: Props) {
  const { surface } = useTheme();
  const weeklyInsight = deriveWeeklyInsight(logs);
  const [expanded, setExpanded] = useState(true);
  const rotateAnim = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(rotateAnim, { toValue, duration: 200, useNativeDriver: true }).start();
    setExpanded(v => !v);
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
        <Pressable onPress={toggle} hitSlop={8}>
          {({ pressed }) => (
            <View style={[styles.chevronCircle, pressed && styles.chevronCirclePressed]}>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <MCI name="chevron-down" size={20} color={surface.textSecondary} />
              </Animated.View>
            </View>
          )}
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.body}>
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
    borderRadius: 14,
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
  divider: { height: 1, marginHorizontal: 16, marginVertical: 14 },
  chartBlock: { paddingHorizontal: 16, gap: 10 },
  chartTitle: { letterSpacing: 0.5 },
  insight: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 17, fontStyle: 'italic' },
});
