import { Alert, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Avatar from '../shared/Avatar';
import { CatAvatarCircle } from '../avatar';
import { LeaderboardEntry } from '../../services/friends';
import { sendPoke } from '../../services/pokes';
import MedalIcon from './MedalIcon';
import { Mood } from '../../utils/moodUtils';

export const FRIEND_ROW_MARGIN = 6;

interface FriendRowProps {
  rank: number;
  entry: LeaderboardEntry;
  mood?: Mood;
  onPress?: () => void;
}

export default function FriendRow({ rank, entry, mood, onPress }: FriendRowProps) {
  const { surface, colours } = useTheme();
  const [poking, setPoking] = useState(false);
  const [poked, setPoked] = useState(false);
  const pokeScale = useRef(new Animated.Value(1)).current;
  const rowScale  = useRef(new Animated.Value(1)).current;
  const pressable = !entry.isSelf && !!onPress;

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
    <Animated.View style={{ transform: [{ scale: rowScale }] }}>
    <Pressable
      onPress={onPress}
      onPressIn={() => { if (pressable) Animated.spring(rowScale, { toValue: 0.97, speed: 40, bounciness: 0, useNativeDriver: true }).start(); }}
      onPressOut={() => { if (pressable) Animated.spring(rowScale, { toValue: 1,    speed: 40, bounciness: 4, useNativeDriver: true }).start(); }}
      style={[
        styles.row,
        { backgroundColor: surface.surface, borderColor: surface.border },
        entry.isSelf && { backgroundColor: 'rgba(127, 119, 221, 0.4)', borderColor: colours.primary400 },
      ]}
    >
      {rank <= 3 ? (
        <View style={styles.rank}>
          <MedalIcon rank={rank} />
        </View>
      ) : (
        <AppText variant="bodyEmphasis" style={[styles.rank, { color: surface.textSecondary }]}>
          {rank}
        </AppText>
      )}
      {entry.avatarConfig ? (
        <CatAvatarCircle config={entry.avatarConfig} size={48} mood={mood} />
      ) : (
        <Avatar initials={entry.avatarInitials} colour={entry.avatarColour} size={48} />
      )}
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
                  { backgroundColor: surface.border, borderWidth: 0 },
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9.5,
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: FRIEND_ROW_MARGIN,
  },
  rank: { width: 27, textAlign: 'center', alignItems: 'center' },
  nameCol: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { width: 36, textAlign: 'center' },
  pokeBtn: { width: 26, height: 26, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pokeBtnDim: { opacity: 0.3 },
});
