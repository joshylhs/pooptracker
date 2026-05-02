import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';

interface StatCardProps {
  value: string | number;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  const { surface } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surface.surface, borderColor: surface.border },
      ]}
    >
      <AppText variant="screenTitle">{value}</AppText>
      <AppText variant="caption" colour="textSecondary">
        {label}
      </AppText>
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
});
