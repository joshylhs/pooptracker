import notifee, {
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { loadNotificationPrefs, NotificationPrefs } from './notificationPrefs';

const NOTIFICATION_ID = 'daily-reminder';
const ANDROID_CHANNEL_ID = 'daily-reminder';

function nextOccurrence(hour: number, minute: number, fromTomorrow = false): number {
  const d = new Date();
  if (fromTomorrow) d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  // If the time has already passed today (and we're not forcing tomorrow), roll to tomorrow
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

export async function requestPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function scheduleDaily(prefs: NotificationPrefs): Promise<void> {
  await notifee.cancelTriggerNotification(NOTIFICATION_ID);
  if (!prefs.enabled) return;

  await ensureAndroidChannel();

  await notifee.createTriggerNotification(
    {
      id: NOTIFICATION_ID,
      title: 'Daily check-in',
      body: "Have you logged today?",
      android: { channelId: ANDROID_CHANNEL_ID },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: nextOccurrence(prefs.hour, prefs.minute),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );
}

export async function cancelDaily(): Promise<void> {
  await notifee.cancelTriggerNotification(NOTIFICATION_ID);
}

// Called after a log is saved. If smartSuppress is on, pushes today's reminder
// to tomorrow so the user isn't notified on days they've already logged.
export async function suppressTodayIfNeeded(prefs: NotificationPrefs): Promise<void> {
  if (!prefs.enabled || !prefs.smartSuppress) return;
  await notifee.cancelTriggerNotification(NOTIFICATION_ID);
  await ensureAndroidChannel();
  await notifee.createTriggerNotification(
    {
      id: NOTIFICATION_ID,
      title: 'Daily check-in',
      body: "Have you logged today?",
      android: { channelId: ANDROID_CHANNEL_ID },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: nextOccurrence(prefs.hour, prefs.minute, true),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );
}

// Loads prefs from AsyncStorage and applies them — call this when prefs change
// (e.g. from ProfileScreen settings) or on new-device login after syncing from Firestore.
export async function rescheduleFromPrefs(): Promise<void> {
  const prefs = await loadNotificationPrefs();
  await scheduleDaily(prefs);
}
