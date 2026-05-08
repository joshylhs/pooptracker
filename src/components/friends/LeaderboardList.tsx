import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import FriendRow from './FriendRow';
import { LeaderboardEntry, LeaderboardWindow } from '../../services/friends';

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
}

export default function LeaderboardList({
  entries,
  loading,
  activeWindow,
  onWindowChange,
  onFriendPress,
}: LeaderboardListProps) {
  const { surface, colours } = useTheme();

  return (
    <View>
      {/* Pill tabs */}
      <View style={[styles.tabs, { backgroundColor: surface.surface, borderColor: surface.border }]}>
        {WINDOWS.map(w => {
          const active = w.key === activeWindow;
          return (
            <Pressable
              key={w.key}
              onPress={() => onWindowChange(w.key)}
              style={[
                styles.tab,
                active && { backgroundColor: colours.primary400 },
              ]}
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

      {loading ? (
        <ActivityIndicator style={styles.spinner} />
      ) : entries.length === 0 ? (
        <AppText variant="body" colour="textSecondary" style={styles.empty}>
          No data yet — add friends to compete!
        </AppText>
      ) : (
        <View style={styles.list}>
          {entries.map((entry, i) => (
            <FriendRow
              key={entry.uid}
              rank={i + 1}
              entry={entry}
              onPress={entry.isSelf ? undefined : () => onFriendPress(entry.uid)}
            />
          ))}
        </View>
      )}

      <AppText variant="caption" colour="textSecondary" style={styles.footer}>
        counts logs only — details stay private
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  list: { gap: 2 },
  spinner: { marginVertical: 24 },
  empty: { textAlign: 'center', marginVertical: 24 },
  footer: { textAlign: 'center', marginTop: 12 },
});
