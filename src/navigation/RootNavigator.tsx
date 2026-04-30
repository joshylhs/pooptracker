import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore(s => s.hasCompletedOnboarding);

  if (!isAuthenticated) return <AuthStack />;
  if (!hasCompletedOnboarding) return <OnboardingScreen />;
  return <AppTabs />;
}
