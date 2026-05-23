import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';
import InfoModal, { InfoButton, InfoRow } from './InfoModal';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  infoTitle?: string;
  infoIntro?: string;
  infoRows?: InfoRow[];
}

export default function StatCard({ value, label, icon, infoTitle, infoIntro, infoRows }: StatCardProps) {
  const { surface } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const hasInfo = !!(infoTitle && infoRows?.length);

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
        ? <MCI name={icon} size={20} color={surface.textSecondary} />
        : <View style={styles.iconSpacer} />
      }
      <AppText variant="screenTitle">{value}</AppText>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    gap: 4,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconSpacer: { height: 20 },
});
