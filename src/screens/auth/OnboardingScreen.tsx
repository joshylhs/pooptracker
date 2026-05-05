import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import {
  DEFAULT_PREFS,
  NotificationPrefs,
  saveNotificationPrefs,
} from '../../services/notificationPrefs';
import { createUserProfile, UsernameTakenError } from '../../services/users';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';
import TextField from '../../components/shared/TextField';

// 30-minute steps from 6:00 AM to 10:00 PM
const TIMES: { hour: number; minute: number }[] = [];
for (let h = 6; h <= 22; h++) {
  TIMES.push({ hour: h, minute: 0 });
  if (h < 22) TIMES.push({ hour: h, minute: 30 });
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  const m = String(minute).padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

export default function OnboardingScreen() {
  const { surface, colours } = useTheme();
  const user = useAuthStore(s => s.user);
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);

  const [username, setUsername] = useState('');
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const update = (patch: Partial<NotificationPrefs>) =>
    setPrefs(p => ({ ...p, ...patch }));

  const stepTime = (dir: 1 | -1) => {
    const idx = TIMES.findIndex(
      t => t.hour === prefs.hour && t.minute === prefs.minute,
    );
    const next = TIMES[(idx + dir + TIMES.length) % TIMES.length];
    update({ hour: next.hour, minute: next.minute });
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
        notifications: prefs,
      });
      await saveNotificationPrefs(prefs);
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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

        <View
          style={[
            styles.card,
            { backgroundColor: surface.surface, borderColor: surface.border },
          ]}
        >
          <View style={styles.row}>
            <AppText variant="body">Daily reminder</AppText>
            <Switch
              value={prefs.enabled}
              onValueChange={enabled => update({ enabled })}
              trackColor={{ false: surface.border, true: colours.primary400 }}
              thumbColor="#fff"
            />
          </View>

          {prefs.enabled && (
            <>
              <View style={[styles.divider, { backgroundColor: surface.border }]} />

              <View style={styles.row}>
                <AppText variant="body">Time</AppText>
                <View style={styles.timePicker}>
                  <Pressable onPress={() => stepTime(-1)} hitSlop={10}>
                    <AppText style={[styles.arrow, { color: surface.textPrimary }]}>
                      ‹
                    </AppText>
                  </Pressable>
                  <AppText variant="bodyEmphasis" style={styles.timeLabel}>
                    {formatTime(prefs.hour, prefs.minute)}
                  </AppText>
                  <Pressable onPress={() => stepTime(1)} hitSlop={10}>
                    <AppText style={[styles.arrow, { color: surface.textPrimary }]}>
                      ›
                    </AppText>
                  </Pressable>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: surface.border }]} />

              <View style={styles.row}>
                <View style={styles.suppressLabel}>
                  <AppText variant="body">Skip if already logged</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    No reminder if you've already logged today
                  </AppText>
                </View>
                <Switch
                  value={prefs.smartSuppress}
                  onValueChange={smartSuppress => update({ smartSuppress })}
                  trackColor={{ false: surface.border, true: colours.primary400 }}
                  thumbColor="#fff"
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
  card: { borderWidth: 1, borderRadius: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  divider: { height: 1, marginHorizontal: 14 },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrow: { fontSize: 26, lineHeight: 26 },
  timeLabel: { minWidth: 80, textAlign: 'center' },
  suppressLabel: { flex: 1, paddingRight: 12 },
  cta: { marginTop: 24 },
});
