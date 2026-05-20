import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';

interface StatCardProps {
  value: string | number;
  label: string;
  onInfo?: () => void;
}

export default function StatCard({ value, label, onInfo }: StatCardProps) {
  const { surface } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surface.surface, borderColor: surface.border },
      ]}
    >
      <AppText variant="screenTitle">{value}</AppText>
      <View style={styles.labelRow}>
        <AppText variant="caption" colour="textSecondary">{label}</AppText>
        {onInfo && (
          <Pressable onPress={onInfo} hitSlop={8} style={styles.infoButton}>
            <AppText variant="caption" style={styles.infoText}>?</AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    gap: 4,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoButton: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#4A4239',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { color: '#B8AE9F', lineHeight: 14, fontSize: 10 },
});
