import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import sealedbox from 'tweetnacl-sealedbox-js';
import { sha256 } from 'js-sha256';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO(keychain): The NaCl private key is currently stored in AsyncStorage.
// Per spec, it must live in iOS Keychain / Android Keystore. Swap to
// react-native-keychain before launch. See memory: project_pooptracker_keychain_deferred.

const PUBLIC_KEY_STORAGE = '@pooptracker/libsodium_public_key';
const PRIVATE_KEY_STORAGE = '@pooptracker/libsodium_private_key';

export interface Keypair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

async function loadKeypair(): Promise<Keypair | null> {
  const [pub, priv] = await Promise.all([
    AsyncStorage.getItem(PUBLIC_KEY_STORAGE),
    AsyncStorage.getItem(PRIVATE_KEY_STORAGE),
  ]);
  if (!pub || !priv) return null;
  return {
    publicKey: naclUtil.decodeBase64(pub),
    privateKey: naclUtil.decodeBase64(priv),
  };
}

async function storeKeypair(kp: Keypair): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(PUBLIC_KEY_STORAGE, naclUtil.encodeBase64(kp.publicKey)),
    AsyncStorage.setItem(PRIVATE_KEY_STORAGE, naclUtil.encodeBase64(kp.privateKey)),
  ]);
}

/**
 * Returns the user's keypair, generating and persisting a new one on first call.
 * Idempotent — safe to call any time.
 */
export async function getOrCreateKeypair(): Promise<Keypair> {
  const existing = await loadKeypair();
  if (existing) return existing;
  const fresh = nacl.box.keyPair();
  const kp: Keypair = {
    publicKey: fresh.publicKey,
    privateKey: fresh.secretKey,
  };
  await storeKeypair(kp);
  return kp;
}

/** Returns this device's public key as base64. Safe to publish. */
export async function getPublicKeyBase64(): Promise<string> {
  const kp = await getOrCreateKeypair();
  return naclUtil.encodeBase64(kp.publicKey);
}

/**
 * Erase the stored keypair. Used on account delete or test reset.
 * After this, getOrCreateKeypair() will mint a fresh keypair on next call.
 */
export async function eraseKeypair(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(PUBLIC_KEY_STORAGE),
    AsyncStorage.removeItem(PRIVATE_KEY_STORAGE),
  ]);
}

/**
 * Encrypts an arbitrary JSON-serializable value to a recipient's public key.
 * Uses NaCl sealed boxes — anonymous one-way encryption. Only the holder of
 * the matching private key can decrypt.
 *
 * Returns base64 ciphertext, ready to write to Firestore.
 */
export async function encryptForRecipient(
  plaintext: unknown,
  recipientPublicKeyBase64: string,
): Promise<string> {
  const recipientPublicKey = naclUtil.decodeBase64(recipientPublicKeyBase64);
  const message = naclUtil.decodeUTF8(JSON.stringify(plaintext));
  const ciphertext = sealedbox.seal(message, recipientPublicKey);
  return naclUtil.encodeBase64(ciphertext);
}

/**
 * Decrypts a sealed-box ciphertext using this device's keypair.
 * Returns the parsed JSON value, or null if decryption fails (wrong recipient,
 * corrupted ciphertext, or key rotation).
 */
export async function decryptForSelf(ciphertextBase64: string): Promise<unknown | null> {
  const kp = await getOrCreateKeypair();
  try {
    const ciphertext = naclUtil.decodeBase64(ciphertextBase64);
    const plaintext = sealedbox.open(ciphertext, kp.publicKey, kp.privateKey);
    if (!plaintext) return null;
    return JSON.parse(naclUtil.encodeUTF8(plaintext));
  } catch {
    return null;
  }
}

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
 *
 * The hash is one-way: holding the index does not let anyone recover usernames.
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
