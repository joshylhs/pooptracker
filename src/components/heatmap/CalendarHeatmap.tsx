import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { DailySummary } from '../../utils/streakUtils';
import { todayString } from '../../utils/dateUtils';
import {
  getIntensityLevel,
  INTENSITY_COLOURS,
  IntensityLevel,
} from '../../utils/heatmapUtils';
import AppText from '../shared/Text';

// Custom flex-grid heatmap — bypasses react-native-calendars to get exact
// control over uniform spacing. Each cell uses flex: 1 + aspectRatio: 1 so it
// is always square and exactly 1/7 of the row width. Combined with `gap`, this
// guarantees the same horizontal and vertical spacing between cells, no matter
// the screen size.
const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const GAP = 4;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarHeatmapProps {
  summaries: readonly DailySummary[];
  selectedDate: string | null;
  onDayPress: (date: string) => void;
  lastLoggedDate?: string | null;
  logTrigger?: number;
}

interface CellData {
  day: number;
  dateStr: string;
  isOverflow: boolean;
}

interface HeatmapCellProps {
  cell: CellData;
  today: string;
  selectedDate: string | null;
  countMap: Record<string, number>;
  lastLoggedDate?: string | null;
  logTrigger?: number;
  onPress: (date: string) => void;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function monthRowCount(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  return Math.ceil((startOffset + daysInMonth) / 7);
}

function HeatmapCell({ cell, today, selectedDate, countMap, lastLoggedDate, logTrigger, onPress }: HeatmapCellProps) {
  const { surface, colours } = useTheme();
  const isFuture = cell.dateStr > today;
  const count = countMap[cell.dateStr] ?? 0;
  const level = getIntensityLevel(count);
  const isToday = cell.dateStr === today;
  const isSelected = cell.dateStr === selectedDate;
  const fill = !isFuture && level > 0 ? INTENSITY_COLOURS[level] : 'transparent';
  const borderColour = isSelected
    ? colours.destructive
    : isToday
      ? colours.primary400
      : 'transparent';
  const textColour = !isFuture && level > 0 ? '#FFFFFF' : surface.textPrimary;
  const opacity = isFuture ? 0.2 : cell.isOverflow ? 0.4 : 1;

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!logTrigger || cell.dateStr !== lastLoggedDate) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.18, damping: 14, stiffness: 350, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.0,  damping: 16, stiffness: 350, useNativeDriver: true }),
    ]).start();
  }, [logTrigger]);

  return (
    <Animated.View style={[styles.cellWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => onPress(cell.dateStr)}
        disabled={isFuture}
        style={[
          styles.cell,
          {
            backgroundColor: fill,
            borderColor: isFuture ? 'transparent' : borderColour,
            borderWidth: 2,
            opacity,
          },
        ]}
      >
        {isSelected && !isToday && (
          <View style={[StyleSheet.absoluteFill, styles.selectedOverlay]} />
        )}
        <AppText
          style={[
            styles.dayText,
            {
              color: textColour,
              fontWeight: !isFuture && level > 0 ? '500' : '400',
            },
          ]}
        >
          {cell.day}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

export default function CalendarHeatmap({
  summaries,
  selectedDate,
  onDayPress,
  lastLoggedDate,
  logTrigger,
}: CalendarHeatmapProps) {
  const { surface } = useTheme();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const today = todayString(now);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const slideX        = useRef(new Animated.Value(0)).current;
  const gridOpacity   = useRef(new Animated.Value(1)).current;
  const rowAnims      = useRef(Array.from({ length: 6 }, () => new Animated.Value(1))).current;
  const leftChevScale  = useRef(new Animated.Value(1)).current;
  const rightChevScale = useRef(new Animated.Value(1)).current;

  const countMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of summaries) m[s.date] = s.count;
    return m;
  }, [summaries]);

  const monthName = MONTH_NAMES[viewMonth];

  // Build the rows: each row holds 7 cells (or null for padding before the
  // first day or after the last day of the month).
  const rows = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // JS getDay: 0=Sun, 1=Mon, ..., 6=Sat. We want Monday-first.
    const startOffset = (firstDay.getDay() + 6) % 7;

    // Previous month overflow
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;

    // Next month overflow
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextMonth_ = viewMonth === 11 ? 0 : viewMonth + 1;

    const cells: Array<CellData> = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push({
        day: d,
        dateStr: `${prevYear}-${pad(prevMonth + 1)}-${pad(d)}`,
        isOverflow: true,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        dateStr: `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`,
        isOverflow: false,
      });
    }
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({
        day: nextDay,
        dateStr: `${nextYear}-${pad(nextMonth_ + 1)}-${pad(nextDay)}`,
        isOverflow: true,
      });
      nextDay++;
    }

    const chunks: Array<Array<CellData>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      chunks.push(cells.slice(i, i + 7));
    }
    return chunks;
  }, [viewYear, viewMonth]);

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // direction: -1 = going back (slide right), +1 = going forward (slide left)
  const navigateMonth = (direction: -1 | 1) => {
    const exitX  = -direction * 40;
    const enterX =  direction * 40;

    // Pre-compute incoming month so we know how many rows to stagger
    const newMonth = direction === -1 ? (viewMonth === 0 ? 11 : viewMonth - 1) : (viewMonth === 11 ? 0 : viewMonth + 1);
    const newYear  = direction === -1 ? (viewMonth === 0 ? viewYear - 1 : viewYear) : (viewMonth === 11 ? viewYear + 1 : viewYear);
    const newRows  = monthRowCount(newYear, newMonth);

    Animated.parallel([
      Animated.timing(slideX,      { toValue: exitX, duration: 160, useNativeDriver: true }),
      Animated.timing(gridOpacity, { toValue: 0,     duration: 160, useNativeDriver: true }),
    ]).start(() => {
      if (direction === -1) {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
      } else {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
      }
      slideX.setValue(enterX);
      rowAnims.forEach(a => a.setValue(0));
      Animated.parallel([
        Animated.timing(slideX,      { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(gridOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.stagger(
          45,
          rowAnims.slice(0, newRows).map(a =>
            Animated.spring(a, { toValue: 1, tension: 150, friction: 7, useNativeDriver: true }),
          ),
        ),
      ]).start();
    });
  };

  return (
    <View
      style={[
        styles.wrapper,
        { borderColor: surface.border, backgroundColor: surface.surface },
      ]}
    >
      {/* Header: ‹ Month YYYY › */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigateMonth(-1)}
          hitSlop={12}
          style={styles.arrowBtn}
          onPressIn={() => Animated.spring(leftChevScale,  { toValue: 0.88, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(leftChevScale,  { toValue: 1,    speed: 40, bounciness: 5, useNativeDriver: true }).start()}
        >
          <Animated.View style={[styles.chevronCircle, { transform: [{ scale: leftChevScale }] }]}>
            <MCI name="chevron-left" size={22} color={surface.textPrimary} />
          </Animated.View>
        </Pressable>
        <AppText variant="sectionHeading">
          {monthName} {viewYear}
        </AppText>
        <Pressable
          onPress={() => navigateMonth(1)}
          hitSlop={12}
          style={styles.arrowBtn}
          disabled={isCurrentMonth}
          onPressIn={() => { if (!isCurrentMonth) Animated.spring(rightChevScale, { toValue: 0.88, speed: 40, bounciness: 0, useNativeDriver: true }).start(); }}
          onPressOut={() => Animated.spring(rightChevScale, { toValue: 1, speed: 40, bounciness: 5, useNativeDriver: true }).start()}
        >
          <Animated.View style={[styles.chevronCircle, { transform: [{ scale: rightChevScale }] }]}>
            <MCI name="chevron-right" size={22} color={isCurrentMonth ? surface.textPlaceholder : surface.textPrimary} />
          </Animated.View>
        </Pressable>
      </View>

      <Animated.View style={{ opacity: gridOpacity, transform: [{ translateX: slideX }] }}>
        {/* Day-of-week labels */}
        <View style={[styles.weekRow, styles.dowRow]}>
          {DAYS_OF_WEEK.map((d, i) => (
            <View key={i} style={styles.headerCell}>
              <AppText variant="caption" colour="textSecondary">{d}</AppText>
            </View>
          ))}
        </View>

        {/* Day grid */}
        <View style={styles.grid}>
          {rows.map((row, rowIdx) => (
            <Animated.View
              key={rowIdx}
              style={[styles.weekRow, {
                transform: [{
                  scale: rowAnims[rowIdx].interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
                }],
              }]}
            >
              {row.map((cell, colIdx) => (
                <HeatmapCell
                  key={`${cell.dateStr}-${colIdx}`}
                  cell={cell}
                  today={today}
                  selectedDate={selectedDate}
                  countMap={countMap}
                  lastLoggedDate={lastLoggedDate}
                  logTrigger={logTrigger}
                  onPress={onDayPress}
                />
              ))}
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Legend />
    </View>
  );
}

function Legend() {
  const { surface } = useTheme();
  const levels: IntensityLevel[] = [0, 1, 2, 3, 4];

  return (
    <View style={[styles.legend, { borderTopColor: surface.border }]}>
      <AppText variant="caption" colour="textSecondary">less</AppText>
      <View style={styles.legendSwatches}>
        {levels.map(level => (
          <View
            key={level}
            style={[
              styles.swatch,
              {
                backgroundColor: level === 0 ? surface.background : INTENSITY_COLOURS[level],
                borderColor: surface.border,
              },
            ]}
          />
        ))}
      </View>
      <AppText variant="caption" colour="textSecondary">more</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  arrowBtn: { padding: 2 },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCirclePressed: { opacity: 0.4 },
  dowRow: {
    paddingHorizontal: GAP,
    paddingBottom: 4,
  },
  grid: {
    paddingHorizontal: GAP,
    paddingBottom: GAP,
    gap: GAP,
  },
  weekRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  cellWrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOverlay: {
    borderRadius: 8,
    backgroundColor: 'rgba(216, 90, 48, 0.3)',
  },
  headerCell: {
    flex: 1,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  legendSwatches: { flexDirection: 'row', gap: 4 },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
});
