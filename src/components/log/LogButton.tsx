import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRef } from 'react';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { todayString } from '../../utils/dateUtils';

interface LogButtonProps {
  onQuickLog: () => void;
  onAddDetails: () => void;
  selectedDate: string | null;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDatePill(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1]}`;
}

export default function LogButton({ onQuickLog, onAddDetails, selectedDate }: LogButtonProps) {
  const { colours } = useTheme();
  const mainOpacity = useRef(new Animated.Value(1)).current;
  const quickOpacity = useRef(new Animated.Value(1)).current;

  const fade = (anim: Animated.Value, to: number) =>
    Animated.timing(anim, { toValue: to, duration: 80, useNativeDriver: true }).start();

  const isPastDate = selectedDate !== null && selectedDate !== todayString();

  return (
    <View style={styles.wrapper}>
      {/* Primary: Log card */}
      <Pressable
        onPress={onAddDetails}
        onPressIn={() => fade(mainOpacity, 0.7)}
        onPressOut={() => fade(mainOpacity, 1)}
        style={styles.mainCard}
      >
        <Animated.View style={[styles.mainInner, { backgroundColor: colours.primary400, opacity: mainOpacity }]}>
          <View style={styles.mainText}>
            <View style={styles.titleRow}>
              <AppText variant="bodyEmphasis" style={styles.mainTitle}>Log 🚽</AppText>
              {isPastDate && (
                <>
                  <AppText variant="bodyEmphasis" style={styles.mainTitle}> ·  </AppText>
                  <View style={styles.datePill}>
                    <AppText variant="caption" style={styles.datePillText}>
                      {formatDatePill(selectedDate)}
                    </AppText>
                  </View>
                </>
              )}
            </View>
            <AppText variant="caption" style={styles.mainSub}>how'd it go?</AppText>
          </View>
          <View style={[styles.plusCircle, { backgroundColor: colours.primary200 }]}>
            <AppText style={styles.plusText}>+</AppText>
          </View>
        </Animated.View>
      </Pressable>

      {/* Secondary: Quick log */}
      <Pressable
        onPress={onQuickLog}
        onPressIn={() => fade(quickOpacity, 0.6)}
        onPressOut={() => fade(quickOpacity, 1)}
        style={styles.quickBtn}
      >
        <BlurView blurType="dark" blurAmount={4} style={StyleSheet.absoluteFill} reducedTransparencyFallbackColor="#1a1918" pointerEvents="none" />
        <Animated.View style={[styles.quickContent, { opacity: quickOpacity }]}>
          <AppText variant="caption" style={styles.quickText}>Quick log</AppText>
          <AppText variant="caption" style={styles.quickDot}> · </AppText>
          <AppText variant="caption" style={styles.quickSub}>
            {isPastDate ? formatDatePill(selectedDate) : 'No details'}
          </AppText>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  mainCard: { borderRadius: 20, overflow: 'hidden' },
  mainInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  mainText: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  mainTitle: { color: '#FFFFFF', fontSize: 18 },
  mainSub: { color: '#FFFFFF', opacity: 0.8 },
  datePill: {
    backgroundColor: 'rgba(216, 90, 48, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  datePillText: { color: '#F5A987', fontSize: 14 },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  plusText: { color: '#FFFFFF', fontSize: 24, lineHeight: 28 },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  quickContent: { flexDirection: 'row', alignItems: 'center' },
  quickText: { color: '#F5EFE6' },
  quickDot: { color: '#B8AE9F' },
  quickSub: { color: '#B8AE9F' },
});
