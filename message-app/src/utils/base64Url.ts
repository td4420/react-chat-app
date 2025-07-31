export function b64urlEncode(buf: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } else {
    // Browser fallback
    const binary = String.fromCharCode(...new Uint8Array(buf))
    const base64 = window.btoa(binary)

    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
}

export function b64urlDecode(str: string): BufferSource {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(padded, 'base64'))
  } else {
    // Browser fallback
    const binary = window.atob(padded)

    return Uint8Array.from(binary, char => char.charCodeAt(0))
  }
}
