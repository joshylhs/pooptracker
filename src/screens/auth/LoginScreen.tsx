import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';
import TextField from '../../components/shared/TextField';

export default function LoginScreen() {
  const logIn = useAuthStore(s => s.logIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await logIn({ email: email.trim(), password });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Log in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer centered>
      <AppText variant="screenTitle" style={styles.heading}>
        Log in
      </AppText>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        placeholder="you@example.com"
      />

      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={error}
      />

      <View style={styles.submit}>
        <Button
          title="Log in"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 16 },
  submit: { marginTop: 12 },
});
