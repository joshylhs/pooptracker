import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/authStore';
import { getUserProfile, UserProfile, deleteUserData, updateUserProfile } from '../../services/users';
import { deleteAccount, reauthenticateUser } from '../../services/auth';
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  NotificationPrefs,
  DEFAULT_PREFS,
} from '../../services/notificationPrefs';
import { scheduleDaily } from '../../services/notifications';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Avatar from '../../components/shared/Avatar';
import Button from '../../components/shared/Button';

export default function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logOut = useAuthStore(s => s.logOut);
  const { surface } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [savedPrefs, setSavedPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [signingOut, setSigningOut] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserProfile(user.uid), loadNotificationPrefs()]).then(([p, n]) => {
      setProfile(p);
      setNotifPrefs(n);
      setSavedPrefs(n);
    });
  }, [user?.uid]);

  const isDirty = JSON.stringify(notifPrefs) !== JSON.stringify(savedPrefs);

  const timeAsDate = (() => {
    const d = new Date();
    d.setHours(notifPrefs.hour, notifPrefs.minute, 0, 0);
    return d;
  })();

  const handleTimeChange = (_: unknown, selected: Date) => {
    setNotifPrefs(p => ({ ...p, hour: selected.getHours(), minute: selected.getMinutes() }));
  };

  const handleSaveNotifs = async () => {
    if (!user) return;
    setSavingNotifs(true);
    try {
      await saveNotificationPrefs(notifPrefs);
      await scheduleDaily(notifPrefs);
      if (profile) {
        const hh = String(notifPrefs.hour).padStart(2, '0');
        const mm = String(notifPrefs.minute).padStart(2, '0');
        await updateUserProfile(user.uid, {
          notifications: { enabled: notifPrefs.enabled, time: `${hh}:${mm}`, smartSuppress: notifPrefs.smartSuppress },
        });
      }
      setSavedPrefs(notifPrefs);
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logOut();
    } finally {
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: promptForPassword },
      ],
    );
  };

  const promptForPassword = () => {
    Alert.prompt(
      'Confirm your password',
      'Enter your password to permanently delete your account.',
      async password => {
        if (!password || !user) return;
        setDeleting(true);
        try {
          await reauthenticateUser(password);
          if (profile) await deleteUserData(user.uid, profile.username);
          await deleteAccount();
          // auth listener fires → navigates to login automatically
        } catch (e: any) {
          setDeleting(false);
          Alert.alert('Error', e?.message ?? 'Failed to delete account. Try signing out and back in first.');
        }
      },
      'secure-text',
    );
  };

  const cardStyle = [styles.card, { backgroundColor: surface.surface, borderColor: surface.border }];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="screenTitle" style={styles.title}>Profile</AppText>

        {/* Identity card */}
        <View style={cardStyle}>
          <View style={styles.identity}>
            <Avatar
              initials={profile?.avatarInitials ?? (user?.displayName?.[0]?.toUpperCase() ?? '?')}
              colour={profile?.avatarColour ?? '#888'}
              size={52}
            />
            <View style={styles.identityText}>
              <AppText variant="bodyEmphasis">{profile?.username ?? '—'}</AppText>
              <AppText variant="body" colour="textSecondary">{user?.email ?? '—'}</AppText>
            </View>
          </View>
        </View>

        {/* Notifications section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          NOTIFICATIONS
        </AppText>
        <View style={cardStyle}>
          <View style={styles.row}>
            <AppText variant="body">Daily reminder</AppText>
            <Switch
              value={notifPrefs.enabled}
              onValueChange={v => setNotifPrefs(p => ({ ...p, enabled: v }))}
              trackColor={{ true: '#7F77DD' }}
            />
          </View>
          {notifPrefs.enabled && (
            <>
              <View style={[styles.divider, { backgroundColor: surface.border }]} />
              <View style={styles.row}>
                <AppText variant="body">Time</AppText>
                <DateTimePicker
                  mode="time"
                  display="compact"
                  value={timeAsDate}
                  onValueChange={handleTimeChange}
                  themeVariant="dark"
                />
              </View>
              <View style={[styles.divider, { backgroundColor: surface.border }]} />
              <View style={styles.row}>
                <View style={styles.rowLabelBlock}>
                  <AppText variant="body">Smart suppress</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Skip reminder on days you've already logged
                  </AppText>
                </View>
                <Switch
                  value={notifPrefs.smartSuppress}
                  onValueChange={v => setNotifPrefs(p => ({ ...p, smartSuppress: v }))}
                  trackColor={{ true: '#7F77DD' }}
                />
              </View>
            </>
          )}
        </View>

        {isDirty && (
          <Button
            title="Save notification settings"
            onPress={handleSaveNotifs}
            loading={savingNotifs}
          />
        )}

        {/* Account section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          ACCOUNT
        </AppText>
        <View style={styles.accountButtons}>
          <Button title="Sign out" onPress={handleSignOut} loading={signingOut} />
          <Button
            title="Delete account"
            variant="destructive"
            onPress={handleDeleteAccount}
            loading={deleting}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 8, paddingBottom: 40 },
  title: { marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 4 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  identityText: { gap: 2 },
  sectionLabel: { marginTop: 8, marginLeft: 4, letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabelBlock: { flex: 1, gap: 2, marginRight: 12 },
  divider: { height: StyleSheet.hairlineWidth },
  accountButtons: { gap: 8 },
});
