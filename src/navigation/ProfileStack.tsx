import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AchievementsScreen from '../screens/profile/AchievementsScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ presentation: 'card', animation: 'slide_from_right', gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}
