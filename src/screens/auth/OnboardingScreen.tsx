import { StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);

  return (
    <ScreenContainer centered>
      <AppText variant="screenTitle" style={styles.heading}>
        Welcome aboard
      </AppText>
      <AppText variant="body" colour="textSecondary" style={styles.note}>
        Notification preferences (toggle, time picker, smart suppress) go here in step 4.
      </AppText>
      <Button title="Continue" onPress={completeOnboarding} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 8 },
  note: { marginBottom: 24 },
});
