import { del, get, set } from 'idb-keyval'
import { b64urlEncode } from './base64Url'
import { PRIVATE_KEY_PAIR_KEY } from './const'

const algorithm = {
  name: 'RSA-OAEP',
  hash: 'SHA-256'
}

export const getMessageFromHashContent = async (
  encryptedKey: string,
  encryptedPayload: string,
  iv: string
): Promise<string> => {
  const privateKey = await getPrivateKey()
  if (!privateKey) {
    return ''
  }

  const aesKey = await decryptSymmetricKey(encryptedKey, privateKey)

  return await decryptMessagePayload(encryptedPayload, aesKey, iv)
}

export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      ...algorithm,
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1])
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

export const storePrivateKey = async (privateKey: CryptoKey) => {
  const exportedPrivateKey = await crypto.subtle.exportKey('pkcs8', privateKey)
  await set(PRIVATE_KEY_PAIR_KEY, exportedPrivateKey)
}

export const removePrivateKey = async () => {
  await del(PRIVATE_KEY_PAIR_KEY)
}

export const getPublicKey = async (keyPair: CryptoKeyPair) => {
  return await crypto.subtle.exportKey('spki', keyPair.publicKey)
}

export const getPrivateKey = async () => {
  const exportedPrivateKey = await get(PRIVATE_KEY_PAIR_KEY)
  if (!exportedPrivateKey) {
    return ''
  }

  return await crypto.subtle.importKey('pkcs8', exportedPrivateKey, algorithm, true, ['decrypt'])
}

export const strToUint8 = (str: string): BufferSource => {
  return new TextEncoder().encode(str)
}

export const uint8ToStr = (u8: ArrayBuffer | ArrayBufferView): string => {
  const buffer = u8 instanceof ArrayBuffer ? u8 : u8.buffer

  return new TextDecoder().decode(buffer)
}

export const b64 = (arrBuf: ArrayBuffer | Uint8Array): string => {
  const u8 = arrBuf instanceof Uint8Array ? arrBuf : new Uint8Array(arrBuf)

  return Buffer.from(u8).toString('base64')
}

export const fromB64 = (base64: string): ArrayBuffer | Uint8Array => {
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

export const decryptSymmetricKey = async (encryptedSymKeyB64: string, privateKey: CryptoKey) => {
  const encryptedSymKey = fromB64(encryptedSymKeyB64)

  const aesKeyRaw = await crypto.subtle.decrypt({ name: algorithm.name }, privateKey, encryptedSymKey as BufferSource)

  return await crypto.subtle.importKey('raw', aesKeyRaw, { name: 'AES-GCM' }, false, ['decrypt'])
}

export const decryptMessagePayload = async (encryptedPayloadB64: string, aesKey: CryptoKey, ivB64: string) => {
  const encryptedPayload = fromB64(encryptedPayloadB64) as BufferSource
  const iv = fromB64(ivB64) as BufferSource

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, encryptedPayload)

  return uint8ToStr(new Uint8Array(decrypted))
}

export const getCryptoKeyFromBase64 = async (publicKey: string) => {
  const keyBuffer = fromB64(publicKey) as BufferSource

  return await crypto.subtle.importKey('spki', keyBuffer, algorithm, true, ['encrypt'])
}

export const generatePassphrase = (): string => {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16))

  // Per RFC4122 version 4 UUID structure
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant

  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  const hex = Array.from(bytes).map(toHex).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const encryptPassphrase = async (passphrase: string, userPassword: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16))

  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, new TextEncoder().encode(passphrase))

  return {
    cipher: b64urlEncode(encrypted),
    salt: b64urlEncode(salt.buffer),
    iv: b64urlEncode(iv.buffer)
  }
}
