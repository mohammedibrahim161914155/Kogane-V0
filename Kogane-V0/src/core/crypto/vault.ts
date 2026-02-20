import { VAULT_SALT_KEY } from '@/lib/constants'
import { db } from '@/db'
import { nanoid } from 'nanoid'

async function getOrCreateSalt(): Promise<Uint8Array> {
  const stored = localStorage.getItem(VAULT_SALT_KEY)
  if (stored) {
    const arr = JSON.parse(stored) as number[]
    return new Uint8Array(arr)
  }
  const salt = crypto.getRandomValues(new Uint8Array(32))
  localStorage.setItem(VAULT_SALT_KEY, JSON.stringify(Array.from(salt)))
  return salt
}

async function deriveKey(): Promise<CryptoKey> {
  const salt = await getOrCreateSalt()
  const keyMaterial = await crypto.subtle.importKey('raw', salt, 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptApiKey(plaintext: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await deriveKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

export async function decryptApiKey(ciphertext: string, ivStr: string): Promise<string> {
  const key = await deriveKey()
  const iv = new Uint8Array(
    atob(ivStr)
      .split('')
      .map((c) => c.charCodeAt(0)),
  )
  const data = new Uint8Array(
    atob(ciphertext)
      .split('')
      .map((c) => c.charCodeAt(0)),
  )
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(decrypted)
}

export async function saveApiKey(provider: string, label: string, rawKey: string): Promise<void> {
  const { ciphertext, iv } = await encryptApiKey(rawKey)
  const existing = await db.apiKeys.where('provider').equals(provider).first()
  if (existing) {
    await db.apiKeys.update(existing.id, { encryptedKey: ciphertext, iv, label, lastTested: undefined })
  } else {
    await db.apiKeys.add({
      id: nanoid(),
      provider,
      label,
      encryptedKey: ciphertext,
      iv,
      createdAt: Date.now(),
      isDefault: true,
    })
  }
}

export async function loadApiKey(provider: string): Promise<string | null> {
  const record = await db.apiKeys.where('provider').equals(provider).first()
  if (!record) return null
  return decryptApiKey(record.encryptedKey, record.iv)
}

export async function testApiKey(provider: string, rawKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${rawKey}` },
    })
    if (res.ok) {
      const record = await db.apiKeys.where('provider').equals(provider).first()
      if (record) await db.apiKeys.update(record.id, { lastTested: Date.now() })
    }
    return res.ok
  } catch {
    return false
  }
}
