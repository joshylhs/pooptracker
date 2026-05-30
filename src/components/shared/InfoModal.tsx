import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';

export interface InfoRow {
  label: string;
  body: string;
  tag?: string;
}

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  intro?: string;
  rows: InfoRow[];
  footerLabel?: string;
  footerUrl?: string;
}

export default function InfoModal({ visible, onClose, title, intro, rows, footerLabel, footerUrl }: InfoModalProps) {
  const { surface, colours } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
          <AppText variant="sectionHeading">{title}</AppText>
          {intro && (
            <AppText variant="caption" colour="textSecondary" style={styles.intro}>
              {intro}
            </AppText>
          )}
          <View style={[styles.divider, { backgroundColor: surface.border }]} />
          {rows.map(r => (
            <View key={r.label} style={styles.row}>
              <View style={styles.labelRow}>
                <AppText variant="bodyEmphasis">{r.label}</AppText>
                {r.tag && (
                  <View style={[styles.tag, { backgroundColor: colours.primary50, borderColor: colours.primary200 }]}>
                    <AppText variant="caption" style={{ color: colours.primary600 }}>{r.tag}</AppText>
                  </View>
                )}
              </View>
              <AppText variant="caption" colour="textSecondary">{r.body}</AppText>
            </View>
          ))}
          {footerLabel && footerUrl && (
            <Pressable
              onPress={() => Linking.openURL(footerUrl)}
              style={({ pressed }) => [styles.footerLink, { opacity: pressed ? 0.5 : 1 }]}
            >
              <AppText variant="caption" style={[styles.footerText, { color: colours.primary400 }]}>
                {footerLabel} ↗
              </AppText>
            </Pressable>
          )}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, { backgroundColor: surface.border, opacity: pressed ? 0.5 : 1 }]}
          >
            <AppText variant="bodyEmphasis">Done</AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function InfoButton({ onPress }: { onPress: () => void }) {
  const { surface } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.infoButton, { backgroundColor: surface.border }]}>
      <AppText variant="caption" style={[styles.infoText, { color: surface.textSecondary }]}>?</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', paddingHorizontal: 24 },
  sheet:       { borderRadius: 16, borderWidth: 1, padding: 20, gap: 12 },
  intro:       { lineHeight: 18 },
  divider:     { height: StyleSheet.hairlineWidth },
  row:         { gap: 3 },
  labelRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag:         { borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  footerLink:  { alignItems: 'center', paddingVertical: 4 },
  footerText:  { textDecorationLine: 'underline' },
  closeBtn:    { borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  infoButton:  { width: 16, height: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  infoText:    { lineHeight: 16, fontSize: 11 },
});
