import { Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const FEATURES = [
  { icon: 'calendar-check', text: 'Log every visit and track patterns over time' },
  { icon: 'chart-bar',      text: 'Weekly insights and stool type distribution' },
  { icon: 'account-group',  text: 'Compare with friends on the leaderboard' },
];

export default function WelcomeScreen({ navigation }: Props) {
  const { surface, colours } = useTheme();

  return (
    <ScreenContainer centered>
      <View style={styles.titleRow}>
        <Image source={require('../../assets/app-icon.png')} style={styles.appIcon} />
        <AppText variant="screenTitle" style={styles.title}>Sit on It!</AppText>
      </View>
      <AppText variant="body" colour="textSecondary" style={styles.subtitle}>
        Your gut health tracked simply and privately.
      </AppText>

      <View style={styles.featureList}>
        {FEATURES.map(f => (
          <View key={f.icon} style={styles.featureRow}>
            <View style={[styles.featureIconWrap, { backgroundColor: colours.primary50 }]}>
              <MCI name={f.icon} size={20} color={colours.primary400} />
            </View>
            <AppText variant="body" style={styles.featureText}>{f.text}</AppText>
          </View>
        ))}
      </View>

      <View style={[styles.privacyNote, { backgroundColor: surface.surface, borderColor: surface.border }]}>
        <MCI name="shield-account" size={14} color={surface.textSecondary} />
        <AppText variant="caption" colour="textSecondary" style={styles.privacyText}>
          Shared details only with friends you trust!
        </AppText>
      </View>

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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 },
  appIcon: { width: 48, height: 48, borderRadius: 12 },
  title: { fontSize: 32 },
  subtitle: { textAlign: 'center', marginBottom: 28 },
  featureList: { gap: 14, marginBottom: 20, alignSelf: 'stretch' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { flex: 1 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 28, alignSelf: 'center' },
  privacyText: {},
  buttons: { gap: 12, alignSelf: 'stretch' },
});
