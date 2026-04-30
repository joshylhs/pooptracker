import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PoopTracker</Text>
      <Button title="Create account" onPress={() => navigation.navigate('Signup')} />
      <View style={styles.spacer} />
      <Button title="I have an account" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '600', textAlign: 'center', marginBottom: 32 },
  spacer: { height: 12 },
});
