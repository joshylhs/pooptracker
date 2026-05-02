import { Pressable, StyleSheet, View } from 'react-native';
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

export default function BristolSelector({ value, onChange }: BristolSelectorProps) {
  const { surface, colours } = useTheme();

  return (
    <View style={styles.list}>
      {BRISTOL_TYPES.map(entry => {
        const selected = value === entry.type;
        return (
          <Pressable
            key={entry.type}
            onPress={() => onChange(selected ? null : entry.type)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: surface.surface,
                borderColor: selected ? colours.primary400 : surface.border,
                borderWidth: selected ? 2 : 1,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: entry.colour }]}>
              <AppText variant="bodyEmphasis" style={styles.badgeText}>
                {entry.type}
              </AppText>
            </View>
            <View style={styles.body}>
              <View style={styles.headerRow}>
                <AppText variant="bodyEmphasis">{entry.label}</AppText>
                {entry.category === 'ideal' && (
                  <AppText
                    variant="caption"
                    style={[styles.idealBadge, { color: colours.ideal }]}
                  >
                    ideal
                  </AppText>
                )}
              </View>
              <AppText variant="caption" colour="textSecondary">
                {entry.description}
              </AppText>
              <AppText
                variant="caption"
                colour="textPlaceholder"
                style={styles.category}
              >
                {labelForCategory(entry.category)}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function labelForCategory(category: BristolType['category']): string {
  switch (category) {
    case 'constipated': return 'constipated';
    case 'normal':      return 'normal';
    case 'ideal':       return 'ideal';
    case 'lacking_fibre': return 'lacking fibre';
    case 'loose':       return 'loose';
    case 'diarrhoea':   return 'diarrhoea';
  }
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF' },
  body: { flex: 1, gap: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  idealBadge: { fontWeight: '500' },
  category: { textTransform: 'lowercase' },
});
