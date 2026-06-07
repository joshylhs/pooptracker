import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
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

function FadeTab({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }, [opacity]),
  );
  return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>;
}

function ScaleTabButton(props: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const { children, style, onPress, onLongPress, accessibilityRole, accessibilityState, testID } = props;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.80, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,   speed: 40, bounciness: 5, useNativeDriver: true }).start()}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function HomeTabIcon({ color, size }: { color: string; size: number }) {
  const { status } = useHealthFindings();
  const showBadge = status.severity === 'urgent' || status.severity === 'gp';
  return (
    <View>
      <MCI name="home" size={size} color={color} />
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: status.colour }]} />
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, []);

  return (
  <Animated.View style={{ flex: 1, opacity }}>
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => <ScaleTabButton {...props} />,
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
        options={{ tabBarIcon: ({ color, size }) => <HomeTabIcon color={color} size={size} /> }}
      >
        {() => <FadeTab><HomeStack /></FadeTab>}
      </Tab.Screen>
      <Tab.Screen
        name="Friends"
        options={{ tabBarIcon: ({ color, size }) => <MCI name="account-group" size={size} color={color} /> }}
      >
        {() => <FadeTab><FriendsStack /></FadeTab>}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{ tabBarIcon: ({ color, size }) => <MCI name="account" size={size} color={color} /> }}
      >
        {() => <FadeTab><ProfileScreen /></FadeTab>}
      </Tab.Screen>
    </Tab.Navigator>
  </Animated.View>
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
