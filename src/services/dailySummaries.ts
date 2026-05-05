import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { encryptForRecipient, getPublicKeyBase64 } from '../utils/encryption';
import { listLogsForDate as repoListLogsForDate } from '../database/logRepository';

export interface DailySummary {
  date: string;
  count: number;
  userId: string;
}

/**
 * Recomputes the count for (uid, date) from local SQLite, encrypts the summary
 * to the user's own public key, and upserts it to Firestore at
 * `userDailySummaries/{uid}/days/{date}`.
 *
 * Forward-compatible: when friends are added in step 10, this will also encrypt
 * to each accepted-friend's public key and add their ciphertexts to the map.
 *
 * Errors are not thrown — the local SQLite write is the source of truth, and
 * Firestore is a best-effort mirror for friend visibility. Callers should not
 * await this from the UI thread; use `void syncDailySummary(...)`.
 */
export async function syncDailySummary(uid: string, date: string): Promise<void> {
  try {
    const count = repoListLogsForDate(uid, date).length;
    const plaintext: DailySummary = { date, count, userId: uid };
    const ownPublicKey = await getPublicKeyBase64();
    const selfCipher = await encryptForRecipient(plaintext, ownPublicKey);

    await setDoc(doc(db, 'userDailySummaries', uid, 'days', date), {
      ciphertexts: { [uid]: selfCipher },
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    // Step 13 (polish) can add retry / offline queue. For now, surface in dev
    // logs and move on — the local SQLite write is unaffected.
    console.warn('[dailySummaries] sync failed', err);
  }
}
