import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';
import InfoModal, { InfoButton, InfoRow } from './InfoModal';

const SLOT_HEIGHT = 32;

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  iconColor?: string;
  infoTitle?: string;
  infoIntro?: string;
  infoRows?: InfoRow[];
}

export default function StatCard({ value, label, icon, iconColor, infoTitle, infoIntro, infoRows }: StatCardProps) {
  const { surface } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const hasInfo = !!(infoTitle && infoRows?.length);

  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const prevValue = useRef<string | number>(value);
  const slotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => { if (slotTimer.current) clearTimeout(slotTimer.current); };
  }, []);

  useEffect(() => {
    if (value === prevValue.current) return;

    const numNew  = parseFloat(String(value));
    const numPrev = parseFloat(String(prevValue.current));
    const direction = !isNaN(numNew) && !isNaN(numPrev) && numNew < numPrev ? -1 : 1;

    Animated.parallel([
      Animated.timing(translateY, { toValue: -SLOT_HEIGHT * direction, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,                        duration: 180, useNativeDriver: true }),
    ]).start();

    slotTimer.current = setTimeout(() => {
      translateY.setValue(SLOT_HEIGHT * direction);
      opacity.setValue(0);
      setDisplayValue(value);
      prevValue.current = value;
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 12, stiffness: 180, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1, duration: 200,                useNativeDriver: true }),
      ]).start();
    }, 200);
  }, [value]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surface.surface, borderColor: surface.border },
      ]}
    >
      {hasInfo && (
        <InfoModal
          visible={showInfo}
          onClose={() => setShowInfo(false)}
          title={infoTitle!}
          intro={infoIntro}
          rows={infoRows!}
        />
      )}
      {icon
        ? <MCI name={icon} size={16} color={iconColor ?? surface.textSecondary} />
        : <View style={styles.iconSpacer} />
      }
      <View style={styles.valueClip}>
        <Animated.View style={{ transform: [{ translateY }], opacity }}>
          <AppText variant="screenTitle" style={styles.value}>{displayValue}</AppText>
        </Animated.View>
      </View>
      <View style={styles.labelRow}>
        <AppText variant="caption" colour="textSecondary">{label}</AppText>
        {hasInfo && <InfoButton onPress={() => setShowInfo(true)} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    gap: 2,
  },
  valueClip: {
    overflow: 'hidden',
    height: SLOT_HEIGHT,
  },
  value: { fontSize: 22 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconSpacer: { height: 16 },
});
