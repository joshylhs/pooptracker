import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import StatCard from '../../components/shared/StatCard';
import CalendarHeatmap from '../../components/heatmap/CalendarHeatmap';
import DayLogCard from '../../components/log/DayLogCard';
import QuickLogButton from '../../components/log/QuickLogButton';
import LogEntryModal from '../../components/log/LogEntryModal';
import { useLogStore } from '../../store/logStore';
import { useAuthStore } from '../../store/authStore';
import { LogEntry } from '../../services/logs';
import { calculateStreaks, DailySummary } from '../../utils/streakUtils';
import { todayCount, monthlyAverage } from '../../utils/statsUtils';

export default function HomeScreen() {
  const userId = useAuthStore(s => s.user?.uid ?? null);
  const logs = useLogStore(s => s.logs);
  const refresh = useLogStore(s => s.refresh);
  const quickLog = useLogStore(s => s.quickLog);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    refresh();
  }, [userId, refresh]);

  const summaries: DailySummary[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
    }
    return Array.from(counts, ([date, count]) => ({ date, count }));
  }, [logs]);

  const { currentStreak } = calculateStreaks(summaries);
  const today = todayCount(summaries);
  const monthly = monthlyAverage(summaries);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="screenTitle" style={styles.heading}>
          Today
        </AppText>

        <View style={styles.stats}>
          <StatCard value={currentStreak} label="day streak" />
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
        <QuickLogButton
          onPress={quickLog}
          onAddDetails={() => setIsModalOpen(true)}
        />
      </View>

      <LogEntryModal
        visible={isModalOpen}
        existingLog={editingLog}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
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
