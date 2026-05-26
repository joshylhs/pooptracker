import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import FriendsStack from './FriendsStack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useHealthFindings } from '../hooks/useHealthFindings';

export type AppTabsParamList = {
  Home: undefined;
  Friends: undefined;
  Profile: undefined;
};

function HomeTabIcon({ color, size }: { color: string; size: number }) {
  const { status } = useHealthFindings();
  const showBadge = status.severity === 'urgent' || status.severity === 'gp';
  return (
    <View>
      <MCI name="home-outline" size={size} color={color} />
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: status.colour }]} />
      )}
    </View>
  );
}

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
        component={HomeStack}
        options={{ tabBarIcon: ({ color, size }) => <HomeTabIcon color={color} size={size} /> }}
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

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -1,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
