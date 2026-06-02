import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const loadAcknowledged = useSignalsStore(s => s.loadAcknowledged);
  const onLogSaved = useSignalsStore(s => s.onLogSaved);
  const clearSignals = useSignalsStore(s => s.clear);
  const acknowledge = useSignalsStore(s => s.acknowledge);
  const { latest, past, status } = useHealthFindings();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logTrigger, setLogTrigger] = useState(0);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dayCardScale = useRef(new Animated.Value(0)).current;
  const [dayCardVisible, setDayCardVisible] = useState(false);
  const dayCardShowingRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const insightsYRef = useRef(0);
  const preExpandY = useRef(0);

  const handleInsightsToggle = (expanded: boolean) => {
    if (expanded) {
      preExpandY.current = scrollYRef.current;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, insightsYRef.current - 8), animated: true });
      }, 30);
    } else {
      scrollRef.current?.scrollTo({ y: preExpandY.current, animated: true });
    }
  };

  useEffect(() => {
    if (selectedDate !== null) {
      if (!dayCardShowingRef.current) {
        dayCardShowingRef.current = true;
        dayCardScale.setValue(0);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setDayCardVisible(true);
      }
      Animated.spring(dayCardScale, { toValue: 1, useNativeDriver: true, friction: 10, tension: 70 }).start();
    } else {
      dayCardShowingRef.current = false;
      Animated.spring(dayCardScale, { toValue: 0, useNativeDriver: true, friction: 20, tension: 200 }).start(({ finished }) => {
        if (finished) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setDayCardVisible(false);
        }
      });
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!userId) {
      clearSignals();
      return;
    }
    refresh();
    loadAcknowledged(userId);
  }, [userId, refresh, loadAcknowledged, clearSignals]);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), TOAST_DURATION);
  };

  const todayString = formatDate(new Date());

  const triggerLogAnimations = (date: string) => {
    setLogTrigger(t => t + 1);
    setLastLoggedDate(date);
  };

  const handleQuickLog = () => {
    const ts = selectedDate && selectedDate !== todayString
      ? new Date(selectedDate + 'T12:00:00').getTime()
      : undefined;
    quickLog(ts);
    showToast('Logged!');
    if (userId) onLogSaved(userId, false);
    triggerLogAnimations(selectedDate ?? todayString);
  };

  const handleModalClose = (saved: boolean, wasEditing: boolean, hadBlood?: boolean) => {
    setIsModalOpen(false);
    setEditingLog(null);
    if (saved) {
      showToast(wasEditing ? 'Changes saved' : 'Logged!');
      if (userId) onLogSaved(userId, hadBlood ?? false);
      if (!wasEditing) triggerLogAnimations(selectedDate ?? todayString);
    }
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

      <SignalPopup
        latest={latest}
        recentlyResolved={past}
        onViewSignals={navigateToSignals}
        onAcknowledge={f => userId && acknowledge(userId, f, f.id)}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        onScroll={e => { scrollYRef.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={100}
      >
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
            iconColor="#E8734A"
            infoTitle="Day streak"
            infoIntro="Counts consecutive days you logged at least once."
            infoRows={[
              { label: 'How it counts', body: 'Based on when you created each log for that day instead of the date of the log itself.' },
              { label: 'Backdating', body: "Logging for a past date won't extend your streak." },
            ]}
          />
          <StatCard value={today} label="logs today" icon="toilet" iconColor="#7F77DD" />
          <StatCard value={monthly.toFixed(1)} label="monthly avg" icon="chart-bar" iconColor="#1D9E75" />
        </View>

        <CalendarHeatmap
          summaries={summaries}
          selectedDate={selectedDate}
          onDayPress={d => setSelectedDate(d === selectedDate ? null : d)}
          lastLoggedDate={lastLoggedDate}
        />

        {dayCardVisible && (
          <Animated.View style={{ transform: [{ scale: dayCardScale }] }}>
            <DayLogCard
              date={selectedDate ?? ''}
              logs={selectedDate ? logs.filter(l => l.date === selectedDate) : []}
              onEditLog={log => {
                setEditingLog(log);
                setIsModalOpen(true);
              }}
            />
          </Animated.View>
        )}

        <View onLayout={e => { insightsYRef.current = e.nativeEvent.layout.y; }}>
          <InsightsSection logs={logs} onToggle={handleInsightsToggle} />
        </View>
      </ScrollView>

      <View style={styles.fab}>
        <LogButton
          onQuickLog={handleQuickLog}
          onAddDetails={() => setIsModalOpen(true)}
          selectedDate={selectedDate}
          logTrigger={logTrigger}
        />
      </View>

      <LogEntryModal
        visible={isModalOpen}
        existingLog={editingLog}
        initialTimestamp={selectedDate && selectedDate !== todayString ? new Date(selectedDate + 'T12:00:00').getTime() : undefined}
        onClose={(saved, hadBlood) => handleModalClose(saved ?? false, editingLog !== null, hadBlood)}
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
