import * as React from 'react'
import { sttService } from '@/core/voice/stt'
import { ttsService } from '@/core/voice/tts'
import { useSettingsStore } from '@/stores/settings.store'

interface UseVoiceReturn {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  interimTranscript: string
  supported: boolean
  startListening: (lang?: string) => void
  stopListening: () => void
  speak: (text: string) => void
  stop: () => void
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = React.useState(false)
  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [transcript, setTranscript] = React.useState('')
  const [interimTranscript, setInterimTranscript] = React.useState('')
  const [supported, setSupported] = React.useState(true)
  const settings = useSettingsStore((s) => s.settings)

  React.useEffect(() => {
    setIsListening(sttService.isListening())
    setIsSpeaking(ttsService.isSpeaking())

    const handleSTTResult = (finalTranscript: string, interim: string) => {
      setTranscript(finalTranscript)
      setInterimTranscript(interim)
    }

    const handleSTTStart = () => setIsListening(true)
    const handleSTTStop = () => setIsListening(false)

    const handleTTSStart = () => setIsSpeaking(true)
    const handleTTSStop = () => setIsSpeaking(false)

    sttService.on('result', handleSTTResult)
    sttService.on('start', handleSTTStart)
    sttService.on('end', handleSTTStop)

    ttsService.on('start', handleTTSStart)
    ttsService.on('end', handleTTSStop)

    try {
      sttService.initialize()
    } catch (error) {
      console.error('STT not supported:', error)
      setSupported(false)
    }

    return () => {
      sttService.off('result', handleSTTResult)
      sttService.off('start', handleSTTStart)
      sttService.off('end', handleSTTStop)

      ttsService.off('start', handleTTSStart)
      ttsService.off('end', handleTTSStop)
    }
  }, [])

  const startListening = React.useCallback((lang?: string) => {
    if (!supported) return
    sttService.start(lang || settings.sttLanguage)
  }, [supported, settings.sttLanguage])

  const stopListening = React.useCallback(() => {
    sttService.stop()
  }, [])

  const speak = React.useCallback((text: string) => {
    ttsService.speak(text, settings.ttsVoice, {
      rate: 1,
      pitch: 1,
      volume: 1,
    })
  }, [settings.ttsVoice])

  const stop = React.useCallback(() => {
    ttsService.stop()
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    supported,
    startListening,
    stopListening,
    speak,
    stop,
  }
}