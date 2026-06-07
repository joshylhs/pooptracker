import { LeaderboardEntry } from '../services/friends';

export type Mood = 'inactive' | 'proud' | 'default';

export function getMood(entry: LeaderboardEntry, _rank: number): Mood {
  // Inactive: no logs today
  if (entry.countToday === 0) return 'inactive';

  // Proud: currently on their all-time personal best streak
  if (entry.currentStreak > 0 && entry.currentStreak === entry.longestStreak) return 'proud';

  return 'default';
}
