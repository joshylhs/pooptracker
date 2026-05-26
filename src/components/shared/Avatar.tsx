import { StyleSheet, View } from 'react-native';
import AppText from './Text';

interface AvatarProps {
  initials: string;
  colour: string;
  size?: number;
  emoji?: string;
}

export default function Avatar({ initials, colour, size = 36, emoji }: AvatarProps) {
  const fontSize = emoji ? Math.round(size * 0.55) : Math.round(size * 0.38);
  return (
    <View
      style={[
        styles.circle,
        { backgroundColor: colour, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <AppText style={{ fontSize, lineHeight: size + (emoji ? 2 : 0), fontWeight: emoji ? '400' : '600', color: '#fff' }}>
        {emoji ?? initials.slice(0, 2).toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
