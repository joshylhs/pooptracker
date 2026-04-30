import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const signIn = useAuthStore(s => s.signIn);
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);

  // Returning users skip onboarding — placeholder simulates that.
  const handleLogin = () => {
    signIn();
    completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Log in</Text>
      <Text style={styles.note}>Real login form goes here in step 3 (auth flow).</Text>
      <Button title="Log in (placeholder)" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  heading: { fontSize: 24, fontWeight: '500', marginBottom: 8 },
  note: { fontSize: 13, color: '#666', marginBottom: 24 },
});
