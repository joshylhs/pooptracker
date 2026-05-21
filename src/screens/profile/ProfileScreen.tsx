import { Fragment, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/authStore';
import { getUserProfile, UserProfile, deleteUserData, updateUserProfile } from '../../services/users';
import { deleteAccount, reauthenticateUser } from '../../services/auth';
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  NotificationPrefs,
  DEFAULT_PREFS,
  MAX_NOTIFICATION_SLOTS,
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
    Promise.all([getUserProfile(user.uid), loadNotificationPrefs(user.uid)]).then(([p, n]) => {
      setProfile(p);
      setNotifPrefs(n);
      setSavedPrefs(n);
    });
  }, [user?.uid]);

  const isDirty = JSON.stringify(notifPrefs) !== JSON.stringify(savedPrefs);

  const handleSlotTimeChange = (index: number) => (_: unknown, selected: Date) => {
    setNotifPrefs(p => ({
      ...p,
      slots: p.slots.map((s, i) =>
        i === index ? { hour: selected.getHours(), minute: selected.getMinutes() } : s,
      ),
    }));
  };

  const addSlot = () => {
    setNotifPrefs(p => ({ ...p, slots: [...p.slots, { hour: 9, minute: 0 }] }));
  };

  const removeSlot = (index: number) => {
    setNotifPrefs(p => ({ ...p, slots: p.slots.filter((_, i) => i !== index) }));
  };

  const handleSaveNotifs = async () => {
    if (!user) return;
    setSavingNotifs(true);
    try {
      await saveNotificationPrefs(notifPrefs, user.uid);
      await scheduleDaily(notifPrefs);
      if (profile) {
        await updateUserProfile(user.uid, {
          notifications: {
            enabled: notifPrefs.enabled,
            times: notifPrefs.slots.map(
              s => `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`,
            ),
            smartSuppress: notifPrefs.smartSuppress,
          },
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
  const dividerStyle = [styles.divider, { backgroundColor: surface.border }];

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
              {notifPrefs.slots.map((slot, i) => {
                const slotDate = new Date();
                slotDate.setHours(slot.hour, slot.minute, 0, 0);
                return (
                  <Fragment key={i}>
                    <View style={dividerStyle} />
                    <View style={[styles.row, styles.slotRow]}>
                      <AppText variant="body">
                        {notifPrefs.slots.length > 1 ? `Reminder ${i + 1}` : 'Time'}
                      </AppText>
                      <View style={styles.slotRight}>
                        <DateTimePicker
                          mode="time"
                          display="compact"
                          value={slotDate}
                          onValueChange={handleSlotTimeChange(i)}
                          themeVariant="dark"
                        />
                        {notifPrefs.slots.length > 1 && (
                          <Pressable onPress={() => removeSlot(i)} hitSlop={8}>
                            <AppText variant="body" colour="textSecondary"> ✕</AppText>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </Fragment>
                );
              })}

              {notifPrefs.slots.length < MAX_NOTIFICATION_SLOTS && (
                <>
                  <View style={dividerStyle} />
                  <Pressable onPress={addSlot} style={[styles.row, styles.slotRow]}>
                    <AppText variant="body" style={styles.addLabel}>+ Add reminder</AppText>
                  </Pressable>
                </>
              )}

              <View style={[styles.dividerThick, { backgroundColor: surface.border }]} />
              <View style={styles.row}>
                <View style={styles.rowLabelBlock}>
                  <AppText variant="body">Smart suppress</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Skip reminders on days you've already logged
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

        {/* Friends section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          FRIENDS
        </AppText>
        <View style={cardStyle}>
          <View style={styles.row}>
            <View style={styles.rowLabelBlock}>
              <AppText variant="body">Allow pokes</AppText>
              <AppText variant="caption" colour="textSecondary">
                Friends can nudge you to log
              </AppText>
            </View>
            <Switch
              value={profile?.allowPokes !== false}
              onValueChange={async v => {
                if (!user || !profile) return;
                await updateUserProfile(user.uid, { allowPokes: v });
                setProfile(p => p ? { ...p, allowPokes: v } : p);
              }}
              trackColor={{ true: '#7F77DD' }}
            />
          </View>
        </View>

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
  slotRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotRow: { paddingLeft: 20 },
  rowLabelBlock: { flex: 1, gap: 2, marginRight: 12 },
  divider: { height: StyleSheet.hairlineWidth },
  dividerThick: { height: 1 },
  addLabel: { color: '#7F77DD' },
  accountButtons: { gap: 8 },
});
