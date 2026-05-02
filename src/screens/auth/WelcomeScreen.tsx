import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer centered>
      <AppText variant="screenTitle" style={styles.title}>
        shitster
      </AppText>
      <View style={styles.buttons}>
        <Button title="Create account" onPress={() => navigation.navigate('Signup')} />
        <Button
          title="I have an account"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', fontSize: 32, marginBottom: 32 },
  buttons: { gap: 12 },
});
