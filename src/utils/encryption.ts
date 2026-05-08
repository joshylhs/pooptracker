import naclUtil from 'tweetnacl-util';
import { sha256 } from 'js-sha256';

// Username hashing only. End-to-end encryption was removed when the data model
// moved to plaintext-on-Firestore — see refactor_plan.md. The username hash
// remains because we don't want plaintext usernames in a queryable index.

/**
 * Normalises a username into its canonical form: trim → Unicode NFC → lowercase.
 * Always applied before hashing, on both write (signup) and read (search), so
 * "Josh", "  josh ", and "JOSH" all collide on the same hash.
 */
export function normalizeUsername(input: string): string {
  return input.trim().normalize('NFC').toLowerCase();
}

/**
 * One-way SHA-256 hash of the normalised username, URL-safe base64 (no padding).
 * Used as the document ID in `usernameIndex/{usernameHash}`.
 */
export async function hashUsername(rawUsername: string): Promise<string> {
  const normalised = normalizeUsername(rawUsername);
  const digest = new Uint8Array(sha256.array(normalised));
  return naclUtil
    .encodeBase64(digest)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
