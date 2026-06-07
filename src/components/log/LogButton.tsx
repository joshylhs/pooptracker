import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { todayString } from '../../utils/dateUtils';

interface LogButtonProps {
  onQuickLog: () => void;
  onAddDetails: () => void;
  selectedDate: string | null;
  logTrigger?: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LABEL_HEIGHT = 28;

function formatDatePill(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1]}`;
}

export default function LogButton({ onQuickLog, onAddDetails, selectedDate, logTrigger = 0 }: LogButtonProps) {
  const { colours } = useTheme();

  const mainScale  = useRef(new Animated.Value(1)).current;
  const quickScale = useRef(new Animated.Value(1)).current;

  const labelY    = useRef(new Animated.Value(0)).current;
  const labelOp   = useRef(new Animated.Value(1)).current;
  const successY  = useRef(new Animated.Value(LABEL_HEIGHT)).current;
  const successOp = useRef(new Animated.Value(0)).current;

  const rotation = useRef(new Animated.Value(0)).current;
  const [showTick, setShowTick] = useState(false);

  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (labelTimer.current) clearTimeout(labelTimer.current);
      if (holdTimer.current)  clearTimeout(holdTimer.current);
    };
  }, []);

  useEffect(() => {
    if (logTrigger === 0) return;
    triggerLabelSwap();
    triggerPlusMorph();
  }, [logTrigger]);

  const triggerLabelSwap = () => {
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelY.setValue(0);
    labelOp.setValue(1);
    successY.setValue(LABEL_HEIGHT);
    successOp.setValue(0);

    Animated.parallel([
      Animated.timing(labelY,    { toValue: -LABEL_HEIGHT, duration: 250, useNativeDriver: true }),
      Animated.timing(labelOp,   { toValue: 0,             duration: 200, useNativeDriver: true }),
      Animated.timing(successY,  { toValue: 0,             duration: 250, useNativeDriver: true }),
      Animated.timing(successOp, { toValue: 1,             duration: 200, useNativeDriver: true }),
    ]).start();

    labelTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(successY,  { toValue: -LABEL_HEIGHT, duration: 250, useNativeDriver: true }),
        Animated.timing(successOp, { toValue: 0,             duration: 200, useNativeDriver: true }),
        Animated.timing(labelOp,   { toValue: 1,             duration: 200, useNativeDriver: true }),
      ]).start();
      labelY.setValue(LABEL_HEIGHT);
      Animated.timing(labelY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }, 1250);
  };

  const triggerPlusMorph = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setShowTick(false);
    rotation.setValue(0);

    // Rotate to 90° (+ sideways), swap to ✓
    Animated.timing(rotation, { toValue: 90, duration: 200, useNativeDriver: true }).start(({ finished: f1 }) => {
      if (!f1) return;
      setShowTick(true);
      // Continue to 360° — ✓ arrives upright
      Animated.timing(rotation, { toValue: 360, duration: 350, useNativeDriver: true }).start(({ finished: f2 }) => {
        if (!f2) return;
        // Hold at 360° (upright) for 800ms
        holdTimer.current = setTimeout(() => {
          // Rotate to 450° (✓ sideways), swap back to +
          Animated.timing(rotation, { toValue: 450, duration: 200, useNativeDriver: true }).start(({ finished: f3 }) => {
            if (!f3) return;
            setShowTick(false);
            // Complete to 720° — + arrives upright
            Animated.timing(rotation, { toValue: 720, duration: 350, useNativeDriver: true }).start(({ finished: f4 }) => {
              if (!f4) return;
              rotation.setValue(0);
            });
          });
        }, 800);
      });
    });
  };

  const rotateInterp = rotation.interpolate({
    inputRange: [0, 720],
    outputRange: ['0deg', '720deg'],
  });

  const isPastDate = selectedDate !== null && selectedDate !== todayString();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onAddDetails}
        onPressIn={() => { Animated.spring(mainScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start(); }}
        onPressOut={() => { Animated.spring(mainScale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 4 }).start(); }}
        style={styles.mainCard}
      >
        <Animated.View style={[styles.mainInner, { backgroundColor: colours.primary400, transform: [{ scale: mainScale }] }]}>
          <View style={styles.mainText}>
            <View style={styles.labelClip}>
              <Animated.View style={[styles.labelAbs, { transform: [{ translateY: labelY }], opacity: labelOp }]}>
                <View style={styles.titleRow}>
                  <AppText variant="bodyEmphasis" style={styles.mainTitle}>Log 🚽</AppText>
                  {isPastDate && (
                    <>
                      <AppText variant="bodyEmphasis" style={styles.mainTitle}> ·  </AppText>
                      <View style={styles.datePill}>
                        <AppText variant="caption" style={styles.datePillText}>
                          {formatDatePill(selectedDate!)}
                        </AppText>
                      </View>
                    </>
                  )}
                </View>
              </Animated.View>
              <Animated.View style={[styles.labelAbs, { transform: [{ translateY: successY }], opacity: successOp }]}>
                <AppText variant="bodyEmphasis" style={styles.mainTitle}>Logged ✓</AppText>
              </Animated.View>
            </View>
            <AppText variant="caption" style={styles.mainSub}>how'd it go?</AppText>
          </View>

          <Animated.View style={[styles.plusCircle, { backgroundColor: colours.primary200, transform: [{ rotate: rotateInterp }] }]}>
            <AppText style={styles.plusText}>{showTick ? '✓' : '+'}</AppText>
          </Animated.View>
        </Animated.View>
      </Pressable>

      <Pressable
        onPress={onQuickLog}
        onPressIn={() => { Animated.spring(quickScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start(); }}
        onPressOut={() => { Animated.spring(quickScale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 4 }).start(); }}
        style={styles.quickBtn}
      >
        <BlurView blurType="dark" blurAmount={4} style={StyleSheet.absoluteFill} reducedTransparencyFallbackColor="#1a1918" pointerEvents="none" />
        <Animated.View style={[styles.quickContent, { transform: [{ scale: quickScale }] }]}>
          <AppText variant="caption" style={styles.quickText}>Quick log</AppText>
          <AppText variant="caption" style={styles.quickDot}> · </AppText>
          <AppText variant="caption" style={styles.quickSub}>
            {isPastDate ? formatDatePill(selectedDate!) : 'No details'}
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
  labelClip: {
    height: LABEL_HEIGHT,
    overflow: 'hidden',
  },
  labelAbs: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
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
