import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import FriendListCollapsed from '../../components/friends/FriendListCollapsed';
import LeaderboardList from '../../components/friends/LeaderboardList';
import { useFriendsStore } from '../../store/friendsStore';
import { LeaderboardWindow } from '../../services/friends';
import { FriendsStackParamList } from '../../navigation/FriendsStack';

type Nav = NativeStackNavigationProp<FriendsStackParamList, 'FriendsMain'>;

export default function FriendsScreen() {
  const navigation = useNavigation<Nav>();
  const [activeWindow, setActiveWindow] = useState<LeaderboardWindow>('week');
  const [refreshing, setRefreshing] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      loadAll().then(() => loadLeaderboard(activeWindow));
    }, []),
  );

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

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <AppText variant="screenTitle" style={styles.title}>
          Friends
        </AppText>

        <FriendListCollapsed
          friends={friends}
          pendingIncoming={pendingIncoming}
          pendingOutgoing={pendingOutgoing}
          onSendRequest={sendRequest}
          onAccept={accept}
          onDecline={decline}
          onRemove={remove}
        />

        <LeaderboardList
          entries={leaderboard?.entries ?? []}
          loading={loading || leaderboardLoading}
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
  scroll: { gap: 16, paddingBottom: 24 },
  title: { marginBottom: 4 },
});
