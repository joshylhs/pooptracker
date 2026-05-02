import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

export default function RootNavigator() {
  const isInitialised = useAuthStore(s => s.isInitialised);
  const user = useAuthStore(s => s.user);
  const hasCompletedOnboarding = useAuthStore(s => s.hasCompletedOnboarding);

  if (!isInitialised) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator />
      </View>
    );
  }

  if (user === null) return <AuthStack />;
  if (!hasCompletedOnboarding) return <OnboardingScreen />;
  return <AppTabs />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
