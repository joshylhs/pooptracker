import { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, Text } from 'react-native';
import CatAvatar, { WALL_COLORS } from './CatAvatar';
import { AvatarConfig } from './AvatarPicker';
import { Mood } from '../../utils/moodUtils';
import { AnyEyeStyle } from './CatEyes';
import { MouthStyle } from './CatBody';

// focal point x=16 y=12, zoom=32 → viewBox "0 -4 32 32"
// Shifts viewport up 4 units so headdresses have headroom and shoulders stay visible.
// Single composition at all sizes — ready for body accessories when they land.
const VIEWBOX = '0 -4 32 32';

interface Props {
  config: AvatarConfig;
  size: number;
  mood?: Mood;
}

const MOOD_EYES: Record<Mood, AnyEyeStyle | undefined> = {
  inactive: 'closed',
  proud:    'proud',
  default:  undefined,
};

const MOOD_MOUTH: Record<Mood, MouthStyle> = {
  inactive: 'flat',
  proud:    'default',
  default:  'default',
};

const ANIM_CONFIG: Record<Mood, { amplitude: number; upMs: number; downMs: number; pauseMs?: number } | null> = {
  inactive: { amplitude: 3, upMs: 1600, downMs: 1300, pauseMs: 1400 },
  proud:    { amplitude: 4, upMs: 800,  downMs: 600 },
  default:  null,
};

export default function CatAvatarCircle({ config, size, mood = 'default' }: Props) {
  const wallBg = config.wallColor === 'none' ? 'transparent' : WALL_COLORS[config.wallColor];
  const moodEyes = MOOD_EYES[mood];
  const mouthStyle = MOOD_MOUTH[mood];

  const translateY = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();
    translateY.setValue(0);
    const cfg = ANIM_CONFIG[mood];
    if (!cfg) return;
    const sequence = [
      Animated.timing(translateY, { toValue: cfg.amplitude,  duration: cfg.downMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ...(cfg.pauseMs ? [Animated.delay(cfg.pauseMs)] : []),
      Animated.timing(translateY, { toValue: 0, duration: cfg.upMs, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ];
    animRef.current = Animated.loop(Animated.sequence(sequence));
    animRef.current.start();
    return () => { animRef.current?.stop(); };
  }, [mood]);

  // Scale zzz font size proportionally to avatar size
  const zSize = Math.max(8, Math.round(size * 0.18));

  return (
    <View style={{ width: size, height: size }}>
      {/* Circle is fixed — only the SVG inside translates */}
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: wallBg }]}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <CatAvatar
            bodyColor={config.bodyColor}
            snoutColor={config.snoutColor}
            eyes={config.eyeStyle}
            eyePrimary={config.eyePrimary}
            eyeSecondary={config.eyeSecondary}
            cheekStyle={config.cheekStyle}
            headdress={config.headdress}
            shirt={config.shirt}
            accessory={config.accessory}
            wallColor={config.wallColor}
            size={size}
            viewBox={VIEWBOX}
            moodEyes={moodEyes}
            mouthStyle={mouthStyle}
          />
        </Animated.View>
      </View>
      {/* zzz overlay sits outside the circle so it isn't clipped */}
      {mood === 'inactive' && (
        <View style={[styles.zzzOverlay, { right: -zSize * 0.6, top: size * 0.05 }]} pointerEvents="none">
          <Text style={[styles.zzz, { fontSize: zSize * 0.7, opacity: 0.55 }]}>z</Text>
          <Text style={[styles.zzz, { fontSize: zSize * 0.85, opacity: 0.7, marginLeft: zSize * 0.3, marginTop: -zSize * 0.15 }]}>z</Text>
          <Text style={[styles.zzz, { fontSize: zSize, opacity: 0.85, marginLeft: zSize * 0.3, marginTop: -zSize * 0.15 }]}>z</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle:     { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  zzzOverlay: { position: 'absolute', alignItems: 'flex-start' },
  zzz:        { color: '#B0C4DE', fontWeight: '700', lineHeight: undefined },
});
