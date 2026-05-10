import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from '@react-native-firebase/firestore';
import { FriendsStackParamList } from '../../navigation/FriendsStack';
import { getUserProfile, UserProfile } from '../../services/users';
import { db } from '../../services/firebase';
import { useFriendsStore } from '../../store/friendsStore';
import { DailySummary, calculateStreaks } from '../../utils/streakUtils';
import { todayCount, weeklyAverage } from '../../utils/statsUtils';
import { formatDate } from '../../utils/dateUtils';
import AppText from '../../components/shared/Text';
import Avatar from '../../components/shared/Avatar';
import StatCard from '../../components/shared/StatCard';
import CalendarHeatmap from '../../components/heatmap/CalendarHeatmap';
import Button from '../../components/shared/Button';

type Props = NativeStackScreenProps<FriendsStackParamList, 'FriendDetail'>;

async function fetchFriendSummaries(userId: string): Promise<DailySummary[]> {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  const snaps = await Promise.all(
    dates.map(date => getDoc(doc(db, 'users', userId, 'dailySummaries', date))),
  );
  return snaps
    .map((snap, i) => ({
      date: dates[i],
      count: snap.exists() ? ((snap.data() as { count?: number }).count ?? 0) : 0,
    }))
    .filter(s => s.count > 0);
}

export default function FriendDetailScreen({ route, navigation }: Props) {
  const { friendId } = route.params;
  const remove = useFriendsStore(s => s.remove);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfriending, setUnfriending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s] = await Promise.all([
          getUserProfile(friendId),
          fetchFriendSummaries(friendId),
        ]);
        if (!cancelled) {
          setProfile(p);
          setSummaries(s);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [friendId]);

  const { currentStreak } = calculateStreaks(summaries);
  const todayVal = todayCount(summaries);
  const weekly = weeklyAverage(summaries);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60 || g.vy > 0.4) navigation.goBack();
      },
    }),
  ).current;

  const handleUnfriend = async () => {
    setUnfriending(true);
    try {
      await remove(friendId);
      navigation.goBack();
    } finally {
      setUnfriending(false);
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Tap the dim area to dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />

      <View style={styles.card}>
        {/* Drag handle — larger hit area so the gesture fires reliably */}
        <View style={styles.handleArea} {...pan.panHandlers}>
          <View style={styles.handle} />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.identity}>
              <Avatar
                initials={profile?.avatarInitials ?? '?'}
                colour={profile?.avatarColour ?? '#888'}
                size={64}
              />
              <AppText variant="screenTitle">{profile?.username ?? '—'}</AppText>
            </View>

            <View style={styles.stats}>
              <StatCard value={currentStreak} label="day streak" />
              <StatCard value={todayVal} label="today" />
              <StatCard value={weekly.toFixed(1)} label="weekly avg" />
            </View>

            <CalendarHeatmap
              summaries={summaries}
              selectedDate={null}
              onDayPress={() => {}}
            />

            <Button
              title="Remove friend"
              variant="destructive"
              onPress={handleUnfriend}
              loading={unfriending}
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#3c3a38',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxHeight: '82%',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7A6F60',
  },
  spinner: { paddingVertical: 48 },
  scroll: { gap: 16, paddingBottom: 8 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stats: { flexDirection: 'row', gap: 8 },
});
