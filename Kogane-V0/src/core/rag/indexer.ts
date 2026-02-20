import { db } from '@/db'
import { nanoid } from 'nanoid'
import { chunkText } from './chunker'
import { embedText } from '@/core/memory/semantic'
import { estimateTokens } from '@/lib/tokens'
import type { Document } from '@/types'

async function parseDocument(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'txt' || ext === 'md') {
    return file.text()
  }

  if (ext === 'pdf') {
    const pdfjsLib = await import('pdfjs-dist')
    const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default as string
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const texts: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      texts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '))
    }
    return texts.join('\n\n')
  }

  if (ext === 'docx') {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  return file.text()
}

export async function indexDocument(file: File, agentId?: string): Promise<Document> {
  const content = await parseDocument(file)
  const docId = nanoid()

  const doc: Document = {
    id: docId,
    name: file.name,
    type: file.type || 'text/plain',
    size: file.size,
    content,
    agentId,
    createdAt: Date.now(),
  }

  await db.documents.add(doc)

  const textChunks = chunkText(content)
  const embeddings = await embedText(textChunks)

  for (let i = 0; i < textChunks.length; i++) {
    const chunkId = nanoid()
    const chunk = textChunks[i]!
    const embedding = embeddings[i]!

    await db.chunks.add({
      id: chunkId,
      documentId: docId,
      content: chunk,
      index: i,
      tokenCount: estimateTokens(chunk),
    })

    await db.vectors.add({
      id: nanoid(),
      chunkId,
      documentId: docId,
      embedding,
      createdAt: Date.now(),
    })
  }

  return doc
}

export async function deleteDocumentIndex(documentId: string): Promise<void> {
  const chunks = await db.chunks.where('documentId').equals(documentId).toArray()
  const chunkIds = chunks.map((c) => c.id)
  await db.vectors.where('chunkId').anyOf(chunkIds).delete()
  await db.chunks.where('documentId').equals(documentId).delete()
  await db.documents.delete(documentId)
}
