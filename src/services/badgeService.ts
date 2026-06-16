import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  increment,
} from '@react-native-firebase/firestore';
import { db } from './firebase';
import { getUserProfile, updateUserProfile } from './users';
import {
  BadgeKey,
  BadgeEvalContext,
  evaluateBadges,
  newBadges,
} from '../utils/badgeUtils';
import { calculateStreaks, DailySummary } from '../utils/streakUtils';
import { formatDate, addDays, daysBetween } from '../utils/dateUtils';

// ── Poke counter helpers ──────────────────────────────────────────────────────

export async function incrementPokesSent(uid: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { pokesSent: increment(1), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function incrementPokesReceived(uid: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { pokesReceived: increment(1), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

// ── Context builder ───────────────────────────────────────────────────────────

async function readDailyCount(uid: string, dateStr: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', uid, 'dailySummaries', dateStr));
  if (!snap.exists()) return 0;
  return (snap.data() as { count?: number }).count ?? 0;
}

export async function buildBadgeContext(uid: string): Promise<BadgeEvalContext> {
  const today = new Date();
  const todayStr = formatDate(today);

  // Last 400 days of daily summaries for streaks + total logs
  const lookback = 400;
  const dates = Array.from({ length: lookback }, (_, i) =>
    formatDate(addDays(today, -i)),
  );

  const [summarySnaps, profileSnap, friendsSnap] = await Promise.all([
    Promise.all(dates.map(d => getDoc(doc(db, 'users', uid, 'dailySummaries', d)))),
    getDoc(doc(db, 'users', uid)),
    getDocs(query(collection(db, 'friendships', uid, 'friends'))),
  ]);

  const summaries: DailySummary[] = summarySnaps
    .map((snap, i) => ({
      date: dates[i],
      count: snap.exists() ? ((snap.data() as { count?: number }).count ?? 0) : 0,
    }))
    .filter(s => s.count > 0);

  const totalLogs = summaries.reduce((acc, s) => acc + s.count, 0);

  const { currentStreak } = calculateStreaks(summaries);

  // Night owl: logs between 12am–4am stored with timestamp on the log docs
  // We read nightOwlCount from a field we maintain on the user doc
  const profileData = profileSnap.exists() ? (profileSnap.data() ?? {}) : {};
  const nightOwlCount: number = (profileData as any).nightOwlCount ?? 0;
  const pokesSent: number = (profileData as any).pokesSent ?? 0;
  const pokesReceived: number = (profileData as any).pokesReceived ?? 0;

  // Friend count (accepted only)
  const acceptedFriends = friendsSnap.docs.filter(
    d => (d.data() as { status: string }).status === 'accepted',
  );
  const friendCount = acceptedFriends.length;

  // Monday warrior — count consecutive Mondays with a log
  let mondayStreakWeeks = 0;
  const d = new Date(today);
  // rewind to last Monday
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  while (true) {
    const dateStr2 = formatDate(d);
    const hasLog = summaries.some(s => s.date === dateStr2);
    if (!hasLog) break;
    mondayStreakWeeks++;
    d.setDate(d.getDate() - 7);
  }

  // Consistent Carl — consecutive days where all logs are within ±30min of the same time
  // We track this via a stored field updated on log save (complex to compute here; default 0)
  const consistentCarlDays: number = (profileData as any).consistentCarlDays ?? 0;

  // Gap detection — days since previous log before the current run
  const loggedDates = summaries.map(s => s.date).sort();
  let gapDays: number | null = null;
  if (loggedDates.length >= 2) {
    // Find the gap just before the current streak started
    // Walk backwards from most recent to find streak start
    let streakStart = loggedDates[loggedDates.length - 1];
    for (let i = loggedDates.length - 2; i >= 0; i--) {
      if (daysBetween(loggedDates[i], loggedDates[i + 1]) === 1) {
        streakStart = loggedDates[i];
      } else {
        // gap found — loggedDates[i] is the last log before the break
        gapDays = daysBetween(loggedDates[i], streakStart);
        break;
      }
    }
  }

  // Leaderboard — read from stored fields (set by checkLeaderboardTrophies)
  const leaderboard = {
    topDay:   (profileData as any).trophyDay   === true,
    topWeek:  (profileData as any).trophyWeek  === true,
    topMonth: (profileData as any).trophyMonth === true,
    topYear:  (profileData as any).trophyYear  === true,
  };

  return {
    totalLogs,
    currentStreak,
    nightOwlCount,
    mondayStreakWeeks,
    consistentCarlDays,
    gapDays,
    friendCount,
    pokesSent,
    pokesReceived,
    bristolIdealStreak: 0, // skipped for v1
    leaderboard,
  };
}

// ── Main evaluation entry point ───────────────────────────────────────────────

/**
 * Evaluates all badges for a user, awards any newly earned ones, and returns
 * the list of newly earned badge keys (empty array if nothing new).
 */
export async function checkAndAwardBadges(uid: string): Promise<BadgeKey[]> {
  const [ctx, profile] = await Promise.all([
    buildBadgeContext(uid),
    getUserProfile(uid),
  ]);
  if (!profile) return [];

  const earned = evaluateBadges(ctx);
  const newly = newBadges(profile.badges, earned);

  if (newly.length > 0) {
    await updateUserProfile(uid, {
      badges: [...profile.badges, ...newly],
    });
  }

  return newly;
}

// ── Night owl counter ─────────────────────────────────────────────────────────

/** Call this after a log is saved; increments nightOwlCount if timestamp falls 12am–4am. */
export async function maybeIncrementNightOwl(uid: string, timestamp: number): Promise<void> {
  const hour = new Date(timestamp).getHours();
  if (hour < 4) {
    await setDoc(
      doc(db, 'users', uid),
      { nightOwlCount: increment(1), updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
}

// ── Leaderboard trophy check ──────────────────────────────────────────────────

/**
 * Checks if the user was #1 at end of previous day/week/month/year.
 * Call this on app open after leaderboard data is available.
 * Stores boolean flags on the user doc so buildBadgeContext can read them.
 */
export async function checkLeaderboardTrophies(
  uid: string,
  previousPeriodRanks: {
    topDay: boolean;
    topWeek: boolean;
    topMonth: boolean;
    topYear: boolean;
  },
): Promise<void> {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.exists() ? (snap.data() ?? {}) : {};

  const current = {
    trophyDay:   (data as any).trophyDay   === true,
    trophyWeek:  (data as any).trophyWeek  === true,
    trophyMonth: (data as any).trophyMonth === true,
    trophyYear:  (data as any).trophyYear  === true,
  };

  const updated = {
    trophyDay:   current.trophyDay   || previousPeriodRanks.topDay,
    trophyWeek:  current.trophyWeek  || previousPeriodRanks.topWeek,
    trophyMonth: current.trophyMonth || previousPeriodRanks.topMonth,
    trophyYear:  current.trophyYear  || previousPeriodRanks.topYear,
  };

  const changed =
    updated.trophyDay   !== current.trophyDay   ||
    updated.trophyWeek  !== current.trophyWeek  ||
    updated.trophyMonth !== current.trophyMonth ||
    updated.trophyYear  !== current.trophyYear;

  if (changed) {
    await setDoc(doc(db, 'users', uid), { ...updated, updatedAt: serverTimestamp() }, { merge: true });
  }
}
