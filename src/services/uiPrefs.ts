import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pooptracker/ui_prefs';

export interface UIPrefs {
  showIllustrations: boolean;
}

const DEFAULTS: UIPrefs = {
  showIllustrations: true,
};

export async function loadUIPrefs(): Promise<UIPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export async function saveUIPrefs(prefs: UIPrefs): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}
