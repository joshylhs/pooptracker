import {
  todayCount,
  totalLogs,
  averagePerDay,
  weeklyAverage,
  monthlyAverage,
} from './statsUtils';
import { DailySummary } from './streakUtils';

const today = new Date(2026, 3, 28); // 2026-04-28

describe('todayCount', () => {
  it('returns 0 when there are no logs', () => {
    expect(todayCount([], today)).toBe(0);
  });

  it('returns 0 when there are no logs today', () => {
    const summaries: DailySummary[] = [{ date: '2026-04-27', count: 5 }];
    expect(todayCount(summaries, today)).toBe(0);
  });

  it('returns the count for today', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-27', count: 5 },
      { date: '2026-04-28', count: 3 },
    ];
    expect(todayCount(summaries, today)).toBe(3);
  });
});

describe('totalLogs', () => {
  it('sums counts across all summaries', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-26', count: 2 },
      { date: '2026-04-27', count: 1 },
      { date: '2026-04-28', count: 3 },
    ];
    expect(totalLogs(summaries)).toBe(6);
  });

  it('returns 0 for an empty list', () => {
    expect(totalLogs([])).toBe(0);
  });
});

describe('averagePerDay', () => {
  it('averages over the requested window, including days with zero logs', () => {
    // 7-day window: 2026-04-22 through 2026-04-28
    // 14 logs across the window → 14 / 7 = 2.0
    const summaries: DailySummary[] = [
      { date: '2026-04-22', count: 4 },
      { date: '2026-04-25', count: 7 },
      { date: '2026-04-28', count: 3 },
    ];
    expect(averagePerDay(summaries, 7, today)).toBe(2);
  });

  it('ignores logs outside the window', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-21', count: 100 }, // 8 days ago — outside 7-day window
      { date: '2026-04-28', count: 7 },
    ];
    expect(averagePerDay(summaries, 7, today)).toBe(1);
  });

  it('returns 0 for a non-positive window', () => {
    const summaries: DailySummary[] = [{ date: '2026-04-28', count: 5 }];
    expect(averagePerDay(summaries, 0, today)).toBe(0);
    expect(averagePerDay(summaries, -1, today)).toBe(0);
  });

  it('returns 0 when there are no logs in the window', () => {
    expect(averagePerDay([], 7, today)).toBe(0);
  });
});

describe('weeklyAverage and monthlyAverage', () => {
  const summaries: DailySummary[] = [
    { date: '2026-04-21', count: 14 }, // 7 days ago — outside weekly, inside monthly
    { date: '2026-04-28', count: 7 }, // today
  ];

  it('weeklyAverage uses a 7-day window', () => {
    expect(weeklyAverage(summaries, today)).toBe(1); // 7 / 7
  });

  it('monthlyAverage uses a 30-day window', () => {
    expect(monthlyAverage(summaries, today)).toBe(21 / 30);
  });
});
