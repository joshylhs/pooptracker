import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../../hooks/useTheme';
import { DailySummary } from '../../utils/streakUtils';
import { todayString } from '../../utils/dateUtils';
import { getIntensityLevel, INTENSITY_COLOURS } from '../../utils/heatmapUtils';

interface CalendarHeatmapProps {
  summaries: readonly DailySummary[];
  selectedDate: string | null;
  onDayPress: (date: string) => void;
}

interface CustomDayMark {
  customStyles?: {
    container?: object;
    text?: object;
  };
}

export default function CalendarHeatmap({
  summaries,
  selectedDate,
  onDayPress,
}: CalendarHeatmapProps) {
  const { surface, colours } = useTheme();
  const today = todayString();

  const markedDates = useMemo(() => {
    const marks: Record<string, CustomDayMark> = {};

    for (const { date, count } of summaries) {
      const level = getIntensityLevel(count);
      if (level === 0) continue;
      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: INTENSITY_COLOURS[level],
            borderRadius: 8,
          },
          text: { color: '#FFFFFF' },
        },
      };
    }

    // Today gets a purple outline (preserves any intensity fill underneath).
    marks[today] = {
      customStyles: {
        ...(marks[today]?.customStyles ?? {}),
        container: {
          ...(marks[today]?.customStyles?.container ?? {}),
          borderWidth: 2,
          borderColor: colours.primary400,
        },
      },
    };

    // Selected day gets a coral outline.
    if (selectedDate) {
      marks[selectedDate] = {
        customStyles: {
          ...(marks[selectedDate]?.customStyles ?? {}),
          container: {
            ...(marks[selectedDate]?.customStyles?.container ?? {}),
            borderWidth: 2,
            borderColor: colours.destructive,
          },
        },
      };
    }

    return marks;
  }, [summaries, today, selectedDate, colours.primary400, colours.destructive]);

  return (
    <View style={[styles.wrapper, { borderColor: surface.border }]}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(d: DateData) => onDayPress(d.dateString)}
        theme={{
          calendarBackground: surface.surface,
          dayTextColor: surface.textPrimary,
          monthTextColor: surface.textPrimary,
          textSectionTitleColor: surface.textSecondary,
          textDisabledColor: surface.textPlaceholder,
          arrowColor: colours.primary400,
          todayTextColor: surface.textPrimary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
