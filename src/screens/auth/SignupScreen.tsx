import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function SignupScreen() {
  const signIn = useAuthStore(s => s.signIn);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign up</Text>
      <Text style={styles.note}>Real signup form goes here in step 3 (auth flow).</Text>
      <Button title="Create account (placeholder)" onPress={signIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  heading: { fontSize: 24, fontWeight: '500', marginBottom: 8 },
  note: { fontSize: 13, color: '#666', marginBottom: 24 },
});
