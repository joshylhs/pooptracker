import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  BRISTOL_TYPES,
  BristolType,
  BristolTypeNumber,
} from '../../utils/bristolData';
import AppText from '../shared/Text';

interface BristolSelectorProps {
  value: BristolTypeNumber | null;
  onChange: (next: BristolTypeNumber | null) => void;
}

function showBristolInfo() {
  Alert.alert(
    'Bristol Stool Scale',
    'A medical scale that classifies stool into 7 types by consistency.\n\n' +
    'Types 1–2 · Hard and lumpy — constipated\n' +
    'Types 3–4 · Smooth or cracked sausage — normal to ideal\n' +
    'Type 5 · Soft blobs — lacking fibre\n' +
    'Types 6–7 · Mushy to liquid — loose or diarrhoea',
  );
}

export default function BristolSelector({ value, onChange }: BristolSelectorProps) {
  const { surface, colours } = useTheme();
  const selectedEntry = BRISTOL_TYPES.find(e => e.type === value) ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="caption" colour="textSecondary" style={styles.label}>
          BRISTOL TYPE
        </AppText>
        <Pressable onPress={showBristolInfo} style={styles.infoButton} hitSlop={8}>
          <AppText variant="caption" style={styles.infoText}>?</AppText>
        </Pressable>
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

      {selectedEntry && (
        <View style={[styles.detail, { backgroundColor: surface.surface, borderColor: surface.border }]}>
          <View style={styles.detailHeader}>
            <AppText variant="bodyEmphasis">{selectedEntry.label}</AppText>
            {selectedEntry.category === 'ideal' && (
              <AppText variant="caption" style={{ color: colours.ideal }}>ideal</AppText>
            )}
          </View>
          <AppText variant="caption" colour="textSecondary">{selectedEntry.description}</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { letterSpacing: 0.5 },
  infoButton: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#4A4239',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { color: '#B8AE9F', lineHeight: 16 },
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
