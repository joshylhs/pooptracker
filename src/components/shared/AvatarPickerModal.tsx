import { Modal, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';
import { AvatarPicker, AvatarConfig } from '../avatar';
import type { BadgeKey } from '../../utils/badgeUtils';

interface Props {
  visible: boolean;
  current: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onClose: () => void;
  saving?: boolean;
  earnedBadges?: Set<BadgeKey>;
}

export default function AvatarPickerModal({ visible, current, onSave, onClose, saving = false, earnedBadges }: Props) {
  const { surface } = useTheme();

  const handleConfirm = (config: AvatarConfig) => {
    onSave(config);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: surface.background }]}>
        <View style={[styles.handle, { backgroundColor: surface.border }]} />
        <AppText variant="bodyEmphasis" style={styles.title}>Customise avatar</AppText>
        <AvatarPicker
          initial={current}
          ctaLabel="Save"
          onConfirm={handleConfirm}
          loading={saving}
          earnedBadges={earnedBadges}
          headerBorderRadius={0}
          bottomPadding={32}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  title: { textAlign: 'center' },
});
