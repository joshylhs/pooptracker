import { DateString, daysBetween, todayString } from './dateUtils';

export interface DailySummary {
  date: DateString;
  count: number;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export function calculateStreaks(
  summaries: readonly DailySummary[],
  now: Date = new Date(),
): StreakResult {
  const loggedDays = summaries
    .filter(s => s.count > 0)
    .map(s => s.date)
    .sort(); // ascending — earliest first

  if (loggedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < loggedDays.length; i++) {
    if (daysBetween(loggedDays[i - 1], loggedDays[i]) === 1) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 1;
    }
  }

  const today = todayString(now);
  const lastLogged = loggedDays[loggedDays.length - 1];
  const gapFromToday = daysBetween(lastLogged, today);

  // Current streak only counts if the most recent log is today or yesterday.
  // Anything older means the streak has lapsed.
  const currentStreak = gapFromToday <= 1 ? runningStreak : 0;

  return { currentStreak, longestStreak };
}
