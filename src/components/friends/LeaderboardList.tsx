import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import FriendRow, { FRIEND_ROW_MARGIN } from './FriendRow';
import { LeaderboardEntry, LeaderboardWindow } from '../../services/friends';
import { getMood } from '../../utils/moodUtils';

function formatUpdated(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'updated just now';
  if (diff < 3600) return `updated ${Math.floor(diff / 60)}m ago`;
  return `updated ${Math.floor(diff / 3600)}h ago`;
}

const WINDOWS: { key: LeaderboardWindow; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  activeWindow: LeaderboardWindow;
  onWindowChange: (w: LeaderboardWindow) => void;
  onFriendPress: (uid: string) => void;
  lastUpdated: number | null;
}

const TAB_GAP = 2;
const TAB_PADDING = 3;

export default function LeaderboardList({
  entries,
  loading,
  activeWindow,
  onWindowChange,
  onFriendPress,
  lastUpdated,
}: LeaderboardListProps) {
  const { surface, colours } = useTheme();

  const activeIndex = WINDOWS.findIndex(w => w.key === activeWindow);
  const listOpacity = useRef(new Animated.Value(1)).current;
  const tabTranslateX = useRef(new Animated.Value(0)).current;

  // Fade out immediately on window change, fade in when new entries land.
  const prevWindow = useRef(activeWindow);
  useEffect(() => {
    if (prevWindow.current === activeWindow) return;
    prevWindow.current = activeWindow;
    Animated.timing(listOpacity, { toValue: 0.3, duration: 80, useNativeDriver: true }).start();
  }, [activeWindow]);

  useEffect(() => {
    if (entries.length > 0) {
      Animated.timing(listOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
  }, [entries]);
  const tabWidthRef = useRef(0);
  const containerWidth = useRef(0);

  const animateToIndex = (index: number, width: number) => {
    const availableWidth = width - TAB_PADDING * 2 - 2; // subtract 1px border each side
    const singleTabWidth = (availableWidth - TAB_GAP * (WINDOWS.length - 1)) / WINDOWS.length;
    tabWidthRef.current = singleTabWidth;
    const targetX = TAB_PADDING + index * (singleTabWidth + TAB_GAP);
    Animated.spring(tabTranslateX, { toValue: targetX, useNativeDriver: true, tension: 300, friction: 30 }).start();
  };

  useEffect(() => {
    if (containerWidth.current > 0) {
      animateToIndex(activeIndex, containerWidth.current);
    }
  }, [activeIndex]);

  return (
    <View>
      {/* Title + last updated pill */}
      <View style={styles.titleRow}>
        <AppText variant="sectionHeading">Leaderboard</AppText>
        {lastUpdated && (() => {
          const fresh = Date.now() - lastUpdated < 60_000;
          return (
            <View style={[styles.updatedPill, { backgroundColor: fresh ? colours.idealBg : colours.primary50 }]}>
              <View style={[styles.updatedDot, { backgroundColor: fresh ? colours.ideal : colours.primary400 }]} />
              <AppText variant="caption" style={{ color: fresh ? colours.ideal : colours.primary600 }}>
                {formatUpdated(lastUpdated)}
              </AppText>
            </View>
          );
        })()}
      </View>

      {/* Pill tabs */}
      <View
        style={[styles.tabs, { backgroundColor: surface.surface, borderColor: surface.border }]}
        onLayout={e => {
          const w = e.nativeEvent.layout.width;
          containerWidth.current = w;
          animateToIndex(activeIndex, w);
        }}
      >
        {/* Sliding highlight */}
        <Animated.View
          style={[
            styles.tabHighlight,
            { backgroundColor: colours.primary400, transform: [{ translateX: tabTranslateX }], width: tabWidthRef.current },
          ]}
        />
        {WINDOWS.map(w => {
          const active = w.key === activeWindow;
          return (
            <Pressable
              key={w.key}
              onPress={() => onWindowChange(w.key)}
              style={({ pressed }) => [styles.tab, pressed && { opacity: 0.6 }]}
            >
              <AppText
                variant="caption"
                style={{ color: active ? '#fff' : surface.textSecondary, fontWeight: '500' }}
              >
                {w.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Divider between tabs and list */}
      {!loading && entries.length > 0 && (
        <View style={[styles.tabDivider, { backgroundColor: surface.border }]} />
      )}

      {/* Column headers */}
      {!loading && entries.length > 0 && (
        <View style={styles.colHeader}>
          <AppText variant="caption" style={[styles.colRank, { color: surface.textSecondary }]}>#</AppText>
          <AppText variant="caption" style={[styles.colAvatar, { color: surface.textSecondary }]}>User</AppText>
          <View style={{ flex: 1 }} />
          <AppText variant="caption" style={[styles.colCount, { color: surface.textSecondary }]}>Logs</AppText>
        </View>
      )}

      {loading && entries.length === 0 ? (
        <ActivityIndicator style={styles.spinner} color={surface.textPrimary} />
      ) : entries.length === 0 ? (
        <AppText variant="body" colour="textSecondary" style={styles.empty}>
          No data yet — add friends to compete!
        </AppText>
      ) : (
        <Animated.View style={[styles.list, { opacity: listOpacity }]}>
          {entries.map((entry, i) => {
            const rank = i === 0 ? 1 : entries[i].count === entries[i - 1].count
              ? entries.findIndex(e => e.count === entry.count) + 1
              : i + 1;
            const mood = getMood(entry, rank);
            return (
              <FriendRow
                key={entry.uid}
                rank={rank}
                entry={entry}
                mood={mood}
                onPress={entry.isSelf ? undefined : () => onFriendPress(entry.uid)}
              />
            );
          })}
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  updatedPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  updatedDot: { width: 6, height: 6, borderRadius: 999 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: TAB_PADDING,
    gap: TAB_GAP,
    marginBottom: 8,
  },
  tabDivider: { height: StyleSheet.hairlineWidth, marginBottom: 10 },
  tabHighlight: {
    position: 'absolute',
    top: TAB_PADDING,
    bottom: TAB_PADDING,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    marginBottom: 6,
    marginHorizontal: FRIEND_ROW_MARGIN,
  },
  colRank: { width: 27, textAlign: 'center' },
  colAvatar: { width: 48, textAlign: 'center' },
  colCount: { width: 36, textAlign: 'center' },
  list: { gap: 6 },
  spinner: { marginVertical: 24 },
  empty: { textAlign: 'center', marginVertical: 24 },
});
