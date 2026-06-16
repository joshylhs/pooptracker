import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import DeviceInfo from 'react-native-device-info';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/authStore';
import { getUserProfile, UserProfile, deleteUserData, updateUserProfile } from '../../services/users';
import { useFriendsStore } from '../../store/friendsStore';
import { deleteAccount } from '../../services/auth';
import { submitFeedback as submitFeedbackService, FeedbackPayload } from '../../services/feedback';
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  NotificationPrefs,
  DEFAULT_PREFS,
  MAX_NOTIFICATION_SLOTS,
} from '../../services/notificationPrefs';
import { scheduleDaily } from '../../services/notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';
import AvatarPickerModal from '../../components/shared/AvatarPickerModal';
import Avatar from '../../components/shared/Avatar';
import { CatAvatarCircle, AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../../components/avatar';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import type { BadgeKey } from '../../utils/badgeUtils';

function RemoveSlotButton({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      onPressIn={() => Animated.spring(scale, { toValue: 0.82, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, speed: 40, bounciness: 5, useNativeDriver: true }).start()}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <AppText variant="body" colour="textSecondary"> ✕</AppText>
      </Animated.View>
    </Pressable>
  );
}

const DELETE_REASONS = [
  "It's not useful enough",
  'Privacy concerns',
  'Too many bugs',
  'Taking a break',
  'Other',
];

const FEEDBACK_TOPICS = [
  'Bug report',
  'Feature request',
  'General feedback',
];

const FEEDBACK_TOPIC_ICONS: Record<string, string> = {
  'Bug report':       'bug',
  'Feature request':  'lightbulb-on',
  'General feedback': 'chat',
};

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen() {
  const { top: topInset } = useSafeAreaInsets();
  const navigation = useNavigation<ProfileNav>();
  const user = useAuthStore(s => s.user);
  const logOut = useAuthStore(s => s.logOut);
  const { surface, colours } = useTheme();
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState<string | undefined>(undefined);
  const [deleteFreeText, setDeleteFreeText] = useState('');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackTopic, setFeedbackTopic] = useState<string | undefined>(undefined);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

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
  const saveBtnOp      = useRef(new Animated.Value(0)).current;
  const saveBtnScale   = useRef(new Animated.Value(0.88)).current;
  const addSlotScale    = useRef(new Animated.Value(1)).current;
  const trustedBtnScale = useRef(new Animated.Value(1)).current;
  const avatarScale     = useRef(new Animated.Value(1)).current;
  const [showSaveBtn, setShowSaveBtn] = useState(false);

  useEffect(() => {
    if (isDirty) {
      LayoutAnimation.configureNext({
        duration: 220,
        create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
      saveBtnOp.setValue(0);
      saveBtnScale.setValue(0.88);
      setShowSaveBtn(true);
      Animated.parallel([
        Animated.timing(saveBtnOp,    { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(saveBtnScale, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(saveBtnOp,    { toValue: 0,    duration: 160, useNativeDriver: true }),
        Animated.timing(saveBtnScale, { toValue: 0.88, duration: 160, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) {
          LayoutAnimation.configureNext({
            duration: 180,
            delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
            update: { type: LayoutAnimation.Types.easeInEaseOut },
          });
          setShowSaveBtn(false);
        }
      });
    }
  }, [isDirty]);

  const handleSlotTimeChange = (index: number) => (_: unknown, selected: Date) => {
    setNotifPrefs(p => ({
      ...p,
      slots: p.slots.map((s, i) =>
        i === index ? { hour: selected.getHours(), minute: selected.getMinutes() } : s,
      ),
    }));
  };

  const addSlot = () => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    setNotifPrefs(p => ({ ...p, slots: [...p.slots, { hour: 9, minute: 0 }] }));
  };

  const removeSlot = (index: number) => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
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

  const handleDeleteAccount = () => setDeleteModalVisible(true);

  const handleCancelDelete = () => {
    if (deleting) return;
    setDeleteModalVisible(false);
    setDeleteConfirmText('');
    setDeleteReason(undefined);
    setDeleteFreeText('');
  };

  const buildSystemInfo = (): Pick<FeedbackPayload, 'username' | 'email' | 'platform' | 'deviceModel' | 'appVersion'> => ({
    username: profile?.username,
    email: user?.email ?? undefined,
    platform: Platform.OS,
    deviceModel: DeviceInfo.getModel(),
    appVersion: `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
  });

  const handleConfirmDelete = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await submitFeedbackService({
        type: 'deletion',
        topic: deleteReason,
        freeText: deleteFreeText || undefined,
        ...buildSystemInfo(),
      });
    } catch {
      // non-fatal — proceed with deletion even if feedback fails
    }
    try {
      if (profile) await deleteUserData(user.uid, profile.username);
      await deleteAccount();
      // auth listener fires → navigates to AuthStack automatically
    } catch (e: any) {
      setDeleting(false);
      if (e?.code === 'auth/requires-recent-login') {
        Alert.alert('Session expired', 'Sign out and sign back in, then try again.');
      } else {
        Alert.alert('Error', 'Could not delete account. Try signing out and back in first.');
      }
    }
  };

  const handleCancelFeedback = () => {
    if (submittingFeedback) return;
    setFeedbackModalVisible(false);
    setFeedbackTopic(undefined);
    setFeedbackText('');
    setFeedbackSent(false);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() && !feedbackTopic) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedbackService({
        type: 'general',
        topic: feedbackTopic,
        freeText: feedbackText.trim() || undefined,
        ...buildSystemInfo(),
      });
      setFeedbackSent(true);
    } catch {
      Alert.alert('Error', 'Could not send feedback. Check your connection and try again.');
    } finally {
      setSubmittingFeedback(false);
    }
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
          "Your current avatar will be lost and you'll revert to your initials.",
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
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topInset, paddingHorizontal: 24 }]} style={{ marginHorizontal: -24 }} scrollIndicatorInsets={{ right: 6 }} indicatorStyle="white">
        <AppText variant="screenTitle" style={styles.title}>Profile</AppText>

        {/* Identity card */}
        <View style={cardStyle}>
          <View style={styles.identity}>
            {avatarConfig ? (
              <Pressable
                onPress={() => setAvatarPickerVisible(true)}
                hitSlop={4}
                onPressIn={() => Animated.spring(avatarScale, { toValue: 0.97, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(avatarScale, { toValue: 1,    speed: 40, bounciness: 5, useNativeDriver: true }).start()}
              >
                <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                  <CatAvatarCircle config={avatarConfig} size={AVATAR_SIZE} />
                  <View style={styles.editBadge}>
                    <AppText style={styles.editBadgeText}>✎</AppText>
                  </View>
                </Animated.View>
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
            <MCI name="cat" size={18} color={surface.textSecondary} style={styles.rowIcon} />
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
          earnedBadges={profile?.badges ? new Set(profile.badges as BadgeKey[]) : undefined}
        />

        {/* Achievements */}
        <Pressable
          style={[cardStyle, styles.achievementsRow]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <View style={styles.achievementsLeft}>
            <MCI name="trophy" size={18} color={surface.textSecondary} style={styles.rowIcon} />
            <View style={styles.rowLabelBlock}>
              <AppText variant="body">Achievements</AppText>
              {profile?.badges && profile.badges.length > 0 ? (
                <AppText variant="caption" colour="textSecondary">
                  {profile.badges.length} earned
                </AppText>
              ) : (
                <AppText variant="caption" colour="textSecondary">
                  Earn items by logging and making friends
                </AppText>
              )}
            </View>
          </View>
          <AppText variant="caption" colour="textSecondary">›</AppText>
        </Pressable>

        {/* Notifications section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          NOTIFICATIONS
        </AppText>
        <View style={cardStyle}>
          <View style={styles.row}>
            <MCI name="bell" size={18} color={surface.textSecondary} style={styles.rowIcon} />
            <AppText variant="body" style={styles.rowLabelBlock}>Daily reminder</AppText>
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
                          <RemoveSlotButton onPress={() => removeSlot(i)} />
                        )}
                      </View>
                    </View>
                  </Fragment>
                );
              })}

              {notifPrefs.slots.length < MAX_NOTIFICATION_SLOTS && (
                <>
                  <View style={dividerStyle} />
                  <Pressable
                    onPress={addSlot}
                    onPressIn={() => Animated.spring(addSlotScale, { toValue: 0.96, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
                    onPressOut={() => Animated.spring(addSlotScale, { toValue: 1, speed: 40, bounciness: 4, useNativeDriver: true }).start()}
                    style={[styles.row, styles.slotRow]}
                  >
                    <Animated.View style={{ transform: [{ scale: addSlotScale }] }}>
                      <AppText variant="body" style={styles.addLabel}>+ Add reminder</AppText>
                    </Animated.View>
                  </Pressable>
                </>
              )}

              <View style={[styles.dividerThick, { backgroundColor: surface.border }]} />
              <View style={styles.row}>
                <MCI name="bell-sleep" size={18} color={surface.textSecondary} style={styles.rowIcon} />
                <View style={styles.rowLabelBlock}>
                  <AppText variant="body">Smart suppress</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Skip on days you've already logged
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

        {showSaveBtn && (
          <Animated.View style={{ opacity: saveBtnOp, transform: [{ scale: saveBtnScale }] }}>
            <Button
              title="Save notification settings"
              onPress={handleSaveNotifs}
              loading={savingNotifs}
            />
          </Animated.View>
        )}

        {/* Friends section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          FRIENDS
        </AppText>
        <View style={cardStyle}>
          <View style={styles.row}>
            <MCI name="hand-wave" size={18} color={surface.textSecondary} style={styles.rowIcon} />
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
              <Pressable
                style={styles.row}
                onPress={() => setTrustModalVisible(true)}
                hitSlop={4}
                onPressIn={() => Animated.spring(trustedBtnScale, { toValue: 0.9, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(trustedBtnScale, { toValue: 1,    speed: 40, bounciness: 5, useNativeDriver: true }).start()}
              >
                <MCI name="shield-account" size={18} color={surface.textSecondary} style={styles.rowIcon} />
                <View style={styles.rowLabelBlock}>
                  <AppText variant="body">Trusted friends</AppText>
                  <AppText variant="caption" colour="textSecondary">
                    Pick who can see your detailed stats!
                  </AppText>
                </View>
                <Animated.View style={{ transform: [{ scale: trustedBtnScale }] }}>
                  <AppText variant="caption" colour="textSecondary">
                    {trustedFriendIds.length > 0 ? `${trustedFriendIds.length} trusted` : 'None'} ›
                  </AppText>
                </Animated.View>
              </Pressable>
            </>
          )}
        </View>

        {/* Account section */}
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          ACCOUNT
        </AppText>
        <View style={styles.accountButtons}>
          <Button title="Sign out" icon="logout" onPress={handleSignOut} loading={signingOut} />
          <Button
            title="Send feedback"
            icon="message-reply-text"
            onPress={() => setFeedbackModalVisible(true)}
          />
          <Button
            title="Delete account"
            variant="destructive"
            icon="account-remove"
            onPress={handleDeleteAccount}
            loading={deleting}
          />
        </View>
      </ScrollView>

      {/* Trusted friends modal */}
      <Modal visible={trustModalVisible} transparent animationType="fade" onRequestClose={() => setTrustModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTrustModalVisible(false)}>
          <View style={[styles.modalSheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
            <AppText variant="sectionHeading" style={styles.modalTitle}>Trusted friends</AppText>
            <AppText variant="caption" colour="textSecondary" style={styles.modalHint}>
              Trusted friends can see your detailed stats
            </AppText>
            <ScrollView scrollIndicatorInsets={{ right: 6 }} indicatorStyle="white">
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

      {/* Send feedback modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelFeedback}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleCancelFeedback}>
          <Pressable style={[styles.deleteModalSheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {feedbackSent ? (
                <View style={styles.feedbackSentBlock}>
                  <MCI name="check-circle" size={40} color={colours.primary400} />
                  <AppText variant="sectionHeading" style={styles.feedbackSentTitle}>Thanks!</AppText>
                  <AppText variant="body" colour="textSecondary" style={styles.feedbackSentBody}>
                    Your feedback has been received.
                  </AppText>
                  <Button title="Close" onPress={handleCancelFeedback} />
                </View>
              ) : (
                <>
                  <AppText variant="sectionHeading" style={styles.modalTitle}>Send feedback</AppText>
                  <AppText variant="caption" colour="textSecondary" style={styles.deleteWarning}>
                    Bug, idea, or anything on your mind!
                  </AppText>

                  <AppText variant="caption" colour="textSecondary" style={styles.deleteFieldLabel}>
                    Topic (optional)
                  </AppText>
                  {FEEDBACK_TOPICS.map(topic => (
                    <Pressable
                      key={topic}
                      onPress={() => setFeedbackTopic(t => t === topic ? undefined : topic)}
                      style={[
                        styles.reasonRow,
                        { borderColor: surface.border },
                        feedbackTopic === topic && { borderColor: colours.primary400 },
                      ]}
                    >
                      <View style={styles.reasonRowLeft}>
                        <MCI
                          name={FEEDBACK_TOPIC_ICONS[topic]}
                          size={16}
                          color={feedbackTopic === topic ? colours.primary400 : surface.textSecondary}
                        />
                        <AppText variant="body">{topic}</AppText>
                      </View>
                      {feedbackTopic === topic && (
                        <MCI name="check" size={16} color={colours.primary400} />
                      )}
                    </Pressable>
                  ))}

                  <AppText variant="caption" colour="textSecondary" style={styles.deleteFieldLabel}>
                    Message
                  </AppText>
                  <TextInput
                    style={[
                      styles.freeTextInput,
                      { color: surface.textPrimary, borderColor: surface.border, backgroundColor: surface.background },
                    ]}
                    placeholder="What's on your mind?"
                    placeholderTextColor={surface.textPlaceholder}
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    multiline
                    numberOfLines={4}
                  />

                  <View style={styles.deleteActions}>
                    <Button
                      title="Send"
                      icon="send"
                      onPress={handleSubmitFeedback}
                      loading={submittingFeedback}
                      disabled={!feedbackText.trim() && !feedbackTopic}
                    />
                    <Button title="Cancel" icon="close" onPress={handleCancelFeedback} />
                  </View>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete account modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleCancelDelete}>
          <Pressable style={[styles.deleteModalSheet, { backgroundColor: surface.surface, borderColor: surface.border }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <AppText variant="sectionHeading" style={styles.modalTitle}>Delete your account</AppText>
              <AppText variant="caption" colour="textSecondary" style={styles.deleteWarning}>
                Permanently deletes all your data e.g. logs, stats etc.
              </AppText>

              <AppText variant="caption" colour="textSecondary" style={styles.deleteFieldLabel}>
                Why are you leaving? (optional)
              </AppText>
              {DELETE_REASONS.map(reason => (
                <Pressable
                  key={reason}
                  onPress={() => setDeleteReason(r => r === reason ? undefined : reason)}
                  style={[
                    styles.reasonRow,
                    { borderColor: surface.border },
                    deleteReason === reason && { borderColor: colours.destructive },
                  ]}
                >
                  <AppText variant="body">{reason}</AppText>
                  {deleteReason === reason && (
                    <MCI name="check" size={16} color={colours.destructive} />
                  )}
                </Pressable>
              ))}

              <AppText variant="caption" colour="textSecondary" style={styles.deleteFieldLabel}>
                Anything else? (optional)
              </AppText>
              <TextInput
                style={[
                  styles.freeTextInput,
                  { color: surface.textPrimary, borderColor: surface.border, backgroundColor: surface.background },
                ]}
                placeholder="Tell us more..."
                placeholderTextColor={surface.textPlaceholder}
                value={deleteFreeText}
                onChangeText={setDeleteFreeText}
                multiline
                numberOfLines={3}
              />

              <AppText variant="caption" colour="textSecondary" style={styles.deleteFieldLabel}>
                Type{' '}
                <AppText variant="caption" style={{ color: colours.destructive }}>DELETE</AppText>
                {' '}to confirm
              </AppText>
              <TextInput
                style={[
                  styles.confirmInput,
                  {
                    color: surface.textPrimary,
                    borderColor: deleteConfirmText === 'DELETE' ? colours.destructive : surface.border,
                    backgroundColor: surface.background,
                  },
                ]}
                placeholder="DELETE"
                placeholderTextColor={surface.textPlaceholder}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <View style={styles.deleteActions}>
                <Button
                  title="Delete account"
                  variant="destructive"
                  icon="trash-can"
                  onPress={handleConfirmDelete}
                  loading={deleting}
                  disabled={deleteConfirmText !== 'DELETE'}
                />
                <Button title="Cancel" icon="close" onPress={handleCancelDelete} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 8, paddingBottom: 24 },
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
  rowIcon: { marginRight: 10 },
  rowLabelBlock: { flex: 1, gap: 3, marginRight: 12 },
  divider: { height: StyleSheet.hairlineWidth },
  dividerThick: { height: 1 },
  addLabel: { color: '#7F77DD' },
  accountButtons: { gap: 8 },
  achievementsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  achievementsLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
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
  deleteModalSheet: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: '85%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  deleteWarning: {
    marginBottom: 16,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  deleteFieldLabel: {
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  reasonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 4,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  confirmInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    letterSpacing: 2,
    marginBottom: 4,
  },
  deleteActions: {
    gap: 8,
    marginTop: 12,
  },
  feedbackSentBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  feedbackSentTitle: {
    marginTop: 4,
  },
  feedbackSentBody: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
