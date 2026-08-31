import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

/**
 * Feldverschlüsselung für personenbezogene Daten (AES-256-GCM).
 *
 * Format: 'v1:' + iv_b64 + ':' + tag_b64 + ':' + ct_b64
 * Schlüssel: ENCRYPTION_KEY (Base64, exakt 32 Byte).
 */

const PREFIX = 'v1:';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY Umgebungsvariable ist nicht gesetzt (Base64, 32 Byte erforderlich)',
    );
  }

  let key: Buffer;
  try {
    key = Buffer.from(raw, 'base64');
  } catch {
    throw new Error(
      'ENCRYPTION_KEY ist ungültig: Wert muss Base64-kodiert sein',
    );
  }

  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY ist ungültig: dekodiert ${key.length} Byte, erwartet werden 32 Byte`,
    );
  }

  cachedKey = key;
  return key;
}

/**
 * Verschlüsselt einen Feldwert. null/leerer String → null.
 */
export function encryptField(v: string | null | undefined): string | null {
  if (v === null || v === undefined || v === '') return null;

  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(v, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return (
    PREFIX +
    iv.toString('base64') +
    ':' +
    tag.toString('base64') +
    ':' +
    ciphertext.toString('base64')
  );
}

/**
 * Entschlüsselt einen Feldwert. Werte ohne 'v1:'-Präfix werden unverändert
 * zurückgegeben (Alt-Plaintext-Passthrough).
 */
export function decryptField(v: string | null): string | null {
  if (v === null) return null;
  if (!v.startsWith(PREFIX)) return v;

  const key = getKey();
  const parts = v.slice(PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Verschlüsselter Wert hat ein ungültiges Format');
  }

  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error(
      'Entschlüsselung fehlgeschlagen: Daten beschädigt oder falscher ENCRYPTION_KEY',
    );
  }
}
