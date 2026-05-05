// Minimal type declarations for tweetnacl-sealedbox-js — the package itself
// ships JS only. Functions match the runtime exports of `sealedbox.node.js`.
declare module 'tweetnacl-sealedbox-js' {
  /**
   * Anonymously encrypt `message` to a recipient's public key.
   * Returns the sealed-box ciphertext.
   */
  export function seal(message: Uint8Array, recipientPublicKey: Uint8Array): Uint8Array;

  /**
   * Decrypt a sealed-box ciphertext using the recipient's keypair.
   * Returns null if decryption fails (wrong recipient or corrupted ciphertext).
   */
  export function open(
    ciphertext: Uint8Array,
    recipientPublicKey: Uint8Array,
    recipientSecretKey: Uint8Array,
  ): Uint8Array | null;

  const sealedbox: { seal: typeof seal; open: typeof open };
  export default sealedbox;
}
