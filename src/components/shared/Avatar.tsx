import { StyleSheet, View } from 'react-native';
import AppText from './Text';

interface AvatarProps {
  initials: string;
  colour: string;
  size?: number;
}

export default function Avatar({ initials, colour, size = 36 }: AvatarProps) {
  const fontSize = Math.round(size * 0.38);
  return (
    <View
      style={[
        styles.circle,
        { backgroundColor: colour, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <AppText style={{ fontSize, lineHeight: size, fontWeight: '600', color: '#fff' }}>
        {(initials ?? '').slice(0, 2).toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
