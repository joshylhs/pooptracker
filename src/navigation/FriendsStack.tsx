import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendsScreen from '../screens/friends/FriendsScreen';
import FriendDetailScreen from '../screens/friends/FriendDetailScreen';

export type FriendsStackParamList = {
  FriendsMain: undefined;
  FriendDetail: { friendId: string };
};

const Stack = createNativeStackNavigator<FriendsStackParamList>();

export default function FriendsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendsMain" component={FriendsScreen} />
      <Stack.Screen name="FriendDetail" component={FriendDetailScreen} />
    </Stack.Navigator>
  );
}
