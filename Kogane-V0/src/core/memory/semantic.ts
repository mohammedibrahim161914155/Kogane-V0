import { db } from '@/db'
import type { Chunk } from '@/types'

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('@/workers/embedder.worker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

export function embedText(texts: string[]): Promise<number[][]> {
  return new Promise((resolve, reject) => {
    const w = getWorker()
    const id = Math.random().toString(36).slice(2)

    const handler = (e: MessageEvent<{ id: string; type: string; payload: number[][] | string }>) => {
      if (e.data.id !== id) return
      w.removeEventListener('message', handler)
      if (e.data.type === 'result') {
        resolve(e.data.payload as number[][])
      } else {
        reject(new Error(e.data.payload as string))
      }
    }

    w.addEventListener('message', handler)
    w.postMessage({ id, type: 'embed', payload: texts })
  })
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0)
    normA += (a[i] ?? 0) ** 2
    normB += (b[i] ?? 0) ** 2
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function searchSimilar(query: string, limit = 5, documentId?: string): Promise<Chunk[]> {
  const [queryEmbedding] = await embedText([query])
  if (!queryEmbedding) return []

  let vectorQuery = db.vectors.toCollection()
  if (documentId) {
    vectorQuery = db.vectors.where('documentId').equals(documentId)
  }

  const vectors = await vectorQuery.toArray()
  const scored = vectors.map((v) => ({
    chunkId: v.chunkId,
    score: cosineSimilarity(queryEmbedding, v.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)
  const topChunkIds = scored.slice(0, limit).map((s) => s.chunkId)

  const chunks = await Promise.all(topChunkIds.map((id) => db.chunks.get(id)))
  return chunks.filter(Boolean) as Chunk[]
}
