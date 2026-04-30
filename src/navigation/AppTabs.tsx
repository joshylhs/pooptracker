import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import FriendsScreen from '../screens/friends/FriendsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type AppTabsParamList = {
  Home: undefined;
  Friends: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
