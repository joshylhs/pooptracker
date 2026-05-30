import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import {
  DEFAULT_PREFS,
  NotificationPrefs,
  saveNotificationPrefs,
} from '../../services/notificationPrefs';
import { requestPermission, scheduleDaily } from '../../services/notifications';
import { createUserProfile, UsernameTakenError } from '../../services/users';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';
import TextField from '../../components/shared/TextField';
import { AvatarPicker, AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../../components/avatar';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;


export default function OnboardingScreen() {
  const { surface, colours } = useTheme();
  const user = useAuthStore(s => s.user);
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);

  const [username, setUsername] = useState('');
  const [useAvatar, setUseAvatar] = useState(true);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

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

  const validateUsername = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'Pick a username so friends can find you.';
    if (!USERNAME_PATTERN.test(trimmed)) {
      return '3–20 characters: letters, numbers, underscores.';
    }
    return null;
  };

  const handleContinue = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }
    if (!user) {
      setUsernameError('Not signed in. Try again.');
      return;
    }

    setUsernameError(null);
    setIsSaving(true);
    try {
      await createUserProfile({
        uid: user.uid,
        displayName: user.displayName ?? username.trim(),
        username: username.trim(),
        avatarConfig: useAvatar ? avatarConfig : undefined,
        notifications: prefs,
      });
      await saveNotificationPrefs(prefs, user.uid);
      await requestPermission();
      await scheduleDaily(prefs);
      completeOnboarding();
    } catch (e) {
      if (e instanceof UsernameTakenError) {
        setUsernameError(e.message);
      } else {
        setUsernameError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        <AppText variant="screenTitle" style={styles.title}>
          Set up your account
        </AppText>
        <AppText variant="body" colour="textSecondary" style={styles.subtitle}>
          A username so friends can find you, and a daily nudge so you never miss a log.
        </AppText>

        <TextField
          label="Username"
          value={username}
          onChangeText={text => {
            setUsername(text);
            if (usernameError) setUsernameError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="e.g. josh_l"
          error={usernameError}
        />

        <AppText variant="bodyEmphasis" style={styles.sectionTitle}>Your avatar</AppText>
        <View
          style={[
            styles.card,
            styles.avatarToggleCard,
            { backgroundColor: surface.surface, borderColor: surface.border },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.reminderLabel}>
              <AppText variant="body">Use cat avatar</AppText>
              <AppText variant="caption" colour="textSecondary">
                Or we'll use your initials instead
              </AppText>
            </View>
            <Switch
              value={useAvatar}
              onValueChange={setUseAvatar}
              trackColor={{ false: surface.border, true: colours.primary400 }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>
        </View>
        {useAvatar && (
          <View style={styles.pickerContainer}>
            <AvatarPicker
              initial={avatarConfig}
              onConfirm={setAvatarConfig}
            />
          </View>
        )}

        <View
          style={[
            styles.card,
            { backgroundColor: surface.surface, borderColor: surface.border },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.reminderLabel}>
              <AppText variant="body">Daily reminder</AppText>
              <AppText variant="caption" colour="textSecondary">
                Change anytime in profile settings!
              </AppText>
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
                <View style={styles.suppressLabel}>
                  <AppText variant="body">Only remind if needed</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Won't remind you if you've logged today
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

        <View style={styles.cta}>
          <Button title="Continue" onPress={handleContinue} loading={isSaving} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 0 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 24 },
  sectionTitle: { marginTop: 24, marginBottom: 8 },
  avatarToggleCard: { marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  divider: { height: 1, marginHorizontal: 14 },
  reminderLabel: { flex: 1, paddingRight: 12, gap: 3 },
  timePicker: { width: '100%' },
  suppressLabel: { flex: 1, paddingRight: 12, gap: 3 },
  switch: { transform: [{ scaleX: 0.9 }, { scaleY: 1 }] },
  cta: { marginTop: 24 },
  pickerContainer: { height: 520 },
});
