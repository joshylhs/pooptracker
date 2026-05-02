import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';

interface QuickLogButtonProps {
  onPress: () => void;
  onAddDetails: () => void;
}

export default function QuickLogButton({
  onPress,
  onAddDetails,
}: QuickLogButtonProps) {
  const { colours } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: pressed ? colours.primary600 : colours.primary400 },
        ]}
      >
        <View style={styles.text}>
          <AppText variant="bodyEmphasis" style={styles.title}>
            Quick log
          </AppText>
          <AppText variant="caption" style={styles.subtitle}>
            saves now with no details
          </AppText>
        </View>
        <AppText style={styles.plus}>+</AppText>
      </Pressable>

      <Pressable onPress={onAddDetails} style={styles.detailsLink}>
        <AppText variant="caption" style={[styles.detailsText, { color: colours.primary200 }]}>
          add details instead
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6, alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  text: { flex: 1 },
  title: { color: '#FFFFFF' },
  subtitle: { color: '#FFFFFF', opacity: 0.8 },
  plus: { color: '#FFFFFF', fontSize: 28, lineHeight: 28, marginLeft: 12 },
  detailsLink: { paddingVertical: 4 },
  detailsText: { textDecorationLine: 'underline' },
});
