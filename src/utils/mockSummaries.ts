import { DailySummary } from './streakUtils';
import { addDays, formatDate } from './dateUtils';

/**
 * Generates fake DailySummary entries for the past `days` days, ending today.
 * Distribution skews toward 1-2 logs per day with occasional zeros and 3+ days.
 *
 * Used only to populate the UI during development before SQLite + Firestore
 * persistence land. Replace with real reads once the data layer exists.
 */
export function generateMockSummaries(
  days: number,
  now: Date = new Date(),
): DailySummary[] {
  const summaries: DailySummary[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = formatDate(addDays(now, -i));
    const count = sampleCount(i);
    if (count > 0) {
      summaries.push({ date, count });
    }
  }
  return summaries;
}

// Pseudo-random but deterministic per-day so the UI doesn't jitter on every render.
function sampleCount(daysAgo: number): number {
  const seed = (daysAgo * 9301 + 49297) % 233280;
  const random = seed / 233280;
  if (random < 0.15) return 0;
  if (random < 0.55) return 1;
  if (random < 0.85) return 2;
  if (random < 0.97) return 3;
  return 4;
}
