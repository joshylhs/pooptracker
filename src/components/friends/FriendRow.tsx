import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Avatar from '../shared/Avatar';
import { LeaderboardEntry } from '../../services/friends';
import { sendPoke } from '../../services/pokes';

interface FriendRowProps {
  rank: number;
  entry: LeaderboardEntry;
  onPress?: () => void;
}

export default function FriendRow({ rank, entry, onPress }: FriendRowProps) {
  const { surface, colours } = useTheme();
  const [poking, setPoking] = useState(false);
  const [poked, setPoked] = useState(false);

  const handlePoke = () => {
    Alert.prompt(
      `Poke ${entry.username}`,
      'Send a nudge with a custom message, or leave blank for the default.',
      async (message) => {
        setPoking(true);
        try {
          await sendPoke(entry.uid, message?.trim() || undefined);
          setPoked(true);
          setTimeout(() => setPoked(false), 30 * 60 * 1000);
        } catch (e: any) {
          const msg = e?.message ?? 'Failed to send poke.';
          Alert.alert('Could not poke', msg);
        } finally {
          setPoking(false);
        }
      },
      'plain-text',
      '',
    );
  };

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
      {!entry.isSelf && (
        <Pressable
          onPress={handlePoke}
          disabled={poking || poked}
          hitSlop={8}
          style={[styles.pokeBtn, (poking || poked) && styles.pokeBtnDim]}
        >
          <AppText style={styles.pokeIcon}>🚽</AppText>
        </Pressable>
      )}
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
  pokeBtn: { padding: 4 },
  pokeBtnDim: { opacity: 0.3 },
  pokeIcon: { fontSize: 18 },
});
