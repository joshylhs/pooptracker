import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import InfoModal, { InfoButton } from '../../components/shared/InfoModal';
import { useAuthStore } from '../../store/authStore';
import { useSignalsStore } from '../../store/signalsStore';
import { useHealthFindings } from '../../hooks/useHealthFindings';
import { RomeFinding } from '../../utils/romeIV';
import { DismissedSignal } from '../../services/signals';
import { getSignalCopy } from '../../utils/signalCopy';

const BORDER_COLOUR: Record<RomeFinding['severity'], string> = {
  urgent: '#D85A30',
  gp: '#BA7517',
  info: '#1D9E75',
};

const SEVERITY_LABEL: Record<RomeFinding['severity'], string> = {
  urgent: 'Urgent',
  gp: 'GP flag',
  info: 'Info',
};

const INFO_ROWS = [
  { label: 'Rectal bleeding', body: 'Any logged blood in the last 90 days.' },
  { label: 'Stool frequency', body: 'Average bowel movements per week vs the normal range of 3–21.' },
  { label: 'Constipation patterns', body: 'Hard stools, straining, incomplete emptying, or low frequency.' },
  { label: 'Loose stool patterns', body: 'Frequent watery or mushy stools, with or without pain.' },
  { label: 'Frequent bloating', body: 'Bloating logged more than once per week on average.' },
  { label: 'Recurrent severe pain', body: 'Severe pain logged 4+ times in the last 90 days.' },
];

const LEGEND = [
  { label: 'Urgent', body: 'Consider seeing a GP soon.', colour: '#D85A30' },
  { label: 'GP flag', body: 'Worth discussing with a GP.', colour: '#BA7517' },
  { label: 'Info', body: 'No action needed — for awareness.', colour: '#1D9E75' },
];

function relativeDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function SnoozePicker({
  onSnooze1d,
  onDismiss,
}: {
  onSnooze1d: () => void;
  onDismiss: () => void;
}) {
  const { surface } = useTheme();
  return (
    <View style={styles.snoozeRow}>
      <TouchableOpacity
        onPress={onSnooze1d}
        style={[styles.snoozeBtn, { borderColor: surface.border }]}
        hitSlop={8}
        activeOpacity={0.6}
      >
        <AppText variant="caption" style={{ color: surface.textSecondary }}>Snooze 1d</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDismiss}
        style={[styles.snoozeBtn, { borderColor: surface.border }]}
        hitSlop={8}
        activeOpacity={0.6}
      >
        <AppText variant="caption" style={{ color: surface.textSecondary }}>Dismiss</AppText>
      </TouchableOpacity>
    </View>
  );
}

function FindingCard({
  finding,
  onSnooze1d,
  onDismiss,
}: {
  finding: RomeFinding;
  onSnooze1d: () => void;
  onDismiss: () => void;
}) {
  const { surface } = useTheme();
  const copy = getSignalCopy(finding.id);
  const borderColour = BORDER_COLOUR[finding.severity];

  return (
    <View style={[styles.findingCard, { backgroundColor: surface.surface, borderColor: surface.border, borderLeftColor: borderColour }]}>
      <View style={styles.findingMain}>
        <AppText variant="bodyEmphasis">{copy.title}</AppText>
        <AppText variant="caption" colour="textSecondary" style={styles.findingBody}>
          {copy.body}
        </AppText>
        <SnoozePicker onSnooze1d={onSnooze1d} onDismiss={onDismiss} />
      </View>
    </View>
  );
}

function PastSignalCard({ record }: { record: DismissedSignal }) {
  const { surface } = useTheme();
  const dotColour = BORDER_COLOUR[record.severity];
  const copy = getSignalCopy(record.findingId);
  const snoozeLabel = record.snoozeType === 'dismiss' ? 'Dismissed' : 'Snoozed 1d';

  return (
    <View style={[styles.pastCard, { backgroundColor: surface.surface, borderColor: surface.border, borderLeftColor: dotColour }]}>
      <View style={styles.pastCardHeader}>
        <View style={[styles.severityPill, { backgroundColor: dotColour + '22', borderColor: dotColour + '55' }]}>
          <AppText variant="caption" style={{ color: dotColour, fontSize: 11 }}>
            {SEVERITY_LABEL[record.severity]}
          </AppText>
        </View>
        <AppText variant="caption" colour="textSecondary">{relativeDate(record.dismissedAt)}</AppText>
      </View>
      <AppText variant="bodyEmphasis" style={styles.pastCardTitle}>{record.plainTitle}</AppText>
      <AppText variant="caption" colour="textSecondary" style={styles.pastCardBody}>
        {copy.body}
      </AppText>
      <AppText variant="caption" style={[styles.pastCardSnoozeLabel, { color: surface.textSecondary }]}>
        {snoozeLabel}
      </AppText>
    </View>
  );
}

export default function HealthSignalsScreen() {
  const { surface } = useTheme();
  const navigation = useNavigation();
  const userId = useAuthStore(s => s.user?.uid ?? null);
  const dismiss = useSignalsStore(s => s.dismiss);
  const { active, dismissals } = useHealthFindings();
  const [infoVisible, setInfoVisible] = useState(false);

  const actionableFindings = active.filter(f => f.severity === 'urgent' || f.severity === 'gp');
  const infoFindings = active.filter(f => f.id === 'all_clear' || f.id === 'insufficient_data');
  const pastSignals = [...dismissals].sort((a, b) => b.dismissedAt - a.dismissedAt);

  const handleSnooze = (finding: RomeFinding, type: 'snooze1d' | 'dismiss') => {
    if (!userId) return;
    const copy = getSignalCopy(finding.id);
    dismiss(userId, finding, copy.title, type);
  };

  return (
    <ScreenContainer>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={8}>
        <MCI name="arrow-left" size={20} color={surface.textSecondary} />
        <AppText variant="body" colour="textSecondary">Home</AppText>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <AppText variant="screenTitle">Health Signals</AppText>
          <InfoButton onPress={() => setInfoVisible(true)} />
        </View>

        {/* Inline legend */}
        <View style={styles.legend}>
          {LEGEND.map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.colour }]} />
              <AppText variant="caption" style={{ color: item.colour, fontWeight: '600' }}>{item.label}</AppText>
              <AppText variant="caption" colour="textSecondary"> — {item.body}</AppText>
            </View>
          ))}
        </View>

        <InfoModal
          visible={infoVisible}
          onClose={() => setInfoVisible(false)}
          title="What we monitor"
          intro="Monitors 6 aspects of your bowel health over the last 90 days and flags patterns that match clinical criteria."
          rows={INFO_ROWS}
        />

        {/* Current actionable findings */}
        {actionableFindings.length > 0 && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              CURRENT FINDINGS
            </AppText>
            <View style={styles.section}>
              {actionableFindings.map(f => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  onSnooze1d={() => handleSnooze(f, 'snooze1d')}
                  onDismiss={() => handleSnooze(f, 'dismiss')}
                />
              ))}
            </View>
          </>
        )}

        {/* All clear / insufficient data status */}
        {actionableFindings.length === 0 && infoFindings.length > 0 && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              CURRENT STATUS
            </AppText>
            <View style={styles.section}>
              {infoFindings.map(f => (
                <View
                  key={f.id}
                  style={[styles.findingCard, { backgroundColor: surface.surface, borderColor: surface.border, borderLeftColor: '#1D9E75' }]}
                >
                  <View style={styles.findingMain}>
                    <AppText variant="bodyEmphasis">{getSignalCopy(f.id).title}</AppText>
                    <AppText variant="caption" colour="textSecondary" style={styles.findingBody}>
                      {getSignalCopy(f.id).body}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Past signals history */}
        {pastSignals.length > 0 && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              PAST SIGNALS
            </AppText>
            <View style={styles.section}>
              {pastSignals.map(record => (
                <PastSignalCard key={record.findingId + record.dismissedAt} record={record} />
              ))}
            </View>
          </>
        )}

        <AppText variant="caption" colour="textSecondary" style={styles.disclaimer}>
          These patterns are informational only — not a medical diagnosis. Based on self-reported data from the last 90 days. Always speak to a healthcare professional if concerned.
        </AppText>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 12 },
  scroll: { gap: 8, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legend: { gap: 4, paddingVertical: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  sectionLabel: { marginTop: 8, marginLeft: 2, letterSpacing: 0.5 },
  section: { gap: 8 },
  findingCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
  },
  findingMain: { gap: 6 },
  findingBody: { lineHeight: 18 },
  snoozeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  snoozeBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pastCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
    gap: 6,
  },
  pastCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  severityPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pastCardTitle: { marginTop: 2 },
  pastCardBody: { lineHeight: 18 },
  pastCardSnoozeLabel: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  disclaimer: {
    marginTop: 8,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
