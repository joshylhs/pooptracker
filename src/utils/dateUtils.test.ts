import {
  formatDate,
  parseDate,
  todayString,
  addDays,
  daysAgoString,
  daysBetween,
  isConsecutive,
} from './dateUtils';

describe('formatDate', () => {
  it('zero-pads single-digit months and days', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(formatDate(new Date(2026, 8, 5))).toBe('2026-09-05');
  });

  it('round-trips with parseDate', () => {
    const original = new Date(2026, 3, 28); // 2026-04-28
    expect(formatDate(parseDate(formatDate(original)))).toBe('2026-04-28');
  });
});

describe('parseDate', () => {
  it('parses "YYYY-MM-DD" into a Date', () => {
    const d = parseDate('2026-04-28');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3); // months are 0-indexed
    expect(d.getDate()).toBe(28);
  });
});

describe('todayString', () => {
  it('uses the injected "now" when provided', () => {
    const fakeNow = new Date(2026, 3, 28);
    expect(todayString(fakeNow)).toBe('2026-04-28');
  });
});

describe('addDays', () => {
  it('moves forward and backward correctly', () => {
    const base = new Date(2026, 3, 28);
    expect(formatDate(addDays(base, 1))).toBe('2026-04-29');
    expect(formatDate(addDays(base, -7))).toBe('2026-04-21');
  });

  it('crosses month boundaries', () => {
    const lastDayOfMonth = new Date(2026, 3, 30); // 2026-04-30
    expect(formatDate(addDays(lastDayOfMonth, 1))).toBe('2026-05-01');
  });

  it('crosses year boundaries', () => {
    const newYearsEve = new Date(2026, 11, 31);
    expect(formatDate(addDays(newYearsEve, 1))).toBe('2027-01-01');
  });
});

describe('daysAgoString', () => {
  it('returns N days before the injected now', () => {
    const fakeNow = new Date(2026, 3, 28);
    expect(daysAgoString(0, fakeNow)).toBe('2026-04-28');
    expect(daysAgoString(1, fakeNow)).toBe('2026-04-27');
    expect(daysAgoString(7, fakeNow)).toBe('2026-04-21');
  });
});

describe('daysBetween', () => {
  it('returns 0 for the same day', () => {
    expect(daysBetween('2026-04-28', '2026-04-28')).toBe(0);
  });

  it('returns positive when later is after earlier', () => {
    expect(daysBetween('2026-04-28', '2026-04-30')).toBe(2);
  });

  it('returns negative when later is before earlier', () => {
    expect(daysBetween('2026-04-30', '2026-04-28')).toBe(-2);
  });
});

describe('isConsecutive', () => {
  it('returns true for adjacent days', () => {
    expect(isConsecutive('2026-04-27', '2026-04-28')).toBe(true);
  });

  it('returns false for the same day', () => {
    expect(isConsecutive('2026-04-28', '2026-04-28')).toBe(false);
  });

  it('returns false when there is a gap', () => {
    expect(isConsecutive('2026-04-26', '2026-04-28')).toBe(false);
  });
});
