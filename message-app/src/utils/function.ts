import { set, get } from 'idb-keyval'
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

export const storePrivateKey = async (keyPair: CryptoKeyPair) => {
  const exportedPrivateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  await set(PRIVATE_KEY_PAIR_KEY, exportedPrivateKey)
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
