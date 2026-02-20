export class STTService {
  private recognition: SpeechRecognition | null = null
  private onResultCb: ((text: string, final: boolean) => void) | null = null
  private onErrorCb: ((err: string) => void) | null = null

  get isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }

  start(language = 'en-US'): void {
    const SR = (window.SpeechRecognition ?? window.webkitSpeechRecognition) as typeof SpeechRecognition
    this.recognition = new SR()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = language
    this.recognition.onresult = (e: SpeechRecognitionEvent) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        if (result) this.onResultCb?.(result[0]?.transcript ?? '', result.isFinal)
      }
    }
    this.recognition.onerror = (e: SpeechRecognitionErrorEvent) => this.onErrorCb?.(e.error)
    this.recognition.start()
  }

  stop(): void { this.recognition?.stop() }
  onResult(cb: (text: string, final: boolean) => void): void { this.onResultCb = cb }
  onError(cb: (err: string) => void): void { this.onErrorCb = cb }
}

export const sttService = new STTService()
