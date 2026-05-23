import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/home/HomeScreen';
import FriendsStack from './FriendsStack';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type AppTabsParamList = {
  Home: undefined;
  Friends: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: '#4A4239',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#7F77DD',
        tabBarInactiveTintColor: '#B8AE9F',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <MCI name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsStack}
        options={{ tabBarIcon: ({ color, size }) => <MCI name="account-group-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <MCI name="account-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
