import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { doc, getDoc } from '@react-native-firebase/firestore';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Avatar from '../shared/Avatar';
import { CatAvatarCircle } from '../avatar';
import CompareCard, { CompareSide } from './CompareCard';
import MiniFrequencyChart, { buildBuckets, niceStep } from './MiniFrequencyChart';
import { FriendProfile } from '../../services/friends';
import { checkTrusted } from '../../services/users';
import { fetchFriendLogs } from '../../services/friendData';
import { fetchFriendSignalStatus, FriendSignalStatus } from '../../services/signals';
import { db } from '../../services/firebase';
import { DailySummary, calculateStreaks } from '../../utils/streakUtils';
import { todayCount, weeklyAverage } from '../../utils/statsUtils';
import { formatDate } from '../../utils/dateUtils';
import { useAuthStore } from '../../store/authStore';
import { useLogStore } from '../../store/logStore';
import { useSignalsStore } from '../../store/signalsStore';
import { LogEntry } from '../../services/logs';

const SELECTED_FRIEND_KEY = '@pooptracker/compare_selected_friend';

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
    .map((snap, i) => ({ date: dates[i], count: snap.exists() ? ((snap.data() as any).count ?? 0) : 0 }))
    .filter(s => s.count > 0);
}

function dominantBristolType(logs: LogEntry[]): number | null {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = formatDate(weekAgo);
  const recent = logs.filter(l => l.bristolType && l.date >= weekStr);
  if (recent.length === 0) return null;
  const counts = new Array(8).fill(0);
  for (const l of recent) if (l.bristolType) counts[l.bristolType]++;
  let best = 1;
  for (let i = 2; i <= 7; i++) if (counts[i] > counts[best]) best = i;
  return counts[best] > 0 ? best : null;
}

interface Props {
  myProfile: CompareSide;
  friends: FriendProfile[];
  myLogs: LogEntry[];
}

interface FriendData {
  summaries: DailySummary[];
  isTrustedByThem: boolean;
  friendLogs: LogEntry[];
  signalStatus: FriendSignalStatus | null;
}

export default function CompareSection({ myProfile, friends, myLogs }: Props) {
  const { surface, colours } = useTheme();
  const userId = useAuthStore(s => s.user?.uid ?? '');
  const myAcknowledged = useSignalsStore(s => s.acknowledged);

  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [friendData, setFriendData] = useState<FriendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [listWidth, setListWidth] = useState(0);
  const flatRef = useRef<FlatList>(null);

  // Restore persisted friend selection
  useEffect(() => {
    AsyncStorage.getItem(SELECTED_FRIEND_KEY).then(uid => {
      if (!uid) return;
      const f = friends.find(fr => fr.uid === uid);
      if (f) setSelectedFriend(f);
    });
  }, [friends]);

  // Fetch friend data when selection changes
  useEffect(() => {
    if (!selectedFriend) return;
    setLoading(true);
    setFriendData(null);
    const uid = selectedFriend.uid;
    Promise.all([
      fetchFriendSummaries(uid),
      checkTrusted(uid, userId),
    ]).then(async ([summaries, isTrustedByThem]) => {
      let friendLogs: LogEntry[] = [];
      let signalStatus: FriendSignalStatus | null = null;
      if (isTrustedByThem) {
        [friendLogs, signalStatus] = await Promise.all([
          fetchFriendLogs(uid, 42),
          fetchFriendSignalStatus(uid),
        ]);
      }
      setFriendData({ summaries, isTrustedByThem, friendLogs, signalStatus });
    }).finally(() => setLoading(false));
  }, [selectedFriend?.uid]);

  const selectFriend = (f: FriendProfile) => {
    setSelectedFriend(f);
    setCardIndex(0);
    flatRef.current?.scrollToIndex({ index: 0, animated: false });
    AsyncStorage.setItem(SELECTED_FRIEND_KEY, f.uid);
    setPickerVisible(false);
  };

  // Derived stats — mine
  const myToday = todayCount(
    myLogs.map(l => ({ date: l.date, count: 1 }))
      .reduce((acc: DailySummary[], cur) => {
        const ex = acc.find(a => a.date === cur.date);
        if (ex) ex.count++; else acc.push({ ...cur });
        return acc;
      }, [])
  );
  const mySummaries: DailySummary[] = myLogs.reduce((acc: DailySummary[], l) => {
    const ex = acc.find(a => a.date === l.date);
    if (ex) ex.count++; else acc.push({ date: l.date, count: 1 });
    return acc;
  }, []);
  const myWeekly = weeklyAverage(mySummaries);
  const { currentStreak: myStreak } = calculateStreaks(mySummaries);
  const myBristol = dominantBristolType(myLogs);

  // Derived stats — friend
  const friendSummaries = friendData?.summaries ?? [];
  const friendToday = todayCount(friendSummaries);
  const friendWeekly = weeklyAverage(friendSummaries);
  const { currentStreak: friendStreak } = calculateStreaks(friendSummaries);

  const friendSide: CompareSide = selectedFriend ? {
    name: selectedFriend.username,
    avatarInitials: selectedFriend.avatarInitials,
    avatarColour: selectedFriend.avatarColour,
    avatarConfig: selectedFriend.avatarConfig,
    value: '',
  } : { name: '', avatarInitials: '', avatarColour: '#888', value: '' };

  const isTrusted = friendData?.isTrustedByThem ?? false;
  const friendLogs = friendData?.friendLogs ?? [];

  const sharedYMax = useMemo(() => {
    const myMax = Math.max(...buildBuckets(myLogs).map(b => b.below + b.ideal + b.over + b.quick), 1);
    const friendMax = Math.max(...buildBuckets(friendLogs).map(b => b.below + b.ideal + b.over + b.quick), 1);
    const combined = Math.max(myMax, friendMax);
    const step = niceStep(combined);
    return Math.ceil(combined / step) * step;
  }, [myLogs, friendLogs]);
  const signalStatus = friendData?.signalStatus ?? null;

  const mySignalStatus: FriendSignalStatus = (() => {
    const active = myAcknowledged.filter(s => s.state !== 'resolved');
    if (active.some(s => s.severity === 'urgent')) return 'urgent';
    if (active.some(s => s.severity === 'gp')) return 'gp';
    if (active.some(s => s.severity === 'info')) return 'info';
    return 'clear';
  })();

  const SIGNAL_META: Record<FriendSignalStatus, { colour: string; label: string; icon: string }> = {
    urgent: { colour: '#D85A30', label: 'Urgent signal active', icon: 'alert-circle' },
    gp:     { colour: '#BA7517', label: 'GP flag active',       icon: 'flag' },
    info:   { colour: '#7F77DD', label: 'Info signal active',   icon: 'information' },
    clear:  { colour: '#1D9E75', label: 'No active signals',    icon: 'check-circle' },
  };

  const cards = selectedFriend ? [
    { key: 'today',  label: 'today',      myValue: myToday,            friendValue: friendToday },
    { key: 'weekly', label: 'weekly avg', myValue: myWeekly.toFixed(1), friendValue: friendWeekly.toFixed(1) },
    { key: 'streak', label: 'day streak', myValue: myStreak,            friendValue: friendStreak },
    ...(isTrusted ? [
      { key: 'chart',  label: 'chart'  },
      { key: 'signal', label: 'signal' },
    ] : []),
  ] : [];

  const cardCount = cards.length;

  if (friends.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: surface.surface, borderColor: surface.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="sectionHeading">Compare</AppText>
        <Pressable
          onPress={() => setPickerVisible(true)}
          style={({ pressed }) => [styles.friendPill, { borderColor: surface.border, opacity: pressed ? 0.5 : 1 }]}
          hitSlop={8}
        >
          {selectedFriend ? (
            <>
              {selectedFriend.avatarConfig
                ? <CatAvatarCircle config={selectedFriend.avatarConfig} size={20} />
                : <Avatar initials={selectedFriend.avatarInitials} colour={selectedFriend.avatarColour} size={20} />
              }
              <AppText style={[styles.friendPillName, { color: surface.textPrimary }]} numberOfLines={1}>
                {selectedFriend.username}
              </AppText>
            </>
          ) : (
            <>
              <MCI name="plus-circle" size={18} color={colours.primary400} />
              <AppText style={[styles.friendPillName, { color: colours.primary400 }]}>Choose friend</AppText>
            </>
          )}
        </Pressable>
      </View>

      {/* Body */}
      {!selectedFriend ? null : loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="small" color={colours.primary400} />
        </View>
      ) : (
        <View>
          <FlatList
            ref={flatRef}
            data={cards}
            keyExtractor={c => c.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.flatList}
            onLayout={e => setListWidth(e.nativeEvent.layout.width)}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
              setCardIndex(idx);
            }}
            renderItem={({ item }) => (
              <View style={[styles.cardPage, listWidth > 0 && { width: listWidth }]}>
                {item.key === 'chart' ? (
                  <View>
                    <View style={styles.chartCard}>
                      <View style={styles.chartSide}>
                        <MiniFrequencyChart logs={myLogs} label="You" yMax={sharedYMax} />
                      </View>
                      <View style={[styles.chartDivider, { backgroundColor: surface.border }]} />
                      <View style={styles.chartSide}>
                        <MiniFrequencyChart logs={friendLogs} label={selectedFriend?.username ?? ''} yMax={sharedYMax} />
                      </View>
                    </View>
                    <AppText style={[styles.cardLabel, { color: surface.textSecondary, marginTop: 8 }]}>
                      frequency · last 6 weeks
                    </AppText>
                  </View>
                ) : item.key === 'signal' ? (
                  <View style={styles.signalCard}>
                    <View style={styles.signalRow}>
                      <View style={styles.signalSide}>
                        <MCI name={SIGNAL_META[mySignalStatus].icon} size={28} color={SIGNAL_META[mySignalStatus].colour} />
                        <AppText style={[styles.signalName, { color: surface.textSecondary }]}>You</AppText>
                        <AppText style={[styles.signalStatus, { color: SIGNAL_META[mySignalStatus].colour }]} numberOfLines={2}>
                          {SIGNAL_META[mySignalStatus].label}
                        </AppText>
                      </View>
                      <View style={[styles.signalDivider, { backgroundColor: surface.border }]} />
                      <View style={styles.signalSide}>
                        {signalStatus ? (
                          <>
                            <MCI name={SIGNAL_META[signalStatus].icon} size={28} color={SIGNAL_META[signalStatus].colour} />
                            <AppText style={[styles.signalName, { color: surface.textSecondary }]}>
                              {selectedFriend?.username}
                            </AppText>
                            <AppText style={[styles.signalStatus, { color: SIGNAL_META[signalStatus].colour }]} numberOfLines={2}>
                              {SIGNAL_META[signalStatus].label}
                            </AppText>
                          </>
                        ) : (
                          <ActivityIndicator size="small" color={colours.primary400} />
                        )}
                      </View>
                    </View>
                    <AppText style={[styles.cardLabel, { color: surface.textSecondary }]}>health signals</AppText>
                  </View>
                ) : (
                  <CompareCard
                    label={item.label}
                    left={{ ...myProfile, value: item.myValue! }}
                    right={{ ...friendSide, value: item.friendValue! }}
                  />
                )}
              </View>
            )}
          />

          {/* Horizontal dots below cards */}
          {cardCount > 1 && (
            <View style={styles.dots}>
              {cards.map((c, i) => (
                <View
                  key={c.key}
                  style={[
                    styles.dot,
                    { backgroundColor: i === cardIndex ? colours.primary400 : surface.border },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Friend picker modal */}
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerVisible(false)}>
          <View style={[styles.pickerSheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
            <AppText variant="sectionHeading" style={styles.pickerTitle}>Compare with</AppText>
            <ScrollView>
              {selectedFriend && (
                <Pressable
                  style={({ pressed }) => [styles.pickerRow, { borderColor: surface.border, opacity: pressed ? 0.5 : 1 }]}
                  onPress={() => {
                    setSelectedFriend(null);
                    setFriendData(null);
                    AsyncStorage.removeItem(SELECTED_FRIEND_KEY);
                    setPickerVisible(false);
                  }}
                >
                  <MCI name="close-circle" size={32} color={surface.textSecondary} />
                  <AppText variant="body" colour="textSecondary">None</AppText>
                </Pressable>
              )}
              {friends.map(f => (
                <Pressable
                  key={f.uid}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    { borderColor: surface.border },
                    selectedFriend?.uid === f.uid && { backgroundColor: colours.primary600 + '22' },
                    pressed && { opacity: 0.5 },
                  ]}
                  onPress={() => selectFriend(f)}
                >
                  {f.avatarConfig
                    ? <CatAvatarCircle config={f.avatarConfig} size={32} />
                    : <Avatar initials={f.avatarInitials} colour={f.avatarColour} size={32} />
                  }
                  <AppText variant="body">{f.username}</AppText>
                  {selectedFriend?.uid === f.uid && (
                    <MCI name="check" size={18} color={colours.primary400} style={styles.pickerCheck} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  friendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 160,
  },
  friendPillName: { fontSize: 13, fontWeight: '500', flexShrink: 1 },
  empty: { paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' },
  flatList: { flex: 1 },
  cardPage: { paddingHorizontal: 16, paddingBottom: 8, justifyContent: 'center' },
  chartCard: { flexDirection: 'row', alignItems: 'flex-end' },
  chartSide: { flex: 1 },
  chartDivider: { width: 1, alignSelf: 'stretch', marginHorizontal: 8 },
  signalCard: { alignItems: 'center', gap: 8, paddingVertical: 4 },
  signalRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%' },
  signalSide: { flex: 1, alignItems: 'center', gap: 4 },
  signalDivider: { width: 1, alignSelf: 'stretch' },
  signalName: { fontSize: 12 },
  signalStatus: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  cardLabel: { fontSize: 11, textAlign: 'center', letterSpacing: 0.4, marginTop: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 12 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pickerSheet: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 360,
  },
  pickerTitle: { paddingHorizontal: 16, paddingVertical: 14 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pickerCheck: { marginLeft: 'auto' },
});
