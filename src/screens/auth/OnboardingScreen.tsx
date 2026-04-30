import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome aboard</Text>
      <Text style={styles.note}>
        Notification preferences (toggle, time picker, smart suppress) go here in step 4.
      </Text>
      <Button title="Continue" onPress={completeOnboarding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  heading: { fontSize: 24, fontWeight: '500', marginBottom: 8 },
  note: { fontSize: 13, color: '#666', marginBottom: 24 },
});
