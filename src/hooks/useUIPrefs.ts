import { useCallback, useEffect, useState } from 'react';
import { UIPrefs, loadUIPrefs, saveUIPrefs } from '../services/uiPrefs';

// Module-level singleton so all hook instances share state without a Provider.
let cache: UIPrefs | null = null;
const listeners = new Set<(p: UIPrefs) => void>();

function notify(prefs: UIPrefs) {
  cache = prefs;
  listeners.forEach(l => l(prefs));
}

let loadPromise: Promise<void> | null = null;
function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = loadUIPrefs().then(notify);
  }
  return loadPromise;
}

const DEFAULT: UIPrefs = { showIllustrations: true };

export function useUIPrefs() {
  const [prefs, setPrefs] = useState<UIPrefs>(cache ?? DEFAULT);

  useEffect(() => {
    listeners.add(setPrefs);
    ensureLoaded();
    return () => { listeners.delete(setPrefs); };
  }, []);

  const update = useCallback(async (patch: Partial<UIPrefs>) => {
    const next = { ...(cache ?? DEFAULT), ...patch };
    notify(next);
    await saveUIPrefs(next);
  }, []);

  return { prefs, update };
}
