import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Avatar from '../../components/shared/Avatar';
import { CatAvatarCircle } from '../../components/avatar';
import LeaderboardList from '../../components/friends/LeaderboardList';
import CompareSection from '../../components/friends/CompareSection';
import { useFriendsStore } from '../../store/friendsStore';
import { useLogStore } from '../../store/logStore';
import { useTheme } from '../../hooks/useTheme';
import { searchUser, UserSearchResult, LeaderboardWindow } from '../../services/friends';
import { FriendsStackParamList } from '../../navigation/FriendsStack';

type Nav = NativeStackNavigationProp<FriendsStackParamList, 'FriendsMain'>;

type SearchState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'not-found' }
  | { status: 'already-friend' }
  | { status: 'already-pending' }
  | { status: 'found'; result: UserSearchResult };

export default function FriendsScreen() {
  const navigation = useNavigation<Nav>();
  const { surface, colours } = useTheme();
  const [activeWindow, setActiveWindow] = useState<LeaderboardWindow>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const manageScale = useRef(new Animated.Value(1)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const manageScaleUp = () => Animated.timing(manageScale, { toValue: 1.12, duration: 80, useNativeDriver: true }).start();
  const manageScaleDown = () => Animated.timing(manageScale, { toValue: 1, duration: 120, useNativeDriver: true }).start();

  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const {
    friends,
    pendingIncoming,
    pendingOutgoing,
    leaderboard,
    loading,
    leaderboardLoading,
    leaderboardFetchedAt,
    loadAll,
    loadLeaderboard,
    sendRequest,
    accept,
    decline,
    remove,
  } = useFriendsStore();

  const logs = useLogStore(s => s.logs);
  const leaderboardEntries = leaderboard?.entries ?? [];
  const myEntry = leaderboardEntries.find(e => e.isSelf);
  const myProfile = myEntry ? {
    name: 'You',
    avatarInitials: myEntry.avatarInitials,
    avatarColour: myEntry.avatarColour,
    avatarConfig: myEntry.avatarConfig,
    value: 0,
  } : null;
  // Frozen on first population — leaderboard window changes must not re-render CompareSection.
  const myProfileRef = useRef<typeof myProfile>(null);
  if (myProfile && !myProfileRef.current) myProfileRef.current = myProfile;
  const stableMyProfile = myProfileRef.current;

  const panelCount = pendingIncoming.length + pendingOutgoing.length + friends.length;

  useFocusEffect(
    useCallback(() => {
      loadAll().then(() => loadLeaderboard(activeWindow));
    }, []),
  );

  const openPanel = () => {
    setPanelOpen(true);
    Animated.spring(panelAnim, { toValue: 1, useNativeDriver: true, friction: 12, tension: 80 }).start();
  };

  const closePanel = () => {
    Animated.spring(panelAnim, { toValue: 0, useNativeDriver: true, friction: 20, tension: 200 }).start(({ finished }) => {
      if (finished) setPanelOpen(false);
    });
  };

  const togglePanel = () => panelOpen ? closePanel() : openPanel();

  const openSearch = () => {
    setSearchOpen(true);
    Animated.timing(searchAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
      inputRef.current?.focus();
    });
    if (panelOpen) closePanel();
  };

  const closeSearch = () => {
    inputRef.current?.blur();
    Animated.timing(searchAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setSearchOpen(false);
        setQuery('');
        setSearchState({ status: 'idle' });
      }
    });
  };

  const handleWindowChange = (w: LeaderboardWindow) => {
    setActiveWindow(w);
    loadLeaderboard(w);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll({ force: true });
      await loadLeaderboard(activeWindow, { force: true });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchState({ status: 'searching' });
    try {
      const result = await searchUser(trimmed);
      if (!result) { setSearchState({ status: 'not-found' }); return; }
      if (friends.some(f => f.uid === result.uid)) { setSearchState({ status: 'already-friend' }); return; }
      if ([...pendingIncoming, ...pendingOutgoing].some(p => p.uid === result.uid)) { setSearchState({ status: 'already-pending' }); return; }
      setSearchState({ status: 'found', result });
    } catch {
      setSearchState({ status: 'not-found' });
    }
  };

  const handleSend = async (uid: string) => {
    setActionLoading(uid);
    try {
      await sendRequest(uid);
      closeSearch();
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (uid: string, action: () => Promise<void>) => {
    setActionLoading(uid);
    try { await action(); } finally { setActionLoading(null); }
  };

  const panelTranslateY = panelAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });
  const titleOpacity = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const searchOpacity = searchAnim;
  const titleTranslateX = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const searchTranslateX = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <ScreenContainer>
      {/* Full-screen backdrop */}
      <Animated.View
        pointerEvents={panelOpen ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: panelAnim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />
      </Animated.View>

      {/* Title row + manage panel */}
      <View style={styles.titleAnchor}>
        {/* Title mode */}
        <Animated.View
          pointerEvents={searchOpen ? 'none' : 'auto'}
          style={[styles.titleRow, { opacity: titleOpacity, transform: [{ translateX: titleTranslateX }] }]}
        >
          <AppText variant="screenTitle">Friends</AppText>
          <View style={styles.pills}>
            <Pressable
              onPress={openSearch}
              hitSlop={8}
              style={({ pressed }) => [styles.searchPill, { backgroundColor: surface.border, opacity: pressed ? 0.6 : 1 }]}
            >
              <MCI name="account-search" size={16} color={surface.textSecondary} />
            </Pressable>
            <Pressable
              onPress={togglePanel}
              onPressIn={manageScaleUp}
              onPressOut={manageScaleDown}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Animated.View style={[styles.pill, { backgroundColor: surface.border, transform: [{ scale: manageScale }] }]}>
                <MCI name="book-account" size={14} color={surface.textSecondary} />
                <AppText variant="caption" colour="textSecondary">
                  {panelOpen ? 'close' : 'manage'}
                </AppText>
                {!panelOpen && pendingIncoming.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: colours.primary400 }]}>
                    <AppText style={styles.badgeText}>{pendingIncoming.length}</AppText>
                  </View>
                )}
                <AppText style={[styles.chevron, { color: surface.textSecondary }]}>
                  {panelOpen ? '▴' : '▾'}
                </AppText>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Search mode */}
        <Animated.View
          pointerEvents={searchOpen ? 'auto' : 'none'}
          style={[
            styles.titleRow,
            StyleSheet.absoluteFill,
            { opacity: searchOpacity, transform: [{ translateX: searchTranslateX }] },
          ]}
        >
          <View style={[styles.searchRow, { borderColor: surface.border, flex: 1 }]}>
            <TextInput
              ref={inputRef}
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
              style={({ pressed }) => [styles.searchBtn, { backgroundColor: colours.primary400, opacity: pressed ? 0.6 : 1 }]}
            >
              {searchState.status === 'searching'
                ? <ActivityIndicator color="#fff" size="small" />
                : <AppText variant="caption" style={{ color: '#fff', fontWeight: '600' }}>Find</AppText>
              }
            </Pressable>
          </View>
          <Pressable onPress={closeSearch} hitSlop={8} style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <AppText variant="caption" colour="textSecondary">Cancel</AppText>
          </Pressable>
        </Animated.View>

        {/* Manage panel */}
        <Animated.View
          pointerEvents={panelOpen ? 'auto' : 'none'}
          style={[
            styles.panel,
            { backgroundColor: surface.surface, borderColor: surface.border },
            { opacity: panelAnim, transform: [{ translateY: panelTranslateY }] },
          ]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.panelContent}
          >
            {pendingIncoming.length > 0 && (
              <>
                <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>Requests received</AppText>
                {pendingIncoming.map(p => (
                  <View key={p.uid} style={styles.friendRow}>
                    <Avatar initials={p.avatarInitials} colour={p.avatarColour} />
                    <AppText variant="body" style={styles.friendName}>{p.username}</AppText>
                    <Pressable
                      onPress={() => handleAction(p.uid, () => accept(p.uid))}
                      style={({ pressed }) => [styles.actionBtn, { backgroundColor: colours.primary400, opacity: pressed ? 0.6 : 1 }]}
                      disabled={actionLoading === p.uid}
                    >
                      {actionLoading === p.uid
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <View style={styles.iconBtn}><MCI name="account-check" size={14} color="#fff" /><AppText variant="caption" style={{ color: '#fff', fontWeight: '600' }}>Accept</AppText></View>
                      }
                    </Pressable>
                    <Pressable
                      onPress={() => handleAction(p.uid, () => decline(p.uid))}
                      style={({ pressed }) => [styles.actionBtn, { backgroundColor: surface.border, opacity: pressed ? 0.6 : 1 }]}
                      disabled={actionLoading === p.uid}
                    >
                      <AppText variant="caption" style={{ color: surface.textSecondary, fontWeight: '600' }}>Decline</AppText>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {pendingOutgoing.length > 0 && (
              <>
                <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>Requests sent</AppText>
                {pendingOutgoing.map(p => (
                  <View key={p.uid} style={styles.friendRow}>
                    <Avatar initials={p.avatarInitials} colour={p.avatarColour} />
                    <AppText variant="body" style={styles.friendName}>{p.username}</AppText>
                    <AppText variant="caption" colour="textSecondary">Pending</AppText>
                  </View>
                ))}
              </>
            )}

            {friends.length > 0 && (
              <>
                <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>Friends ({friends.length})</AppText>
                {friends.map(f => (
                  <View key={f.uid} style={styles.friendRow}>
                    {f.avatarConfig
                      ? <CatAvatarCircle config={f.avatarConfig} size={32} />
                      : <Avatar initials={f.avatarInitials} colour={f.avatarColour} />
                    }
                    <AppText variant="body" style={styles.friendName}>{f.username}</AppText>
                    <Pressable
                      onPress={() => handleAction(f.uid, () => remove(f.uid))}
                      style={({ pressed }) => [styles.actionBtn, { backgroundColor: surface.border, opacity: pressed ? 0.6 : 1 }]}
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

            {panelCount === 0 && (
              <AppText variant="caption" colour="textSecondary" style={styles.emptyMsg}>
                No friends yet — tap the search icon to add someone.
              </AppText>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Search result feedback */}
      {searchOpen && searchState.status === 'not-found' && (
        <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>No user found with that username.</AppText>
      )}
      {searchOpen && searchState.status === 'already-friend' && (
        <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>You're already friends with this user.</AppText>
      )}
      {searchOpen && searchState.status === 'already-pending' && (
        <AppText variant="caption" colour="textSecondary" style={styles.searchMsg}>A request with this user is already pending.</AppText>
      )}
      {searchOpen && searchState.status === 'found' && (
        <View style={[styles.resultRow, { borderColor: surface.border }]}>
          <Avatar initials={searchState.result.avatarInitials} colour={searchState.result.avatarColour} />
          <AppText variant="bodyEmphasis" style={styles.resultName}>{searchState.result.username}</AppText>
          <Pressable
            onPress={() => handleSend(searchState.result.uid)}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: colours.primary400, opacity: pressed ? 0.6 : 1 }]}
            disabled={actionLoading === searchState.result.uid}
          >
            {actionLoading === searchState.result.uid
              ? <ActivityIndicator color="#fff" size="small" />
              : <AppText variant="caption" style={{ color: '#fff', fontWeight: '600' }}>Add</AppText>
            }
          </Pressable>
        </View>
      )}

      {/* Main scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={surface.textPrimary} />}
      >
        {stableMyProfile && friends.length > 0 && (
          <CompareSection
            myProfile={stableMyProfile}
            friends={friends}
            myLogs={logs}
          />
        )}

        <LeaderboardList
          entries={leaderboard?.entries ?? []}
          loading={loading || (leaderboardLoading && (leaderboard?.entries ?? []).length === 0)}
          activeWindow={activeWindow}
          onWindowChange={handleWindowChange}
          onFriendPress={uid => navigation.navigate('FriendDetail', { friendId: uid })}
          lastUpdated={leaderboardFetchedAt}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  titleAnchor: { zIndex: 10, marginBottom: 16 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
  },
  pills: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  searchPill: {
    borderRadius: 999,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 18 },
  panel: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 320,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  panelContent: { gap: 10, padding: 14 },
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
  cancelBtn: { marginLeft: 10 },
  searchMsg: { textAlign: 'center', marginBottom: 8 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  resultName: { flex: 1 },
  badge: { width: 16, height: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700', lineHeight: 16 },
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
  emptyMsg: { textAlign: 'center' },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scroll: { gap: 16, paddingBottom: 24 },
});
