import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import { RomeFinding } from '../../utils/romeIV';
import { AcknowledgedSignal } from '../../services/signals';
import { getSignalCopy } from '../../utils/signalCopy';

const SEEN_WARN_KEY = '@pooptracker/signals_popup_seen';
const SEEN_RESOLVED_KEY = '@pooptracker/signals_popup_resolved_seen';

const EXCLUDED_IDS = new Set(['all_clear', 'insufficient_data']);

function pickLatest(findings: RomeFinding[]): RomeFinding | null {
  return (
    findings.find(f => f.severity === 'urgent') ??
    findings.find(f => f.severity === 'gp') ??
    null
  );
}

async function getSeenIds(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

async function markSeen(key: string, ids: string[]): Promise<void> {
  try {
    const existing = await getSeenIds(key);
    ids.forEach(id => existing.add(id));
    await AsyncStorage.setItem(key, JSON.stringify([...existing]));
  } catch {}
}

type PopupMode = 'warning' | 'resolved';

interface PopupState {
  mode: PopupMode;
  finding: RomeFinding | null;
  resolved: AcknowledgedSignal | null;
}

interface Props {
  latest: RomeFinding[];
  recentlyResolved: AcknowledgedSignal[];
  onViewSignals: () => void;
  onAcknowledge: (finding: RomeFinding) => void;
}

export default function SignalPopup({ latest, recentlyResolved, onViewSignals, onAcknowledge }: Props) {
  const { surface } = useTheme();
  const [popup, setPopup] = useState<PopupState | null>(null);
  const shownThisSession = useRef(false);

  // Warning popup — fires for new unacknowledged findings
  useEffect(() => {
    if (shownThisSession.current) return;
    const eligible = latest.filter(f => !EXCLUDED_IDS.has(f.id));
    if (eligible.length === 0) return;

    getSeenIds(SEEN_WARN_KEY).then(seen => {
      const newFindings = eligible.filter(f => !seen.has(f.id));
      if (newFindings.length === 0) return;
      const toShow = pickLatest(newFindings);
      if (!toShow) return;
      shownThisSession.current = true;
      setPopup({ mode: 'warning', finding: toShow, resolved: null });
      markSeen(SEEN_WARN_KEY, newFindings.map(f => f.id));
    });
  }, [latest]);

  // Resolved popup — fires when a signal moves to resolved state
  useEffect(() => {
    if (shownThisSession.current) return;
    if (recentlyResolved.length === 0) return;

    getSeenIds(SEEN_RESOLVED_KEY).then(seen => {
      const newResolved = recentlyResolved.filter(r => !seen.has(r.findingId + '_resolved'));
      if (newResolved.length === 0) return;
      shownThisSession.current = true;
      setPopup({ mode: 'resolved', finding: null, resolved: newResolved[0] });
      markSeen(SEEN_RESOLVED_KEY, newResolved.map(r => r.findingId + '_resolved'));
    });
  }, [recentlyResolved]);

  const dismiss = () => setPopup(null);

  const handleView = () => {
    dismiss();
    onViewSignals();
  };

  const handleAcknowledge = () => {
    if (popup?.finding) onAcknowledge(popup.finding);
    dismiss();
  };

  if (!popup) return null;

  const isWarning = popup.mode === 'warning';
  const accentColour = isWarning
    ? (popup.finding?.severity === 'urgent' ? '#D85A30' : '#BA7517')
    : '#1D9E75';

  const copyId = isWarning
    ? (popup.finding?.id ?? '')
    : (popup.resolved?.findingId === 'blood' ? 'blood_resolved' : popup.resolved?.findingId ?? '');

  const copy = getSignalCopy(copyId);
  const icon = isWarning
    ? (popup.finding?.severity === 'urgent' ? 'alert-circle' : 'stethoscope')
    : 'check-circle';

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss}>
        <Pressable
          style={[styles.sheet, { backgroundColor: surface.surface, borderColor: surface.border }]}
        >
          <View style={[styles.accentBar, { backgroundColor: accentColour }]} />

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <MCI name={icon} size={20} color={accentColour} />
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

            {isWarning ? (
              <TouchableOpacity onPress={handleAcknowledge} style={styles.secondaryBtn} activeOpacity={0.6}>
                <AppText variant="caption" colour="textSecondary">Acknowledge</AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={dismiss} style={styles.secondaryBtn} activeOpacity={0.6}>
                <AppText variant="caption" colour="textSecondary">Got it</AppText>
              </TouchableOpacity>
            )}
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
  secondaryBtn: { alignItems: 'center', paddingVertical: 4 },
});
