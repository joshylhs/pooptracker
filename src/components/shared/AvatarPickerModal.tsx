import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';
import { AvatarPicker, AvatarConfig } from '../avatar';

interface Props {
  visible: boolean;
  current: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onClose: () => void;
  saving?: boolean;
}

export default function AvatarPickerModal({ visible, current, onSave, onClose, saving = false }: Props) {
  const { surface } = useTheme();

  const handleConfirm = (config: AvatarConfig) => {
    onSave(config);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable stops taps inside the sheet from closing it */}
        <Pressable style={[styles.sheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
          <View style={[styles.handle, { backgroundColor: surface.border }]} />
          <AppText variant="bodyEmphasis" style={styles.title}>Customise avatar</AppText>
          <AvatarPicker
            initial={current}
            ctaLabel="Save"
            onConfirm={handleConfirm}
            loading={saving}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
    flex: 1,
    gap: 16,
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
