import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  BRISTOL_TYPES,
  BristolType,
  BristolTypeNumber,
} from '../../utils/bristolData';
import AppText from '../shared/Text';
import InfoModal, { InfoButton } from '../shared/InfoModal';

interface BristolSelectorProps {
  value: BristolTypeNumber | null;
  onChange: (next: BristolTypeNumber | null) => void;
}

const BRISTOL_INFO_ROWS = [
  { label: 'Types 1–2', body: 'Separate hard lumps or sausage-shaped but lumpy. Indicates constipation.' },
  { label: 'Type 3',    body: 'Like a sausage with cracks on the surface. Slightly lacking in fibre/fluids.' },
  { label: 'Type 4',    body: 'Smooth, soft sausage or snake. Ideal.' },
  { label: 'Type 5',    body: 'Soft blobs with clear-cut edges. Lacking in fibre.' },
  { label: 'Types 6–7', body: 'Fluffy, mushy, or entirely liquid. Indicates diarrhoea.' },
];

export default function BristolSelector({ value, onChange }: BristolSelectorProps) {
  const { surface, colours } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const selectedEntry = BRISTOL_TYPES.find(e => e.type === value) ?? null;

  // Keep last valid entry so panel has content while animating out
  const lastEntryRef = useRef(selectedEntry);
  if (selectedEntry) lastEntryRef.current = selectedEntry;
  const displayEntry = selectedEntry ?? lastEntryRef.current;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [panelVisible, setPanelVisible] = useState(false);
  const isShowingRef = useRef(false);

  useEffect(() => {
    if (value !== null) {
      if (!isShowingRef.current) {
        // First appearance: insert into layout first, then spring in
        isShowingRef.current = true;
        scaleAnim.setValue(0);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPanelVisible(true);
      }
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 10,
        tension: 70,
      }).start();
    } else {
      isShowingRef.current = false;
      // Spring out, then remove from layout
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 20,
        tension: 200,
      }).start(({ finished }) => {
        if (finished) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setPanelVisible(false);
        }
      });
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <InfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Bristol Stool Scale"
        intro="A medical scale classifying stool into 7 types by shape and consistency."
        rows={BRISTOL_INFO_ROWS}
      />
      <View style={styles.labelRow}>
        <AppText variant="caption" colour="textSecondary" style={styles.label}>
          BRISTOL TYPE
        </AppText>
        <InfoButton onPress={() => setShowInfo(true)} />
      </View>

      <View style={styles.row}>
        {BRISTOL_TYPES.map(entry => {
          const selected = value === entry.type;
          const dimmed = value !== null && !selected;
          return (
            <Pressable
              key={entry.type}
              onPress={() => onChange(selected ? null : entry.type)}
              style={[
                styles.ring,
                { borderColor: selected ? '#FFFFFF' : 'transparent', opacity: dimmed ? 0.3 : 1 },
              ]}
            >
              <View style={[styles.circle, { backgroundColor: entry.colour }]}>
                <AppText variant="bodyEmphasis" style={styles.circleText}>
                  {entry.type}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>

      {panelVisible && displayEntry && (
        <Animated.View
          style={[
            styles.detail,
            { backgroundColor: surface.surface, borderColor: surface.border },
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.detailHeader}>
            <AppText variant="bodyEmphasis">{displayEntry.label}</AppText>
            {displayEntry.category === 'ideal' && (
              <AppText variant="caption" style={{ color: colours.ideal }}>ideal</AppText>
            )}
          </View>
          <AppText variant="caption" colour="textSecondary">{displayEntry.description}</AppText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: { color: '#fff' },
  detail: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
});
