import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CalendarHeatmapProps {
  summaries: readonly DailySummary[];
  selectedDate: string | null;
  onDayPress: (date: string) => void;
}

interface CellData {
  day: number;
  dateStr: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function CalendarHeatmap({
  summaries,
  selectedDate,
  onDayPress,
}: CalendarHeatmapProps) {
  const { surface, colours } = useTheme();
  const today = todayString();
  const now = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

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

    const cells: Array<CellData | null> = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        dateStr: `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`,
      });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const chunks: Array<Array<CellData | null>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      chunks.push(cells.slice(i, i + 7));
    }
    return chunks;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
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
        <Pressable onPress={prevMonth} hitSlop={12} style={styles.arrowBtn}>
          <AppText style={[styles.arrow, { color: surface.textPrimary }]}>
            ‹
          </AppText>
        </Pressable>
        <AppText variant="sectionHeading">
          {monthName} {viewYear}
        </AppText>
        <Pressable onPress={nextMonth} hitSlop={12} style={styles.arrowBtn}>
          <AppText style={[styles.arrow, { color: surface.textPrimary }]}>
            ›
          </AppText>
        </Pressable>
      </View>

      {/* Day-of-week labels: M T W T F S S */}
      <View style={[styles.weekRow, styles.dowRow]}>
        {DAYS_OF_WEEK.map((d, i) => (
          <View key={i} style={styles.headerCell}>
            <AppText variant="caption" colour="textSecondary">
              {d}
            </AppText>
          </View>
        ))}
      </View>

      {/* Day grid: chunks of 7, each cell is flex:1 + aspectRatio:1 */}
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.weekRow}>
            {row.map((cell, colIdx) => {
              if (!cell) {
                return (
                  <View
                    key={`empty-${rowIdx}-${colIdx}`}
                    style={styles.cell}
                  />
                );
              }
              const count = countMap[cell.dateStr] ?? 0;
              const level = getIntensityLevel(count);
              const isToday = cell.dateStr === today;
              const isSelected = cell.dateStr === selectedDate;
              const fill = level > 0 ? INTENSITY_COLOURS[level] : 'transparent';
              const borderColour = isSelected
                ? colours.destructive
                : isToday
                  ? colours.primary400
                  : 'transparent';
              const textColour =
                level > 0 ? '#FFFFFF' : surface.textPrimary;
              return (
                <Pressable
                  key={cell.dateStr}
                  onPress={() => onDayPress(cell.dateStr)}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: fill,
                      borderColor: borderColour,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <AppText
                    style={[
                      styles.dayText,
                      {
                        color: textColour,
                        fontWeight: level > 0 ? '500' : '400',
                      },
                    ]}
                  >
                    {cell.day}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Legend />
    </View>
  );
}

function Legend() {
  const { surface } = useTheme();
  const levels: IntensityLevel[] = [0, 1, 2, 3, 4];

  return (
    <View style={[styles.legend, { borderTopColor: surface.border }]}>
      <AppText variant="caption" colour="textSecondary">
        less
      </AppText>
      <View style={styles.legendSwatches}>
        {levels.map(level => (
          <View
            key={level}
            style={[
              styles.swatch,
              {
                backgroundColor:
                  level === 0 ? surface.background : INTENSITY_COLOURS[level],
                borderColor: surface.border,
              },
            ]}
          />
        ))}
      </View>
      <AppText variant="caption" colour="textSecondary">
        more
      </AppText>
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
  arrowBtn: { paddingHorizontal: 4 },
  arrow: {
    fontSize: 26,
    lineHeight: 26,
  },
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
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
