import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Avatar from '../shared/Avatar';
import { LeaderboardEntry } from '../../services/friends';

interface FriendRowProps {
  rank: number;
  entry: LeaderboardEntry;
  onPress?: () => void;
}

export default function FriendRow({ rank, entry, onPress }: FriendRowProps) {
  const { surface, colours } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        entry.isSelf && { backgroundColor: surface.border },
        pressed && !entry.isSelf && { opacity: 0.7 },
      ]}
    >
      <AppText variant="bodyEmphasis" style={[styles.rank, { color: surface.textSecondary }]}>
        {rank}
      </AppText>
      <Avatar initials={entry.avatarInitials} colour={entry.avatarColour} size={34} />
      <View style={styles.nameCol}>
        <AppText variant="bodyEmphasis">{entry.username}</AppText>
        {entry.isSelf && (
          <AppText variant="caption" style={{ color: colours.primary400 }}>
            you
          </AppText>
        )}
      </View>
      <AppText variant="bodyEmphasis" style={{ color: surface.textPrimary }}>
        {entry.count}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderRadius: 10,
  },
  rank: { width: 20, textAlign: 'center' },
  nameCol: { flex: 1 },
});
