import { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
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

function ZLetter({ fontSize, delay, right, top }: { fontSize: number; delay: number; right: number; top: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.85, duration: 300, useNativeDriver: true }),
            Animated.delay(800),
            Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
          Animated.timing(translate, { toValue: { x: fontSize * 0.4, y: -fontSize * 1.2 }, duration: 1700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity,   { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(translate, { toValue: { x: 0, y: 0 }, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(2400 - delay - 1700),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.Text style={{
      position: 'absolute',
      right,
      top,
      fontSize,
      fontWeight: '700',
      color: '#B0C4DE',
      opacity,
      transform: translate.getTranslateTransform(),
    }}>z</Animated.Text>
  );
}

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

  const renderSize = size * 2;
  const avatarProps = {
    bodyColor: config.bodyColor,
    snoutColor: config.snoutColor,
    eyes: config.eyeStyle,
    eyePrimary: config.eyePrimary,
    eyeSecondary: config.eyeSecondary,
    cheekStyle: config.cheekStyle,
    headdress: config.headdress,
    shirt: config.shirt,
    accessory: config.accessory,
    wallColor: config.wallColor,
    size: renderSize,
    viewBox: VIEWBOX,
    moodEyes,
    mouthStyle,
  };

  return (
    <View style={{ width: size, height: size }}>
      {/* Circle is fixed — only the SVG inside translates */}
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: wallBg }]}>
        {mood === 'default' ? (
          <View style={{ transform: [{ scale: 0.5 }] }}>
            <CatAvatar {...avatarProps} />
          </View>
        ) : (
          <Animated.View style={{ transform: [{ translateY: Animated.multiply(translateY, 2) }, { scale: 0.5 }] }}>
            <CatAvatar {...avatarProps} />
          </Animated.View>
        )}
      </View>
      {/* zzz overlay sits outside the circle so it isn't clipped */}
      {mood === 'inactive' && (
        <View style={[styles.zzzOverlay, { right: -zSize * 0.6, top: size * 0.05 }]} pointerEvents="none">
          <ZLetter fontSize={zSize * 0.7}  delay={0}    right={zSize * 0.9} top={zSize * 1.2} />
          <ZLetter fontSize={zSize * 0.85} delay={800}  right={zSize * 0.4} top={zSize * 0.5} />
          <ZLetter fontSize={zSize}        delay={1600} right={0}           top={0} />
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
