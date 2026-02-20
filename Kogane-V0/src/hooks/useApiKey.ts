import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { saveApiKey, loadApiKey, testApiKey as testKey } from '@/core/crypto/vault'
import { nanoid } from 'nanoid'
import type { ApiKey } from '@/types'

export function useApiKey() {
  const keys = useLiveQuery(() => db.apiKeys.toArray())

  const save = async (provider: string, label: string, rawKey: string) => {
    const { encryptedKey, iv } = await saveApiKey(provider, rawKey)
    const id = nanoid()
    await db.apiKeys.add({
      id,
      provider,
      label,
      encryptedKey,
      iv,
      createdAt: Date.now(),
      isDefault: false,
    })
  }

  const update = async (id: string, provider: string, label: string, rawKey: string) => {
    const { encryptedKey, iv } = await saveApiKey(provider, rawKey)
    await db.apiKeys.update(id, { provider, label, encryptedKey, iv })
  }

  const remove = async (id: string) => {
    await db.apiKeys.delete(id)
  }

  const test = async (provider: string, rawKey: string): Promise<boolean> => {
    const result = await testKey(provider, rawKey)
    return result
  }

  const getDecrypted = async (provider: string): Promise<string | null> => {
    return loadApiKey(provider)
  }

  return {
    keys,
    isLoading: keys === undefined,
    save,
    update,
    remove,
    test,
    getDecrypted,
  }
}