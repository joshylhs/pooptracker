import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import BristolDistributionChart from './BristolDistributionChart';
import WeeklyFrequencyChart from './WeeklyFrequencyChart';
import { LogEntry } from '../../database/logRepository';

interface Props {
  logs: LogEntry[];
}

export default function InsightsSection({ logs }: Props) {
  const { surface } = useTheme();
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
      <Pressable onPress={toggle} style={styles.header}>
        <AppText variant="sectionHeading">Insights</AppText>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <MCI name="chevron-down" size={20} color={surface.textSecondary} />
        </Animated.View>
      </Pressable>

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
              FREQUENCY · LAST 8 WEEKS
            </AppText>
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
  body: { paddingBottom: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginVertical: 12 },
  chartBlock: { paddingHorizontal: 16, gap: 10 },
  chartTitle: { letterSpacing: 0.5 },
});
