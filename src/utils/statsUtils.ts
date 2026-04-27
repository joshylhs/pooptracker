import { DailySummary } from './streakUtils';
import { daysAgoString, todayString } from './dateUtils';

function sumCountsInWindow(
  summaries: readonly DailySummary[],
  startDateInclusive: string,
  endDateInclusive: string,
): number {
  return summaries
    .filter(s => s.date >= startDateInclusive && s.date <= endDateInclusive)
    .reduce((acc, s) => acc + s.count, 0);
}

export function todayCount(
  summaries: readonly DailySummary[],
  now: Date = new Date(),
): number {
  const today = todayString(now);
  return summaries
    .filter(s => s.date === today)
    .reduce((acc, s) => acc + s.count, 0);
}

export function totalLogs(summaries: readonly DailySummary[]): number {
  return summaries.reduce((acc, s) => acc + s.count, 0);
}

export function averagePerDay(
  summaries: readonly DailySummary[],
  windowDays: number,
  now: Date = new Date(),
): number {
  if (windowDays <= 0) return 0;
  const start = daysAgoString(windowDays - 1, now);
  const end = todayString(now);
  return sumCountsInWindow(summaries, start, end) / windowDays;
}

export function weeklyAverage(
  summaries: readonly DailySummary[],
  now: Date = new Date(),
): number {
  return averagePerDay(summaries, 7, now);
}

export function monthlyAverage(
  summaries: readonly DailySummary[],
  now: Date = new Date(),
): number {
  return averagePerDay(summaries, 30, now);
}
