import { StyleSheet, View } from 'react-native';
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
  /** Render arbitrary content below the value row (e.g. a chart). */
  children?: React.ReactNode;
}

const AVATAR_SIZE = 24;

function Side({ side, align }: { side: CompareSide; align: 'left' | 'right' }) {
  const { surface } = useTheme();
  const isRight = align === 'right';
  return (
    <View style={[styles.side, isRight && styles.sideRight]}>
      <View style={[styles.nameRow, isRight && styles.nameRowRight]}>
        {isRight ? (
          <>
            <AppText style={[styles.name, { color: surface.textSecondary }]} numberOfLines={1}>
              {side.name}
            </AppText>
            {side.avatarConfig
              ? <CatAvatarCircle config={side.avatarConfig} size={AVATAR_SIZE} />
              : <Avatar initials={side.avatarInitials} colour={side.avatarColour} size={AVATAR_SIZE} />
            }
          </>
        ) : (
          <>
            {side.avatarConfig
              ? <CatAvatarCircle config={side.avatarConfig} size={AVATAR_SIZE} />
              : <Avatar initials={side.avatarInitials} colour={side.avatarColour} size={AVATAR_SIZE} />
            }
            <AppText style={[styles.name, { color: surface.textSecondary }]} numberOfLines={1}>
              {side.name}
            </AppText>
          </>
        )}
      </View>
      <AppText style={[styles.value, { color: surface.textPrimary }]}>{side.value}</AppText>
    </View>
  );
}

export default function CompareCard({ label, left, right, children }: Props) {
  const { surface } = useTheme();
  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Side side={left} align="left" />
        <View style={[styles.divider, { backgroundColor: surface.border }]} />
        <Side side={right} align="right" />
      </View>
      {children}
      <AppText style={[styles.label, { color: surface.textSecondary }]}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', gap: 8 },
  body: { flexDirection: 'row', alignItems: 'flex-start' },
  side: { flex: 1, gap: 6, paddingHorizontal: 12, alignItems: 'center' },
  sideRight: { alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameRowRight: { flexDirection: 'row-reverse' },
  name: { fontSize: 12, flexShrink: 1 },
  value: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginTop: 4 },
  label: { fontSize: 11, textAlign: 'center', letterSpacing: 0.4 },
});
