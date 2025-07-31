// crypto-backup.ts
import { b64urlDecode, b64urlEncode } from './base64Url'

const enc = new TextEncoder()

/** Derive an AES‑256‑GCM key from a pass‑phrase + salt */
async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey'])

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 310_000, // ~1 second on mid‑range laptop
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Export, encrypt, and serialize the private key */
export async function encryptPrivateKey(privKey: CryptoKey, passphrase: string) {
  // 1. Export as PKCS#8
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', privKey)

  // 2. Salt + IV
  const salt = crypto.getRandomValues(new Uint8Array(16)) // 128‑bit salt
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96‑bit IV (GCM)

  // 3. Derive AES key
  const aesKey = await deriveAesKey(passphrase, salt)

  // 4. Encrypt
  const cipherText = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, pkcs8)

  // 5. Return JSON‑serializable payload (base64url)
  return {
    cipher: b64urlEncode(cipherText),
    salt: b64urlEncode(salt.buffer),
    iv: b64urlEncode(iv.buffer),
    algo: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256-310000'
  }
}

export const decryptPassphrase = async (
  cipher: string,
  salt: string,
  iv: string,
  password: string
): Promise<string> => {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, [
    'deriveKey'
  ])
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64urlDecode(salt), iterations: 310_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64urlDecode(iv) }, aesKey, b64urlDecode(cipher))

  return new TextDecoder().decode(decrypted)
}

export async function decryptPrivateKey(
  payload: { cipher: string; salt: string; iv: string },
  passphrase: string
): Promise<CryptoKey> {
  const { cipher, salt, iv } = payload

  const saltBuf = b64urlDecode(salt)
  const ivBuf = b64urlDecode(iv)
  const cipherBuf = b64urlDecode(cipher)

  const aesKey = await deriveAesKey(passphrase, saltBuf as Uint8Array)

  const pkcs8 = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuf }, aesKey, cipherBuf)

  return crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'RSA-OAEP', hash: 'SHA-256' }, // use params of original key
    true,
    ['decrypt']
  )
}
