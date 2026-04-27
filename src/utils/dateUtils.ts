export type DateString = string;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatDate(date: Date): DateString {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(s: DateString): Date {
  const [year, month, day] = s.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayString(now: Date = new Date()): DateString {
  return formatDate(now);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysAgoString(n: number, now: Date = new Date()): DateString {
  return formatDate(addDays(now, -n));
}

export function daysBetween(a: DateString, b: DateString): number {
  const dayA = parseDate(a).getTime();
  const dayB = parseDate(b).getTime();
  return Math.round((dayB - dayA) / MS_PER_DAY);
}

export function isConsecutive(earlier: DateString, later: DateString): boolean {
  return daysBetween(earlier, later) === 1;
}
