import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import FriendRow from './FriendRow';
import { LeaderboardEntry, LeaderboardWindow } from '../../services/friends';

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

  useEffect(() => {
    if (!loading && entries.length > 0) {
      listOpacity.setValue(0);
      Animated.timing(listOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [loading]);
  const tabWidth = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);

  const animateToIndex = (index: number, width: number) => {
    const availableWidth = width - TAB_PADDING * 2;
    const singleTabWidth = (availableWidth - TAB_GAP * (WINDOWS.length - 1)) / WINDOWS.length;
    const targetX = TAB_PADDING + index * (singleTabWidth + TAB_GAP);
    Animated.parallel([
      Animated.spring(tabTranslateX, { toValue: targetX, useNativeDriver: false, tension: 300, friction: 30 }),
      Animated.timing(tabWidth, { toValue: singleTabWidth, duration: 0, useNativeDriver: false }),
    ]).start();
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
            { backgroundColor: colours.primary400, transform: [{ translateX: tabTranslateX }], width: tabWidth },
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

      {/* Column headers */}
      {!loading && entries.length > 0 && (
        <View style={styles.colHeader}>
          <AppText variant="caption" style={[styles.colRank, { color: surface.textSecondary }]}>#</AppText>
          {/* avatar spacer: 34px + 12px gap */}
          <View style={styles.colAvatarSpacer} />
          <AppText variant="caption" style={[styles.colName, { color: surface.textSecondary }]}>User</AppText>
          <AppText variant="caption" style={[styles.colCount, { color: surface.textSecondary }]}>Logs</AppText>
        </View>
      )}

      {loading && entries.length === 0 ? (
        <ActivityIndicator style={styles.spinner} />
      ) : entries.length === 0 ? (
        <AppText variant="body" colour="textSecondary" style={styles.empty}>
          No data yet — add friends to compete!
        </AppText>
      ) : (
        <Animated.View style={[styles.list, { opacity: listOpacity }]}>
          {entries.map((entry, i) => (
            <FriendRow
              key={entry.uid}
              rank={i + 1}
              entry={entry}
              onPress={entry.isSelf ? undefined : () => onFriendPress(entry.uid)}
            />
          ))}
        </Animated.View>
      )}

      <AppText variant="caption" colour="textSecondary" style={styles.footer}>
        Shows your friends' log counts only (no details!)
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  updatedPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: TAB_PADDING,
    gap: TAB_GAP,
    marginBottom: 8,
  },
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
  },
  colRank: { width: 20, textAlign: 'center' },
  colAvatarSpacer: { width: 34 },
  colName: { flex: 1 },
  colCount: { width: 36, textAlign: 'center' },
  list: { gap: 6 },
  spinner: { marginVertical: 24 },
  empty: { textAlign: 'center', marginVertical: 24 },
  footer: { textAlign: 'center', marginTop: 12 },
});
