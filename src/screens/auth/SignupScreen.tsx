import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import {
  DEFAULT_PREFS,
  NotificationPrefs,
  saveNotificationPrefs,
} from '../../services/notificationPrefs';
import { requestPermission, scheduleDaily } from '../../services/notifications';
import { signUp as signUpService, deleteAccount, friendlyAuthError } from '../../services/auth';
import { checkUsernameExists, createUserProfile } from '../../services/users';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';
import TextField from '../../components/shared/TextField';
import { AvatarPicker, AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../../components/avatar';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;

export default function SignupScreen() {
  const { surface, colours } = useTheme();
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [useAvatar, setUseAvatar] = useState(true);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const avatarHeight = useRef(new Animated.Value(521)).current;

  useEffect(() => {
    Animated.timing(avatarHeight, {
      toValue: useAvatar ? 521 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [useAvatar]);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const update = (patch: Partial<NotificationPrefs>) =>
    setPrefs(p => ({ ...p, ...patch }));

  const pickerDate = new Date();
  pickerDate.setHours(prefs.slots[0].hour, prefs.slots[0].minute, 0, 0);

  const onTimeChange = (_: unknown, date: Date) => {
    setPrefs(p => ({
      ...p,
      slots: [{ hour: date.getHours(), minute: date.getMinutes() }],
    }));
  };

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6 &&
    username.trim().length >= 3 &&
    !isSubmitting;

  const handleSubmit = async () => {
    setEmailError(null);
    setPasswordError(null);
    setUsernameError(null);
    setGeneralError(null);

    let hasError = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      hasError = true;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }
    if (!username.trim()) {
      setUsernameError('Pick a username so friends can find you.');
      hasError = true;
    } else if (!USERNAME_PATTERN.test(username.trim())) {
      setUsernameError('3–20 characters: letters, numbers, underscores.');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    let firebaseUser = null;
    try {
      const usernameTaken = await checkUsernameExists(username.trim());
      if (usernameTaken) {
        setUsernameError('That username is already taken.');
        return;
      }

      firebaseUser = await signUpService({ email: email.trim(), password, displayName: username.trim() });
      await createUserProfile({
        uid: firebaseUser.uid,
        username: username.trim(),
        avatarConfig: useAvatar ? avatarConfig : undefined,
        notifications: prefs,
      });
      await saveNotificationPrefs(prefs, firebaseUser.uid);
      await requestPermission();
      await scheduleDaily(prefs);
      completeOnboarding();
    } catch (e: unknown) {
      if (firebaseUser) {
        try { await deleteAccount(); } catch { /* best effort */ }
      }
      const code = (e as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        setEmailError(friendlyAuthError(e));
      } else if (code === 'auth/weak-password') {
        setPasswordError(friendlyAuthError(e));
      } else {
        setGeneralError(friendlyAuthError(e));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        <AppText variant="screenTitle" style={styles.title}>
          Create account
        </AppText>

        <TextField
          label="Email"
          value={email}
          onChangeText={v => { setEmail(v); setEmailError(null); }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          placeholder="you@example.com"
          error={emailError}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={v => { setPassword(v); setPasswordError(null); }}
          secureTextEntry
          placeholder="6+ characters"
          error={passwordError}
        />

        <TextField
          label="Username"
          value={username}
          onChangeText={text => { setUsername(text); setUsernameError(null); }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="e.g. josh_l"
          error={usernameError}
          hint="3–20 characters: letters, numbers, underscores only"
        />

        <AppText variant="bodyEmphasis" style={styles.sectionTitle}>Your avatar</AppText>
        <View style={[styles.card, { backgroundColor: surface.surface, borderColor: surface.border }]}>
          <View style={styles.row}>
            <MCI name="cat" size={18} color={surface.textSecondary} style={styles.rowIcon} />
            <View style={styles.rowLabel}>
              <AppText variant="body">Use cat avatar</AppText>
              <AppText variant="caption" colour="textSecondary">Or we'll use your initials instead</AppText>
            </View>
            <Switch
              value={useAvatar}
              onValueChange={setUseAvatar}
              trackColor={{ false: surface.border, true: colours.primary400 }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>
          <Animated.View style={{ height: avatarHeight, overflow: 'hidden' }}>
            <View style={[styles.divider, { backgroundColor: surface.border }]} />
            <View style={styles.pickerContainer}>
              <AvatarPicker initial={avatarConfig} onConfirm={setAvatarConfig} headerBorderRadius={0} />
            </View>
          </Animated.View>
        </View>

        <AppText variant="bodyEmphasis" style={styles.sectionTitle}>Daily reminder</AppText>
        <View style={[styles.card, { backgroundColor: surface.surface, borderColor: surface.border }]}>
          <View style={styles.row}>
            <MCI name="bell-outline" size={18} color={surface.textSecondary} style={styles.rowIcon} />
            <View style={styles.rowLabel}>
              <AppText variant="body">Daily reminder</AppText>
              <AppText variant="caption" colour="textSecondary">Change anytime in profile settings</AppText>
            </View>
            <Switch
              value={prefs.enabled}
              onValueChange={enabled => update({ enabled })}
              trackColor={{ false: surface.border, true: colours.primary400 }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>

          {prefs.enabled && (
            <>
              <View style={[styles.divider, { backgroundColor: surface.border }]} />
              <DateTimePicker
                mode="time"
                display="spinner"
                value={pickerDate}
                onValueChange={onTimeChange}
                textColor={surface.textPrimary}
                style={styles.timePicker}
              />
              <View style={[styles.divider, { backgroundColor: surface.border }]} />
              <View style={styles.row}>
                <MCI name="bell-sleep-outline" size={18} color={surface.textSecondary} style={styles.rowIcon} />
                <View style={styles.rowLabel}>
                  <AppText variant="body">Smart suppress</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Skip reminders on days you've already logged
                  </AppText>
                </View>
                <Switch
                  value={prefs.smartSuppress}
                  onValueChange={smartSuppress => update({ smartSuppress })}
                  trackColor={{ false: surface.border, true: colours.primary400 }}
                  thumbColor="#fff"
                  style={styles.switch}
                />
              </View>
            </>
          )}
        </View>

        {generalError && (
          <AppText style={styles.generalError}>{generalError}</AppText>
        )}
        <View style={styles.cta}>
          <Button title="Create account" onPress={handleSubmit} loading={isSubmitting} disabled={!canSubmit} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 24 },
  title: { marginBottom: 20 },
  sectionTitle: { marginTop: 24, marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowIcon: { marginRight: 10 },
  rowLabel: { flex: 1, paddingRight: 12, gap: 3 },
  divider: { height: 1, marginHorizontal: 14 },
  timePicker: { width: '100%' },
  switch: { transform: [{ scaleX: 0.9 }, { scaleY: 1 }] },
  pickerContainer: { height: 520 },
  generalError: { color: '#E57373', fontSize: 13, textAlign: 'center', marginTop: 8 },
  cta: { marginTop: 24 },
});
