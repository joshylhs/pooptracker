import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { LogEntry } from '../../services/logs';
import { Symptoms } from '../../database/logRepository';
import { getBristolType } from '../../utils/bristolData';
import { todayString } from '../../utils/dateUtils';
import AppText from '../shared/Text';

const SYMPTOM_LABELS: { key: keyof Symptoms; label: string }[] = [
  { key: 'blood',      label: 'blood'      },
  { key: 'pain',       label: 'pain'       },
  { key: 'straining',  label: 'straining'  },
  { key: 'bloating',   label: 'bloating'   },
  { key: 'incomplete', label: 'incomplete' },
  { key: 'assisted',   label: 'assisted'   },
];

const MAX_CHIPS = 3;

interface DayLogCardProps {
  date: string;
  logs: LogEntry[];
  onEditLog: (log: LogEntry) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateLabel(date: string): string {
  if (date === todayString()) return 'Today';
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function DayLogCard({ date, logs, onEditLog }: DayLogCardProps) {
  const { surface, colours } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: surface.surface, borderColor: surface.border },
      ]}
    >
      <AppText variant="sectionHeading" style={styles.heading}>
        {dateLabel(date)}
      </AppText>

      {logs.length === 0 ? (
        <AppText variant="body" colour="textSecondary">
          No logs yet, log to add one!
        </AppText>
      ) : (
        logs.map((log, index) => {
          const bristol =
            log.bristolType != null ? getBristolType(log.bristolType) : null;
          const isLast = index === logs.length - 1;

          return (
            <View
              key={log.logId}
              style={[
                styles.row,
                !isLast && {
                  borderBottomWidth: 1,
                  borderBottomColor: surface.border,
                },
                isLast && { marginBottom: 0, paddingBottom: 0 },
              ]}
            >
              <View
                style={[
                  styles.bristolCircle,
                  {
                    backgroundColor: bristol
                      ? bristol.colour
                      : surface.border,
                  },
                ]}
              >
                {bristol && (
                  <AppText style={styles.bristolNum}>{bristol.type}</AppText>
                )}
              </View>

              <View style={styles.info}>
                <View style={styles.timeRow}>
                  <AppText variant="bodyEmphasis">
                    {formatTime(log.timestamp)}
                  </AppText>
                  {bristol && (
                    <AppText variant="caption" colour="textSecondary">
                      {bristol.label}
                    </AppText>
                  )}
                </View>
                {log.notes && (
                  <AppText variant="caption" colour="textPlaceholder">
                    {log.notes}
                  </AppText>
                )}
                {log.symptoms && Object.values(log.symptoms).some(Boolean) && (() => {
                  const active = SYMPTOM_LABELS.filter(s => !!log.symptoms[s.key]);
                  const visible = active.slice(0, MAX_CHIPS);
                  const overflow = active.length - visible.length;
                  return (
                    <View style={styles.chips}>
                      {visible.map(s => {
                        const val = log.symptoms[s.key];
                        const severe = val === 'severe';
                        const borderColor = severe ? colours.destructive200 : colours.primary200;
                        const textColor   = severe ? colours.destructive200 : colours.primary200;
                        const bgColor     = severe ? 'rgba(240, 152, 123, 0.24)' : 'rgba(173, 169, 236, 0.24)';
                        return (
                          <View key={s.key} style={[styles.chip, { borderColor, backgroundColor: bgColor }]}>
                            <AppText style={[styles.chipText, { color: textColor }]}>{s.label}</AppText>
                          </View>
                        );
                      })}
                      {overflow > 0 && (
                        <View style={[styles.chip, { borderColor: surface.border, backgroundColor: surface.surface }]}>
                          <AppText style={[styles.chipText, { color: surface.textSecondary }]}>+{overflow} more</AppText>
                        </View>
                      )}
                    </View>
                  );
                })()}
              </View>

<Pressable onPress={() => onEditLog(log)} hitSlop={8}>
                {({ pressed }) => (
                  <AppText style={[styles.editBtn, { color: colours.primary400 }, pressed && styles.editBtnPressed]}>
                    edit
                  </AppText>
                )}
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
  },
  heading: { marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 14,
    marginBottom: 14,
  },
  bristolCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bristolNum: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  info: { flex: 1, gap: 3 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 10 },
  editBtn: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  editBtnPressed: { opacity: 0.4 },
});
