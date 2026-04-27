import { calculateStreaks, DailySummary } from './streakUtils';

const today = new Date(2026, 3, 28); // 2026-04-28

describe('calculateStreaks', () => {
  it('returns zero for an empty list', () => {
    expect(calculateStreaks([], today)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it('returns 1/1 for a single log today', () => {
    const summaries: DailySummary[] = [{ date: '2026-04-28', count: 1 }];
    expect(calculateStreaks(summaries, today)).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it('counts yesterday-only as a current streak of 1', () => {
    const summaries: DailySummary[] = [{ date: '2026-04-27', count: 1 }];
    expect(calculateStreaks(summaries, today).currentStreak).toBe(1);
  });

  it('treats logs from 2+ days ago as a lapsed streak', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-25', count: 1 },
      { date: '2026-04-26', count: 1 },
    ];
    const result = calculateStreaks(summaries, today);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(2);
  });

  it('ignores days with zero logs', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-26', count: 1 },
      { date: '2026-04-27', count: 0 }, // zero — should reset streak
      { date: '2026-04-28', count: 1 },
    ];
    const result = calculateStreaks(summaries, today);
    expect(result.currentStreak).toBe(1); // only today
    expect(result.longestStreak).toBe(1);
  });

  it('counts a multi-day current streak ending today', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-26', count: 2 },
      { date: '2026-04-27', count: 1 },
      { date: '2026-04-28', count: 3 },
    ];
    expect(calculateStreaks(summaries, today)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });

  it('keeps a long historical streak as longestStreak even when current is short', () => {
    const summaries: DailySummary[] = [
      // 5-day streak in March that lapsed
      { date: '2026-03-01', count: 1 },
      { date: '2026-03-02', count: 1 },
      { date: '2026-03-03', count: 1 },
      { date: '2026-03-04', count: 1 },
      { date: '2026-03-05', count: 1 },
      // single log today
      { date: '2026-04-28', count: 1 },
    ];
    expect(calculateStreaks(summaries, today)).toEqual({
      currentStreak: 1,
      longestStreak: 5,
    });
  });

  it('handles unsorted input by sorting internally', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-28', count: 1 },
      { date: '2026-04-26', count: 1 },
      { date: '2026-04-27', count: 1 },
    ];
    expect(calculateStreaks(summaries, today)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });

  it('treats multiple logs in one day as one streak day, not many', () => {
    const summaries: DailySummary[] = [
      { date: '2026-04-27', count: 5 },
      { date: '2026-04-28', count: 4 },
    ];
    expect(calculateStreaks(summaries, today)).toEqual({
      currentStreak: 2,
      longestStreak: 2,
    });
  });
});
