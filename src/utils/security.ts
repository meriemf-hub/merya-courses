// Cryptographic hashing using Web Crypto API (SHA-256 with salt)
// Ensures passwords are NEVER stored in plain text in Firestore.
// Only the irreversible cryptographic hash + salt is stored.

export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const saltStr = bytesToHex(salt);

  // Combine salt + password
  const saltedPassword = new Uint8Array([...salt, ...encoder.encode(password)]);
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
  const hashHex = bytesToHex(new Uint8Array(hashBuffer));

  return { hash: hashHex, salt: saltStr };
}

export async function verifyPassword(password: string, expectedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
