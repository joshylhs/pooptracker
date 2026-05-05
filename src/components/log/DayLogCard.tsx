import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { LogEntry } from '../../services/logs';
import { getBristolType } from '../../utils/bristolData';
import { todayString } from '../../utils/dateUtils';
import AppText from '../shared/Text';

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
          No logs — tap Quick log to add one
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
                <AppText variant="bodyEmphasis">
                  {formatTime(log.timestamp)}
                </AppText>
                {bristol && (
                  <AppText variant="caption" colour="textSecondary">
                    {bristol.label}
                  </AppText>
                )}
                {log.notes && (
                  <AppText variant="caption" colour="textPlaceholder">
                    {log.notes}
                  </AppText>
                )}
              </View>

              {log.duration != null && (
                <AppText variant="caption" colour="textSecondary">
                  {log.duration} min
                </AppText>
              )}

              <Pressable onPress={() => onEditLog(log)} hitSlop={8}>
                <AppText style={[styles.editBtn, { color: colours.primary400 }]}>
                  edit
                </AppText>
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
    padding: 14,
  },
  heading: { marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 8,
    marginBottom: 8,
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
  info: { flex: 1 },
  editBtn: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
