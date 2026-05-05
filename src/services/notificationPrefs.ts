import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
  smartSuppress: boolean;
}

const KEY = '@pooptracker/notif_prefs';

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  hour: 9,
  minute: 0,
  smartSuppress: true,
};

export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}
