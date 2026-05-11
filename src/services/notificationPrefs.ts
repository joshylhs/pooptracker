import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSlot {
  hour: number;
  minute: number;
}

export interface NotificationPrefs {
  enabled: boolean;
  slots: NotificationSlot[];
  smartSuppress: boolean;
}

export const MAX_NOTIFICATION_SLOTS = 5;

// Legacy key (pre-multi-account) kept for one-time migration read
const LEGACY_KEY = '@pooptracker/notif_prefs';
const keyForUid = (uid: string) => `@pooptracker/notif_prefs/${uid}`;

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  slots: [{ hour: 9, minute: 0 }],
  smartSuppress: true,
};

export async function saveNotificationPrefs(prefs: NotificationPrefs, uid: string): Promise<void> {
  await AsyncStorage.setItem(keyForUid(uid), JSON.stringify(prefs));
}

export async function loadNotificationPrefs(uid: string): Promise<NotificationPrefs> {
  // Try UID-namespaced key first; fall back to legacy key for one-time migration
  let raw = await AsyncStorage.getItem(keyForUid(uid));
  if (!raw) raw = await AsyncStorage.getItem(LEGACY_KEY);
  if (!raw) return DEFAULT_PREFS;
  try {
    const parsed = JSON.parse(raw);
    // Migrate from old single-slot format ({ hour, minute } at top level)
    if (typeof parsed.hour === 'number' || typeof parsed.minute === 'number') {
      return {
        enabled: parsed.enabled ?? DEFAULT_PREFS.enabled,
        slots: [{ hour: parsed.hour ?? 9, minute: parsed.minute ?? 0 }],
        smartSuppress: parsed.smartSuppress ?? DEFAULT_PREFS.smartSuppress,
      };
    }
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}
