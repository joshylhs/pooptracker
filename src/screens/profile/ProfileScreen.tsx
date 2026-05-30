import { Fragment, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/authStore';
import { getUserProfile, UserProfile, deleteUserData, updateUserProfile } from '../../services/users';
import { useFriendsStore } from '../../store/friendsStore';
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
import Button from '../../components/shared/Button';
import AvatarPickerModal from '../../components/shared/AvatarPickerModal';
import Avatar from '../../components/shared/Avatar';
import { CatAvatarCircle, AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../../components/avatar';

export default function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logOut = useAuthStore(s => s.logOut);
  const { surface } = useTheme();
  const friends = useFriendsStore(s => s.friends);
  const trustedFriendIds = useFriendsStore(s => s.trustedFriendIds);
  const loadTrustedFriends = useFriendsStore(s => s.loadTrustedFriends);
  const toggleTrust = useFriendsStore(s => s.toggleTrust);
  const setAllTrusted = useFriendsStore(s => s.setAllTrusted);
  const loadAll = useFriendsStore(s => s.loadAll);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [savedPrefs, setSavedPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [signingOut, setSigningOut] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [trustModalVisible, setTrustModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserProfile(user.uid), loadNotificationPrefs(user.uid)]).then(([p, n]) => {
      setProfile(p);
      setAvatarConfig(p?.avatarConfig ?? null);
      setNotifPrefs(n);
      setSavedPrefs(n);
    });
    loadAll();
    loadTrustedFriends();
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

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await logOut();
            } finally {
              setSigningOut(false);
            }
          },
        },
      ],
    );
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

  const handleAvatarSave = async (config: AvatarConfig) => {
    if (!user) return;
    setSavingAvatar(true);
    try {
      await updateUserProfile(user.uid, { avatarConfig: config });
      setAvatarConfig(config);
      setProfile(p => p ? { ...p, avatarConfig: config } : p);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleAvatarToggle = async (enabled: boolean) => {
    if (!user) return;
    if (enabled) {
      setAvatarPickerVisible(true);
    } else {
      if (avatarConfig) {
        Alert.alert(
          'Remove cat avatar?',
          'Your current avatar will be lost and you\'ll revert to your initials.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove', style: 'destructive', onPress: async () => {
                setSavingAvatar(true);
                try {
                  await updateUserProfile(user.uid, { avatarConfig: null });
                  setAvatarConfig(null);
                  setProfile(p => p ? { ...p, avatarConfig: undefined } : p);
                } finally {
                  setSavingAvatar(false);
                }
              },
            },
          ],
        );
      }
    }
  };

  const AVATAR_SIZE = 72;

  const cardStyle = [styles.card, { backgroundColor: surface.surface, borderColor: surface.border }];
  const dividerStyle = [styles.divider, { backgroundColor: surface.border }];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="screenTitle" style={styles.title}>Profile</AppText>

        {/* Identity card */}
        <View style={cardStyle}>
          <View style={styles.identity}>
            {avatarConfig ? (
              <Pressable onPress={() => setAvatarPickerVisible(true)} hitSlop={4}>
                <CatAvatarCircle config={avatarConfig} size={AVATAR_SIZE} />
                <View style={styles.editBadge}>
                  <AppText style={styles.editBadgeText}>✎</AppText>
                </View>
              </Pressable>
            ) : (
              <Avatar
                initials={profile?.avatarInitials ?? '?'}
                colour={profile?.avatarColour ?? '#888'}
                size={AVATAR_SIZE}
              />
            )}
            <View style={styles.identityText}>
              <AppText variant="bodyEmphasis">{profile?.username ?? '—'}</AppText>
              {profile?.createdAt && (
                <AppText variant="body" colour="textSecondary">
                  Logging since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </AppText>
              )}
              <AppText variant="caption" colour="textSecondary" style={styles.emailText}>{user?.email ?? '—'}</AppText>
            </View>
          </View>
          <View style={dividerStyle} />
          <View style={styles.row}>
            <View style={styles.rowLabelBlock}>
              <AppText variant="body">Use cat avatar</AppText>
              <AppText variant="caption" colour="textSecondary">
                Turning this off uses your initials
              </AppText>
            </View>
            <Switch
              value={avatarConfig !== null}
              onValueChange={handleAvatarToggle}
              disabled={savingAvatar}
              trackColor={{ true: '#7F77DD' }}
            />
          </View>
        </View>

        <AvatarPickerModal
          visible={avatarPickerVisible}
          current={avatarConfig ?? DEFAULT_AVATAR_CONFIG}
          onSave={handleAvatarSave}
          onClose={() => setAvatarPickerVisible(false)}
          saving={savingAvatar}
        />

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

          {friends.length > 0 && (
            <>
              <View style={[dividerStyle, { marginVertical: 0 }]} />
              <Pressable style={styles.row} onPress={() => setTrustModalVisible(true)} hitSlop={4}>
                <View style={styles.rowLabelBlock}>
                  <AppText variant="body">Trusted friends</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Trusted friends can see your detailed stats
                  </AppText>
                </View>
                <AppText variant="caption" colour="textSecondary">
                  {trustedFriendIds.length > 0 ? `${trustedFriendIds.length} trusted` : 'None'} ›
                </AppText>
              </Pressable>
            </>
          )}
        </View>

        {/* Trusted friends modal */}
        <Modal visible={trustModalVisible} transparent animationType="fade" onRequestClose={() => setTrustModalVisible(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setTrustModalVisible(false)}>
            <View style={[styles.modalSheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
              <AppText variant="sectionHeading" style={styles.modalTitle}>Trusted friends</AppText>
              <AppText variant="caption" colour="textSecondary" style={styles.modalHint}>
                Trusted friends can see your detailed stats
              </AppText>
              <ScrollView>
                <View style={styles.row}>
                  <AppText variant="body">All friends</AppText>
                  <Switch
                    value={friends.length > 0 && friends.every(f => trustedFriendIds.includes(f.uid))}
                    onValueChange={v => setAllTrusted(friends.map(f => f.uid), v)}
                    trackColor={{ true: '#7F77DD' }}
                  />
                </View>
                <View style={dividerStyle} />
                {friends.map((f, i) => (
                  <Fragment key={f.uid}>
                    {i > 0 && <View style={dividerStyle} />}
                    <View style={styles.row}>
                      <View style={styles.trustAvatarRow}>
                        {f.avatarConfig
                          ? <CatAvatarCircle config={f.avatarConfig} size={28} />
                          : <Avatar initials={f.avatarInitials} colour={f.avatarColour} size={28} />
                        }
                        <AppText variant="body">{f.username}</AppText>
                      </View>
                      <Switch
                        value={trustedFriendIds.includes(f.uid)}
                        onValueChange={() => toggleTrust(f.uid)}
                        trackColor={{ true: '#7F77DD' }}
                      />
                    </View>
                  </Fragment>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Account section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          ACCOUNT
        </AppText>
        <View style={styles.accountButtons}>
          <Button title="Sign out" icon="logout" onPress={handleSignOut} loading={signingOut} />
          <Button
            title="Delete account"
            variant="destructive"
            icon="account-remove"
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
  identityText: { gap: 5 },
  emailText: { fontStyle: 'italic' },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeText: { fontSize: 10, color: '#fff' },
  sectionLabel: { marginTop: 8, marginLeft: 4, letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  slotRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotRow: { paddingLeft: 20 },
  rowLabelBlock: { flex: 1, gap: 3, marginRight: 12 },
  divider: { height: StyleSheet.hairlineWidth },
  dividerThick: { height: 1 },
  addLabel: { color: '#7F77DD' },
  accountButtons: { gap: 8 },
  trustHeader: { paddingVertical: 10, gap: 2 },
  trustHint: { fontStyle: 'italic' },
  trustAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalSheet: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 400,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalTitle: { marginBottom: 4 },
  modalHint: { marginBottom: 12, fontStyle: 'italic' },
});
