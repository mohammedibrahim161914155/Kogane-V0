import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'

let extractor: FeatureExtractionPipeline | null = null

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      dtype: 'fp32',
    })
  }
  return extractor
}

self.addEventListener('message', async (e: MessageEvent<{ id: string; type: string; payload: string[] }>) => {
  const { id, type, payload } = e.data

  if (type !== 'embed') return

  try {
    const ext = await getExtractor()
    const results: number[][] = []

    for (const text of payload) {
      const output = await ext(text, { pooling: 'mean', normalize: true })
      const data = output.data as Float32Array
      results.push(Array.from(data))
    }

    self.postMessage({ id, type: 'result', payload: results })
  } catch (err) {
    self.postMessage({ id, type: 'error', payload: String(err) })
  }
})
