import { Alert, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const pokeScale = useRef(new Animated.Value(1)).current;

  const pokeScaleUp = () => Animated.timing(pokeScale, { toValue: 1.15, duration: 100, useNativeDriver: true }).start();
  const pokeScaleDown = (cb?: () => void) => Animated.timing(pokeScale, { toValue: 1, duration: 150, useNativeDriver: true }).start(cb);

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
        { backgroundColor: surface.surface, borderColor: surface.border },
        entry.isSelf && { backgroundColor: 'rgba(127, 119, 221, 0.4)', borderColor: colours.primary400 },
        pressed && !entry.isSelf && { opacity: 0.7 },
      ]}
    >
      <AppText variant="bodyEmphasis" style={[styles.rank, { color: surface.textSecondary }]}>
        {rank}
      </AppText>
      <Avatar initials={entry.avatarInitials} colour={entry.avatarColour} size={34} />
      <View style={styles.nameCol}>
        <View style={styles.nameRow}>
          <AppText variant="bodyEmphasis">{entry.username}</AppText>
          {!entry.isSelf && entry.allowPokes && (
            <Pressable
              onPressIn={pokeScaleUp}
              onPressOut={() => pokeScaleDown(handlePoke)}
              disabled={poking || poked}
              hitSlop={8}
            >
              <Animated.View
                style={[
                  styles.pokeBtn,
                  { borderColor: surface.border },
                  (poking || poked) && styles.pokeBtnDim,
                  { transform: [{ scale: pokeScale }] },
                ]}
              >
                <MCI name="hand-pointing-right" size={16} color={surface.textSecondary} />
              </Animated.View>
            </Pressable>
          )}
        </View>
        {entry.isSelf && (
          <AppText variant="caption" style={{ color: colours.primary400 }}>
            you
          </AppText>
        )}
      </View>
      <AppText variant="bodyEmphasis" style={[styles.count, { color: surface.textPrimary }]}>
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
    borderWidth: 1,
  },
  rank: { width: 20, textAlign: 'center' },
  nameCol: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { width: 36, textAlign: 'center' },
  pokeBtn: { width: 26, height: 26, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pokeBtnDim: { opacity: 0.3 },
});
