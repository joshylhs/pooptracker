import notifee, {
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { loadNotificationPrefs, NotificationPrefs, MAX_NOTIFICATION_SLOTS } from './notificationPrefs';
import { useAuthStore } from '../store/authStore';

const ANDROID_CHANNEL_ID = 'daily-reminder';

function slotId(i: number): string {
  return `daily-reminder-${i}`;
}

function nextOccurrence(hour: number, minute: number, fromTomorrow = false): number {
  const d = new Date();
  if (fromTomorrow) d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  if (!fromTomorrow && d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Daily Reminder',
  });
}

async function cancelAllSlots(): Promise<void> {
  await Promise.all(
    Array.from({ length: MAX_NOTIFICATION_SLOTS }, (_, i) =>
      notifee.cancelTriggerNotification(slotId(i)),
    ),
  );
}

export async function requestPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function scheduleDaily(prefs: NotificationPrefs): Promise<void> {
  await cancelAllSlots();
  if (!prefs.enabled || prefs.slots.length === 0) return;

  await ensureAndroidChannel();

  await Promise.all(
    prefs.slots.map((slot, i) =>
      notifee.createTriggerNotification(
        {
          id: slotId(i),
          title: 'Daily check-in',
          body: "Have you logged today?",
          android: { channelId: ANDROID_CHANNEL_ID },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: nextOccurrence(slot.hour, slot.minute),
          repeatFrequency: RepeatFrequency.DAILY,
        },
      ),
    ),
  );
}

export async function cancelDaily(): Promise<void> {
  await cancelAllSlots();
}

export async function suppressTodayIfNeeded(prefs: NotificationPrefs): Promise<void> {
  if (!prefs.enabled || !prefs.smartSuppress || prefs.slots.length === 0) return;
  await cancelAllSlots();
  await ensureAndroidChannel();
  await Promise.all(
    prefs.slots.map((slot, i) =>
      notifee.createTriggerNotification(
        {
          id: slotId(i),
          title: 'Daily check-in',
          body: "Have you logged today?",
          android: { channelId: ANDROID_CHANNEL_ID },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: nextOccurrence(slot.hour, slot.minute, true),
          repeatFrequency: RepeatFrequency.DAILY,
        },
      ),
    ),
  );
}

export async function rescheduleFromPrefs(): Promise<void> {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) return;
  const prefs = await loadNotificationPrefs(uid);
  await scheduleDaily(prefs);
}
