import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const signOut = useAuthStore(s => s.signOut);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.note}>
        Stats, settings, edit profile, notifications go here later.
      </Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  heading: { fontSize: 24, fontWeight: '500', marginBottom: 8 },
  note: { fontSize: 13, color: '#666', marginBottom: 24 },
});
