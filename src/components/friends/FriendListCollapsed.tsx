import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Avatar from '../shared/Avatar';
import { FriendProfile, PendingFriend, UserSearchResult } from '../../services/friends';
import { searchUser } from '../../services/friends';

interface FriendListCollapsedProps {
  friends: FriendProfile[];
  pendingIncoming: PendingFriend[];
  pendingOutgoing: PendingFriend[];
  onSendRequest: (uid: string) => Promise<void>;
  onAccept: (uid: string) => Promise<void>;
  onDecline: (uid: string) => Promise<void>;
  onRemove: (uid: string) => Promise<void>;
}

type SearchState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'not-found' }
  | { status: 'already-friend' }
  | { status: 'already-pending' }
  | { status: 'found'; result: UserSearchResult };

export default function FriendListCollapsed({
  friends,
  pendingIncoming,
  pendingOutgoing,
  onSendRequest,
  onAccept,
  onDecline,
  onRemove,
}: FriendListCollapsedProps) {
  const { surface, colours } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const manageScale = useRef(new Animated.Value(1)).current;

  const manageScaleUp = () => Animated.timing(manageScale, { toValue: 1.15, duration: 100, useNativeDriver: true }).start();
  const manageScaleDown = (cb?: () => void) => Animated.timing(manageScale, { toValue: 1, duration: 150, useNativeDriver: true }).start(cb);
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const totalCount = friends.length + pendingIncoming.length + pendingOutgoing.length;

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchState({ status: 'searching' });
    try {
      const result = await searchUser(trimmed);
      if (!result) {
        setSearchState({ status: 'not-found' });
        return;
      }
      if (friends.some(f => f.uid === result.uid)) {
        setSearchState({ status: 'already-friend' });
        return;
      }
      const allPending = [...pendingIncoming, ...pendingOutgoing];
      if (allPending.some(p => p.uid === result.uid)) {
        setSearchState({ status: 'already-pending' });
        return;
      }
      setSearchState({ status: 'found', result });
    } catch {
      setSearchState({ status: 'not-found' });
    }
  };

  const handleSend = async (uid: string) => {
    setActionLoading(uid);
    try {
      await onSendRequest(uid);
      setQuery('');
      setSearchState({ status: 'idle' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (uid: string, action: () => Promise<void>) => {
    setActionLoading(uid);
    try { await action(); } finally { setActionLoading(null); }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface.surface, borderColor: surface.border }]}>
      {/* Header row */}
      <View style={styles.header}>
        <AppText variant="bodyEmphasis">
          Friends ({totalCount})
        </AppText>
        <Pressable
          onPressIn={manageScaleUp}
          onPressOut={() => { manageScaleDown(); setExpanded(e => !e); }}
          hitSlop={8}
        >
          <Animated.View style={[styles.manageBtn, { backgroundColor: surface.border }, { transform: [{ scale: manageScale }] }]}>
            <AppText variant="caption" colour="textSecondary">
              {expanded ? 'hide' : 'manage'}
            </AppText>
            <AppText style={[styles.chevron, { color: surface.textSecondary }]}>
              {expanded ? '▴' : '▾'}
            </AppText>
          </Animated.View>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.body}>
          {/* Search */}
          <View style={[styles.searchRow, { borderColor: surface.border }]}>
            <TextInput
              style={[styles.input, { color: surface.textPrimary }]}
              placeholder="Search by username"
              placeholderTextColor={surface.textPlaceholder}
              value={query}
              onChangeText={t => { setQuery(t); setSearchState({ status: 'idle' }); }}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <Pressable
              onPress={handleSearch}
              style={[styles.searchBtn, { backgroundColor: colours.primary400 }]}
            >
              {searchState.status === 'searching'
                ? <ActivityIndicator color="#fff" size="small" />
                : <AppText variant="caption" style={{ color: '#fff', fontWeight: '600' }}>Find</AppText>
              }
            </Pressable>
          </View>

          {/* Search result */}
          {searchState.status === 'not-found' && (
            <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>
              No user found with that username.
            </AppText>
          )}
          {searchState.status === 'already-friend' && (
            <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>
              You're already friends with this user.
            </AppText>
          )}
          {searchState.status === 'already-pending' && (
            <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>
              A request with this user is already pending.
            </AppText>
          )}
          {searchState.status === 'found' && (
            <View style={[styles.resultRow, { borderColor: surface.border }]}>
              <Avatar
                initials={searchState.result.avatarInitials}
                colour={searchState.result.avatarColour}
              />
              <AppText variant="bodyEmphasis" style={styles.resultName}>
                {searchState.result.username}
              </AppText>
              <Pressable
                onPress={() => handleSend(searchState.result.uid)}
                style={[styles.actionBtn, { backgroundColor: colours.primary400 }]}
                disabled={actionLoading === searchState.result.uid}
              >
                {actionLoading === searchState.result.uid
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <AppText variant="caption" style={{ color: '#fff', fontWeight: '600' }}>Add</AppText>
                }
              </Pressable>
            </View>
          )}

          {/* Pending incoming */}
          {pendingIncoming.length > 0 && (
            <>
              <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
                Requests received
              </AppText>
              {pendingIncoming.map(p => (
                <View key={p.uid} style={styles.friendRow}>
                  <Avatar initials={p.avatarInitials} colour={p.avatarColour} />
                  <AppText variant="body" style={styles.friendName}>{p.username}</AppText>
                  <Pressable
                    onPress={() => handleAction(p.uid, () => onAccept(p.uid))}
                    style={[styles.actionBtn, { backgroundColor: colours.primary400 }]}
                    disabled={actionLoading === p.uid}
                  >
                    {actionLoading === p.uid
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <AppText variant="caption" style={{ color: '#fff', fontWeight: '600' }}>Accept</AppText>
                    }
                  </Pressable>
                  <Pressable
                    onPress={() => handleAction(p.uid, () => onDecline(p.uid))}
                    style={[styles.actionBtn, { backgroundColor: surface.border }]}
                    disabled={actionLoading === p.uid}
                  >
                    <AppText variant="caption" style={{ color: surface.textSecondary, fontWeight: '600' }}>Decline</AppText>
                  </Pressable>
                </View>
              ))}
            </>
          )}

          {/* Pending outgoing */}
          {pendingOutgoing.length > 0 && (
            <>
              <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
                Requests sent
              </AppText>
              {pendingOutgoing.map(p => (
                <View key={p.uid} style={styles.friendRow}>
                  <Avatar initials={p.avatarInitials} colour={p.avatarColour} />
                  <AppText variant="body" style={styles.friendName}>{p.username}</AppText>
                  <AppText variant="caption" colour="textSecondary">Pending</AppText>
                </View>
              ))}
            </>
          )}

          {/* Accepted friends */}
          {friends.length > 0 && (
            <>
              <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
                Friends
              </AppText>
              {friends.map(f => (
                <View key={f.uid} style={styles.friendRow}>
                  <Avatar initials={f.avatarInitials} colour={f.avatarColour} />
                  <AppText variant="body" style={styles.friendName}>{f.username}</AppText>
                  <Pressable
                    onPress={() => handleAction(f.uid, () => onRemove(f.uid))}
                    style={[styles.actionBtn, { backgroundColor: surface.border }]}
                    disabled={actionLoading === f.uid}
                  >
                    {actionLoading === f.uid
                      ? <ActivityIndicator color={colours.destructive} size="small" />
                      : <AppText variant="caption" style={{ color: colours.destructive, fontWeight: '600' }}>Remove</AppText>
                    }
                  </Pressable>
                </View>
              ))}
            </>
          )}

          {totalCount === 0 && (
            <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>
              Search for a username to add your first friend!
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chevron: { fontSize: 18 },
  body: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  searchRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  searchBtn: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  searchMsg: { textAlign: 'center' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  resultName: { flex: 1 },
  sectionLabel: { marginTop: 4 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  friendName: { flex: 1 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
