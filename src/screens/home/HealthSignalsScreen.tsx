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
import { AcknowledgedSignal } from '../../services/signals';
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
  { label: 'Info', body: 'No additional action needed.', colour: '#1D9E75' },
];

function relativeDate(ts: number): string {
  const days = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// Card for LATEST (unacknowledged) findings
function LatestCard({
  finding,
  onAcknowledge,
}: {
  finding: RomeFinding;
  onAcknowledge: () => void;
}) {
  const { surface } = useTheme();
  const copy = getSignalCopy(finding.id);
  const borderColour = BORDER_COLOUR[finding.severity];
  const isBlood = finding.id === 'blood';

  return (
    <View style={[styles.findingCard, { backgroundColor: surface.surface, borderColor: surface.border, borderLeftColor: borderColour }]}>
      <View style={styles.findingMain}>
        <View style={styles.findingTitleRow}>
          <AppText variant="bodyEmphasis">{copy.title}</AppText>
          <View style={[styles.severityPill, { backgroundColor: borderColour + '22', borderColor: borderColour + '55' }]}>
            <AppText variant="caption" style={{ color: borderColour, fontSize: 11 }}>
              {SEVERITY_LABEL[finding.severity]}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" colour="textSecondary" style={styles.findingBody}>
          {copy.body}
        </AppText>
        {isBlood && (
          <AppText variant="caption" style={[styles.gpNote, { color: borderColour }]}>
            We recommend speaking to a GP about this.
          </AppText>
        )}
        <TouchableOpacity
          onPress={onAcknowledge}
          style={[styles.acknowledgeBtn, { borderColor: surface.border }]}
          hitSlop={8}
          activeOpacity={0.6}
        >
          <AppText variant="caption" style={{ color: surface.textSecondary }}>Acknowledge</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Card for CURRENT (acknowledged, still active) findings
function CurrentCard({ finding, record }: { finding: RomeFinding; record: AcknowledgedSignal }) {
  const { surface } = useTheme();
  const copy = getSignalCopy(finding.id === 'blood' ? 'blood_acknowledged' : finding.id);
  const borderColour = BORDER_COLOUR[finding.severity];
  const isBlood = finding.id === 'blood';

  return (
    <View style={[styles.findingCard, { backgroundColor: surface.surface, borderColor: surface.border, borderLeftColor: borderColour, opacity: 0.85 }]}>
      <View style={styles.findingMain}>
        <View style={styles.findingTitleRow}>
          <AppText variant="bodyEmphasis">{copy.title}</AppText>
          <AppText variant="caption" colour="textSecondary" style={{ fontSize: 11 }}>
            acknowledged {relativeDate(record.acknowledgedAt)}
          </AppText>
        </View>
        <AppText variant="caption" colour="textSecondary" style={styles.findingBody}>
          {copy.body}
        </AppText>
        {isBlood && record.cleanLogCount !== undefined && (
          <AppText variant="caption" style={[styles.cleanCount, { color: '#1D9E75' }]}>
            {record.cleanLogCount}/3 clean logs recorded
          </AppText>
        )}
      </View>
    </View>
  );
}

// Card for PAST (resolved) findings
function PastCard({ record }: { record: AcknowledgedSignal }) {
  const { surface } = useTheme();
  const dotColour = BORDER_COLOUR[record.severity];
  const copy = getSignalCopy(record.findingId === 'blood' ? 'blood_resolved' : record.findingId);

  return (
    <View style={[styles.pastCard, { backgroundColor: surface.surface, borderColor: surface.border, borderLeftColor: dotColour }]}>
      <View style={styles.pastCardHeader}>
        <View style={[styles.severityPill, { backgroundColor: dotColour + '22', borderColor: dotColour + '55' }]}>
          <AppText variant="caption" style={{ color: dotColour, fontSize: 11 }}>
            {SEVERITY_LABEL[record.severity]}
          </AppText>
        </View>
        <View style={[styles.resolvedPill, { backgroundColor: '#1D9E7522', borderColor: '#1D9E7555' }]}>
          <AppText variant="caption" style={{ color: '#1D9E75', fontSize: 11 }}>Resolved</AppText>
        </View>
        <AppText variant="caption" colour="textSecondary" style={{ marginLeft: 'auto' }}>
          {relativeDate(record.acknowledgedAt)}
        </AppText>
      </View>
      <AppText variant="bodyEmphasis" style={styles.pastCardTitle}>{record.plainTitle}</AppText>
      <AppText variant="caption" colour="textSecondary" style={styles.pastCardBody}>
        {copy.body}
      </AppText>
    </View>
  );
}

export default function HealthSignalsScreen() {
  const { surface } = useTheme();
  const navigation = useNavigation();
  const userId = useAuthStore(s => s.user?.uid ?? null);
  const acknowledge = useSignalsStore(s => s.acknowledge);
  const { latest, current, past, all } = useHealthFindings();
  const [infoVisible, setInfoVisible] = useState(false);

  const acknowledged = useSignalsStore(s => s.acknowledged);

  const infoFindings = all.filter(f => f.id === 'all_clear' || f.id === 'insufficient_data');
  const showInfoStatus = latest.length === 0 && current.length === 0 && infoFindings.length > 0;

  const handleAcknowledge = (finding: RomeFinding) => {
    if (!userId) return;
    const copy = getSignalCopy(finding.id);
    acknowledge(userId, finding, copy.title);
  };

  // Get the acknowledgement record for a current finding
  const recordFor = (findingId: string) =>
    acknowledged.find(a => a.findingId === findingId);

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
              <AppText variant="caption" colour="textSecondary"> : {item.body}</AppText>
            </View>
          ))}
        </View>

        <InfoModal
          visible={infoVisible}
          onClose={() => setInfoVisible(false)}
          title="What we monitor"
          intro="Health Signals uses the Rome IV criteria, a clinically validated framework used by gastroenterologists worldwide to identify functional bowel disorders. Patterns are assessed over your last 90 days of logs."
          rows={INFO_ROWS}
          footerLabel="Rome IV criteria"
          footerUrl="https://theromefoundation.org/rome-iv/rome-iv-criteria/"
        />

        {/* LATEST — new, unacknowledged findings */}
        {latest.length > 0 && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              LATEST
            </AppText>
            <View style={styles.section}>
              {latest.map(f => (
                <LatestCard key={f.id} finding={f} onAcknowledge={() => handleAcknowledge(f)} />
              ))}
            </View>
          </>
        )}

        {/* CURRENT — acknowledged, still active */}
        {current.length > 0 && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              CURRENT
            </AppText>
            <View style={styles.section}>
              {current.map(f => {
                const record = recordFor(f.id);
                if (!record) return null;
                return <CurrentCard key={f.id} finding={f} record={record} />;
              })}
            </View>
          </>
        )}

        {/* Info status (all clear / insufficient data) */}
        {showInfoStatus && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              STATUS
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

        {/* PAST — resolved findings */}
        {past.length > 0 && (
          <>
            <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
              PAST
            </AppText>
            <View style={styles.section}>
              {[...past].sort((a, b) => b.acknowledgedAt - a.acknowledgedAt).map(record => (
                <PastCard key={record.findingId} record={record} />
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
  findingTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  findingMain: { gap: 6 },
  findingBody: { lineHeight: 18 },
  gpNote: { fontSize: 12, fontWeight: '500' },
  cleanCount: { fontSize: 12, fontWeight: '500' },
  acknowledgeBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  severityPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resolvedPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pastCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
    gap: 6,
  },
  pastCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pastCardTitle: { marginTop: 2 },
  pastCardBody: { lineHeight: 18 },
  disclaimer: {
    marginTop: 8,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
