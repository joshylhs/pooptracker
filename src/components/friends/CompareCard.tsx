import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Avatar from '../shared/Avatar';
import { CatAvatarCircle } from '../avatar';
import type { AvatarConfig } from '../avatar';

export interface CompareSide {
  name: string;
  avatarInitials: string;
  avatarColour: string;
  avatarConfig?: AvatarConfig;
  value: string | number;
}

interface Props {
  label: string;
  left: CompareSide;
  right: CompareSide;
  children?: React.ReactNode;
}

const AVATAR_SIZE = 20;

function BouncingAvatar({ lead, config, initials, colour }: {
  lead: boolean;
  config?: AvatarConfig;
  initials: string;
  colour: string;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    anim.current?.stop();
    translateY.setValue(0);
    if (lead) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -3, duration: 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(translateY, { toValue:  0, duration: 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      anim.current.start();
    }
    return () => anim.current?.stop();
  }, [lead]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      {config
        ? <CatAvatarCircle config={config} size={AVATAR_SIZE} />
        : <Avatar initials={initials} colour={colour} size={AVATAR_SIZE} />
      }
    </Animated.View>
  );
}

export default function CompareCard({ label, left, right, children }: Props) {
  const { surface, colours } = useTheme();

  const leftNum  = parseFloat(String(left.value));
  const rightNum = parseFloat(String(right.value));
  const tied = leftNum === rightNum || isNaN(leftNum) || isNaN(rightNum);
  const leftLeads  = !tied && leftNum > rightNum;
  const rightLeads = !tied && rightNum > leftNum;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        {/* Left — you */}
        <View style={styles.side}>
          <AppText style={[styles.value, { color: leftLeads ? colours.primary200 : surface.textPrimary }]}>
            {left.value}
          </AppText>
          <View style={styles.tagRow}>
            <BouncingAvatar lead={leftLeads} config={left.avatarConfig} initials={left.avatarInitials} colour={left.avatarColour} />
            <AppText style={[styles.tag, { color: surface.textSecondary }]}>you</AppText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: surface.border }]} />

        {/* Right — them */}
        <View style={styles.side}>
          <AppText style={[styles.value, { color: rightLeads ? colours.primary200 : surface.textPrimary }]}>
            {right.value}
          </AppText>
          <View style={styles.tagRow}>
            <BouncingAvatar lead={rightLeads} config={right.avatarConfig} initials={right.avatarInitials} colour={right.avatarColour} />
            <AppText style={[styles.tag, { color: surface.textSecondary }]}>them</AppText>
          </View>
        </View>
      </View>
      {children}
      <AppText style={[styles.label, { color: surface.textSecondary }]}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', gap: 4 },
  body: { flexDirection: 'row', alignItems: 'center' },
  side: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tag: { fontSize: 11, letterSpacing: 0.3 },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  label: { fontSize: 11, textAlign: 'center', letterSpacing: 0.4, marginTop: 4 },
});
