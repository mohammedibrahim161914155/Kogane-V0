export class TTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null

  get isSupported(): boolean { return 'speechSynthesis' in window }

  speak(text: string, voiceName?: string): void {
    this.stop()
    const utterance = new SpeechSynthesisUtterance(text)
    if (voiceName) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.name === voiceName)
      if (voice) utterance.voice = voice
    }
    this.currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  stop(): void {
    window.speechSynthesis.cancel()
    this.currentUtterance = null
  }

  getVoices(): SpeechSynthesisVoice[] { return window.speechSynthesis.getVoices() }
}

export const ttsService = new TTSService()
