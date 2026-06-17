import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from '@react-native-firebase/firestore';
import { FriendsStackParamList } from '../../navigation/FriendsStack';
import { getUserProfile, UserProfile, checkTrusted } from '../../services/users';
import { db } from '../../services/firebase';
import { useFriendsStore } from '../../store/friendsStore';
import { useAuthStore } from '../../store/authStore';
import { DailySummary, calculateStreaks } from '../../utils/streakUtils';
import { todayCount, weeklyAverage } from '../../utils/statsUtils';
import { formatDate } from '../../utils/dateUtils';
import { useTheme } from '../../hooks/useTheme';
import { fetchFriendLogs } from '../../services/friendData';
import { fetchFriendSignalStatus, FriendSignalStatus } from '../../services/signals';
import { LogEntry } from '../../database/logRepository';
import AppText from '../../components/shared/Text';
import Avatar from '../../components/shared/Avatar';
import { CatAvatarCircle } from '../../components/avatar';
import StatCard from '../../components/shared/StatCard';
import CalendarHeatmap from '../../components/heatmap/CalendarHeatmap';
import BristolDistributionChart from '../../components/home/BristolDistributionChart';
import WeeklyFrequencyChart from '../../components/home/WeeklyFrequencyChart';
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

const SIGNAL_META: Record<FriendSignalStatus, { colour: string; label: string; icon: string }> = {
  urgent: { colour: '#D85A30', label: 'Urgent signal active', icon: 'alert-circle' },
  gp:     { colour: '#BA7517', label: 'GP flag active',       icon: 'flag' },
  info:   { colour: '#7F77DD', label: 'Info signal active',   icon: 'information' },
  clear:  { colour: '#1D9E75', label: 'No active signals',    icon: 'check-circle' },
};

export default function FriendDetailScreen({ route, navigation }: Props) {
  const { colours, surface } = useTheme();
  const { friendId } = route.params;
  const remove = useFriendsStore(s => s.remove);
  const trustedFriendIds = useFriendsStore(s => s.trustedFriendIds);
  const toggleTrust = useFriendsStore(s => s.toggleTrust);
  const currentUserId = useAuthStore(s => s.user?.uid);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfriending, setUnfriending] = useState(false);
  const [isTrustedByThem, setIsTrustedByThem] = useState(false);
  const [friendLogs, setFriendLogs] = useState<LogEntry[]>([]);
  const [signalStatus, setSignalStatus] = useState<FriendSignalStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s, trusted] = await Promise.all([
          getUserProfile(friendId),
          fetchFriendSummaries(friendId),
          currentUserId ? checkTrusted(friendId, currentUserId) : Promise.resolve(false),
        ]);
        let logs: LogEntry[] = [];
        let status: FriendSignalStatus | null = null;
        if (trusted) {
          [logs, status] = await Promise.all([
            fetchFriendLogs(friendId, 90),
            fetchFriendSignalStatus(friendId),
          ]);
        }
        if (!cancelled) {
          setProfile(p);
          setSummaries(s);
          setIsTrustedByThem(trusted);
          setFriendLogs(logs);
          setSignalStatus(status);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [friendId, currentUserId]);

  const { currentStreak } = calculateStreaks(summaries);
  const todayVal = todayCount(summaries);
  const weekly = weeklyAverage(summaries);

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
    <View style={[styles.root, { backgroundColor: surface.background }]}>
      <View style={[styles.handle, { backgroundColor: surface.border }]} />
      {loading ? (
        <ActivityIndicator style={styles.spinner} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          style={{ marginHorizontal: -16 }}
          scrollIndicatorInsets={{ right: 6 }}
          indicatorStyle="white"
        >
            <View style={styles.identity}>
              {profile?.avatarConfig ? (
                <CatAvatarCircle config={profile.avatarConfig} size={64} />
              ) : (
                <Avatar
                  initials={profile?.avatarInitials ?? '?'}
                  colour={profile?.avatarColour ?? '#888'}
                  size={64}
                />
              )}
              <View style={styles.nameBlock}>
                <AppText variant="screenTitle">{profile?.username ?? '—'}</AppText>
                <View style={[
                  styles.pokePill,
                  { backgroundColor: profile?.allowPokes ? colours.idealBg : colours.warningBg },
                ]}>
                  <AppText variant="caption" style={{ color: profile?.allowPokes ? colours.ideal : colours.warning }}>
                    {profile?.allowPokes ? 'accepting pokes' : 'not accepting pokes'}
                  </AppText>
                </View>
                {profile?.createdAt && (
                  <AppText variant="caption" style={{ color: '#7A6F60' }}>
                    Logging since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </AppText>
                )}
              </View>
            </View>

            <View style={styles.stats}>
              <StatCard value={currentStreak} label="day streak" icon="fire" iconColor="#E8734A" />
              <StatCard value={todayVal} label="today" icon="toilet" iconColor="#7F77DD" />
              <StatCard value={weekly.toFixed(1)} label="weekly avg" icon="chart-bar" iconColor="#1D9E75" />
            </View>

            <CalendarHeatmap
              summaries={summaries}
              selectedDate={null}
              onDayPress={() => {}}
            />

            {isTrustedByThem && (
              <View style={[styles.insightsCard, { backgroundColor: surface.surface, borderColor: surface.border }]}>
                <View style={styles.insightsHeader}>
                  <AppText variant="sectionHeading">Insights</AppText>
                  {signalStatus && (
                    <View style={[styles.signalPill, { backgroundColor: SIGNAL_META[signalStatus].colour + '22' }]}>
                      <MCI name={SIGNAL_META[signalStatus].icon} size={14} color={SIGNAL_META[signalStatus].colour} />
                      <AppText variant="caption" style={[styles.signalLabel, { color: SIGNAL_META[signalStatus].colour }]}>
                        {SIGNAL_META[signalStatus].label}
                      </AppText>
                    </View>
                  )}
                </View>

                <View style={styles.chartBlock}>
                  <AppText variant="caption" colour="textSecondary" style={styles.chartTitle}>
                    STOOL TYPE DISTRIBUTION · LAST 90 DAYS
                  </AppText>
                  <BristolDistributionChart logs={friendLogs} windowDays={90} />
                </View>

                <View style={[styles.divider, { backgroundColor: surface.border }]} />

                <View style={styles.chartBlock}>
                  <AppText variant="caption" colour="textSecondary" style={styles.chartTitle}>
                    FREQUENCY · LAST 6 WEEKS
                  </AppText>
                  <WeeklyFrequencyChart logs={friendLogs} />
                </View>
              </View>
            )}

            <View style={[styles.trustRow, { backgroundColor: surface.surface, borderColor: surface.border }]}>
              <MCI name="shield-account" size={18} color={surface.textSecondary} style={styles.trustIcon} />
              <View style={styles.trustLabel}>
                <AppText variant="body">Trusted friend</AppText>
                <AppText variant="caption" colour="textSecondary">Can see your detailed stats</AppText>
              </View>
              <Switch
                value={trustedFriendIds.includes(friendId)}
                onValueChange={() => toggleTrust(friendId)}
                trackColor={{ true: '#7F77DD' }}
              />
            </View>

            <Button
              title="Remove friend"
              variant="destructive"
              onPress={handleUnfriend}
              loading={unfriending}
            />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  spinner: { paddingVertical: 48 },
  scroll: { gap: 12, paddingBottom: 32, paddingHorizontal: 16 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nameBlock: { gap: 8 },
  pokePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  stats: { flexDirection: 'row', gap: 12 },
  insightsCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  signalPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  signalLabel: { fontWeight: '600' },
  chartBlock: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  divider: { height: 1, marginHorizontal: 16, marginVertical: 0 },
  chartTitle: { letterSpacing: 0.5 },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trustIcon: { marginRight: 10 },
  trustLabel: { flex: 1, gap: 2 },
});
