import { View, StyleSheet } from 'react-native';
import CatAvatar, { WALL_COLORS } from './CatAvatar';
import { AvatarConfig } from './AvatarPicker';

interface Props {
  config: AvatarConfig;
  size: number;
  // Positive = shift cat downward (more body visible). Background colour fills the gap at top.
  shiftDown?: number;
}

export default function CatAvatarCircle({ config, size, shiftDown = 10 }: Props) {
  const wallBg = config.wallColor === 'none' ? 'transparent' : WALL_COLORS[config.wallColor];
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: wallBg }]}>
      <View style={{ position: 'absolute', top: shiftDown }}>
        <CatAvatar
          bodyColor={config.bodyColor}
          snoutColor={config.snoutColor}
          eyes={config.eyeStyle}
          eyePrimary={config.eyePrimary}
          eyeSecondary={config.eyeSecondary}
          cheekStyle={config.cheekStyle}
          headdress={config.headdress}
          wallColor={config.wallColor}
          size={size}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
