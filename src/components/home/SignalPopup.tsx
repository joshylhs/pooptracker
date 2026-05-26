import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { RomeFinding } from '../../utils/romeIV';
import { getSignalCopy } from '../../utils/signalCopy';

const SEEN_KEY = '@pooptracker/signals_popup_seen';

// IDs that should never trigger a popup
const EXCLUDED_IDS = new Set(['all_clear', 'insufficient_data']);

// Priority: urgent first, then gp. Info findings never trigger a popup.
function pickFinding(findings: RomeFinding[]): RomeFinding | null {
  return (
    findings.find(f => f.severity === 'urgent') ??
    findings.find(f => f.severity === 'gp') ??
    null
  );
}

async function getSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

async function markSeen(ids: string[]): Promise<void> {
  try {
    const existing = await getSeenIds();
    ids.forEach(id => existing.add(id));
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...existing]));
  } catch {
    // non-critical
  }
}

const SEVERITY_COLOUR: Record<RomeFinding['severity'], string> = {
  urgent: '#D85A30',
  gp: '#BA7517',
  info: '#1D9E75',
};

interface Props {
  findings: RomeFinding[];
  onViewSignals: () => void;
}

export default function SignalPopup({ findings, onViewSignals }: Props) {
  const { surface, colours } = useTheme();
  const [popupFinding, setPopupFinding] = useState<RomeFinding | null>(null);
  // Guard so one session only ever shows one popup, even if findings change mid-session
  const shownThisSession = useRef(false);

  useEffect(() => {
    if (shownThisSession.current) return;

    const eligible = findings.filter(f => !EXCLUDED_IDS.has(f.id));
    if (eligible.length === 0) return;

    getSeenIds().then(seen => {
      const newFindings = eligible.filter(f => !seen.has(f.id));
      if (newFindings.length === 0) return;

      const toShow = pickFinding(newFindings);
      if (!toShow) return;

      shownThisSession.current = true;
      setPopupFinding(toShow);
      // Mark all new finding IDs as seen so they don't re-trigger on next open
      markSeen(newFindings.map(f => f.id));
    });
  }, [findings]);

  const dismiss = () => setPopupFinding(null);

  const handleView = () => {
    dismiss();
    onViewSignals();
  };

  if (!popupFinding) return null;

  const copy = getSignalCopy(popupFinding.id);
  const accentColour = SEVERITY_COLOUR[popupFinding.severity];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss}>
        <Pressable
          style={[styles.sheet, { backgroundColor: surface.surface, borderColor: surface.border }]}
        >
          {/* Coloured accent bar at top */}
          <View style={[styles.accentBar, { backgroundColor: accentColour }]} />

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <MCI
                name={popupFinding.severity === 'urgent' ? 'alert-circle' : 'stethoscope'}
                size={20}
                color={accentColour}
              />
              <AppText variant="bodyEmphasis" style={{ color: accentColour }}>
                {copy.title}
              </AppText>
            </View>

            <AppText variant="body" colour="textSecondary" style={styles.bodyText}>
              {copy.body}
            </AppText>

            <TouchableOpacity
              onPress={handleView}
              style={[styles.primaryBtn, { backgroundColor: accentColour }]}
              activeOpacity={0.8}
            >
              <AppText style={styles.primaryBtnText}>View Health Signals</AppText>
              <MCI name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={dismiss} style={styles.dismissBtn} activeOpacity={0.6}>
              <AppText variant="caption" colour="textSecondary">Got it, dismiss</AppText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  accentBar: { height: 4, width: '100%' },
  body: { padding: 24, gap: 14, paddingBottom: 36 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bodyText: { lineHeight: 20 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  dismissBtn: { alignItems: 'center', paddingVertical: 4 },
});
