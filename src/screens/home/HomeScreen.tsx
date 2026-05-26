import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import StatCard from '../../components/shared/StatCard';
import CalendarHeatmap from '../../components/heatmap/CalendarHeatmap';
import DayLogCard from '../../components/log/DayLogCard';
import LogButton from '../../components/log/LogButton';
import LogEntryModal from '../../components/log/LogEntryModal';
import Toast from '../../components/shared/Toast';
import InsightsSection from '../../components/home/InsightsSection';
import SignalPopup from '../../components/home/SignalPopup';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { useLogStore } from '../../store/logStore';
import { useAuthStore } from '../../store/authStore';
import { useSignalsStore } from '../../store/signalsStore';
import { useHealthFindings } from '../../hooks/useHealthFindings';
import { LogEntry } from '../../services/logs';
import { calculateStreaks, DailySummary } from '../../utils/streakUtils';
import { todayCount, monthlyAverage } from '../../utils/statsUtils';
import { formatDate } from '../../utils/dateUtils';

const TOAST_DURATION = 1800;

type HomeNav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const { surface } = useTheme();
  const navigation = useNavigation<HomeNav>();
  const userId = useAuthStore(s => s.user?.uid ?? null);
  const logs = useLogStore(s => s.logs);
  const refresh = useLogStore(s => s.refresh);
  const quickLog = useLogStore(s => s.quickLog);
  const loadDismissals = useSignalsStore(s => s.loadDismissals);
  const clearSignals = useSignalsStore(s => s.clear);
  const { active, status } = useHealthFindings();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) {
      clearSignals();
      return;
    }
    refresh();
    loadDismissals(userId);
  }, [userId, refresh, loadDismissals, clearSignals]);

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

  const navigateToSignals = () => navigation.navigate('HealthSignals');


  return (
    <ScreenContainer>
      <Toast visible={toastVisible} message={toastMessage} />

      <SignalPopup findings={active} onViewSignals={navigateToSignals} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="screenTitle">Homepage</AppText>

        {/* Health status bar tab */}
        <TouchableOpacity
          onPress={navigateToSignals}
          activeOpacity={0.7}
          style={[styles.barTab, { backgroundColor: surface.surface, borderColor: surface.border }]}
        >
          <View style={[styles.barTabStripe, { backgroundColor: status.colour }]} />
          <AppText
            style={[styles.barTabText, { color: status.colour }]}
            numberOfLines={1}
          >
            {status.text}
          </AppText>
          <MCI name="chevron-right" size={14} color={status.colour + '99'} style={{ paddingRight: 12 }} />
        </TouchableOpacity>

        <View style={styles.stats}>
          <StatCard
            value={currentStreak}
            label="day streak"
            icon="fire"
            infoTitle="Day streak"
            infoIntro="Counts consecutive days you logged at least once."
            infoRows={[
              { label: 'How it counts', body: 'Based on when you created each log for that day instead of the date of the log itself.' },
              { label: 'Backdating', body: "Logging for a past date won't extend your streak." },
            ]}
          />
          <StatCard value={today} label="today" icon="toilet" />
          <StatCard value={monthly.toFixed(1)} label="monthly avg" icon="chart-bar" />
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

        <InsightsSection logs={logs} />
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
  barTab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: -4,
  },
  barTabStripe: { width: 4, alignSelf: 'stretch' },
  barTabText: { flex: 1, fontSize: 13, fontWeight: '500', paddingHorizontal: 12, paddingVertical: 10 },
  stats: { flexDirection: 'row', gap: 8 },
  fab: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});
