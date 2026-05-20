import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import StatCard from '../../components/shared/StatCard';
import CalendarHeatmap from '../../components/heatmap/CalendarHeatmap';
import DayLogCard from '../../components/log/DayLogCard';
import LogButton from '../../components/log/LogButton';
import LogEntryModal from '../../components/log/LogEntryModal';
import Toast from '../../components/shared/Toast';
import { useLogStore } from '../../store/logStore';
import { useAuthStore } from '../../store/authStore';
import { LogEntry } from '../../services/logs';
import { calculateStreaks, DailySummary } from '../../utils/streakUtils';
import { todayCount, monthlyAverage } from '../../utils/statsUtils';
import { formatDate } from '../../utils/dateUtils';

const TOAST_DURATION = 1800;

export default function HomeScreen() {
  const userId = useAuthStore(s => s.user?.uid ?? null);
  const logs = useLogStore(s => s.logs);
  const refresh = useLogStore(s => s.refresh);
  const quickLog = useLogStore(s => s.quickLog);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    refresh();
  }, [userId, refresh]);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);
  };

  const handleQuickLog = () => {
    const ts = selectedDate ? new Date(selectedDate + 'T12:00:00').getTime() : undefined;
    quickLog(ts);
    showToast('Logged!');
  };

  const handleModalClose = (saved: boolean, wasEditing: boolean) => {
    setIsModalOpen(false);
    setEditingLog(null);
    if (saved) showToast(wasEditing ? 'Changes saved' : 'Logged!');
  };

  const summaries: DailySummary[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
    }
    return Array.from(counts, ([date, count]) => ({ date, count }));
  }, [logs]);

  // Streak uses createdAt (when the user actually logged) not date (reported poop date),
  // so backdated entries don't inflate the streak.
  const streakSummaries: DailySummary[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      const d = formatDate(new Date(log.createdAt));
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return Array.from(counts, ([date, count]) => ({ date, count }));
  }, [logs]);

  const { currentStreak } = calculateStreaks(streakSummaries);
  const today = todayCount(summaries);
  const monthly = monthlyAverage(summaries);

  return (
    <ScreenContainer>
      <Toast visible={toastVisible} message={toastMessage} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="screenTitle" style={styles.heading}>
          Today
        </AppText>

        <View style={styles.stats}>
          <StatCard
            value={currentStreak}
            label="day streak"
            onInfo={() => Alert.alert(
              'Day streak',
              'Counts consecutive days you logged based on when you created each log, not the date of the log itself.\n\n ∴ Backdating a log won\'t extend your streak.',
            )}
          />
          <StatCard value={today} label="today" />
          <StatCard value={monthly.toFixed(1)} label="monthly avg" />
        </View>

        <CalendarHeatmap
          summaries={summaries}
          selectedDate={selectedDate}
          onDayPress={d => setSelectedDate(d === selectedDate ? null : d)}
        />

        {selectedDate && (
          <DayLogCard
            date={selectedDate}
            logs={logs.filter(l => l.date === selectedDate)}
            onEditLog={log => {
              setEditingLog(log);
              setIsModalOpen(true);
            }}
          />
        )}
      </ScrollView>

      <View style={styles.fab}>
        <LogButton
          onQuickLog={handleQuickLog}
          onAddDetails={() => setIsModalOpen(true)}
          selectedDate={selectedDate}
        />
      </View>

      <LogEntryModal
        visible={isModalOpen}
        existingLog={editingLog}
        initialTimestamp={selectedDate ? new Date(selectedDate + 'T12:00:00').getTime() : undefined}
        onClose={(saved) => handleModalClose(saved ?? false, editingLog !== null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 140, gap: 16 },
  heading: { marginBottom: 4 },
  stats: { flexDirection: 'row', gap: 8 },
  fab: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});
