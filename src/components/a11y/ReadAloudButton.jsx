import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { StopCircleOutlined, VolumeUpOutlined } from '@mui/icons-material'
import { isSpeechSynthesisSupported } from '../../utils/speech.js'

function pickTurkishVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || []
    return voices.find(v => v.lang?.toLowerCase().startsWith('tr')) || null
  } catch {
    return null
  }
}

/**
 * Sesli okuma: metni cihazın kendi Türkçe sesiyle okur (internet/ücret yok).
 * Görme kaybı yaşayan üyeler (ör. RP grubu) ve uzun metni okumakta zorlananlar
 * için. Sayfadan ayrılınca okuma durur.
 */
export default function ReadAloudButton({ text, size = 'small', sx }) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => { if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel() }, [])

  if (!isSpeechSynthesisSupported() || !text) return null

  const toggle = (e) => {
    e.stopPropagation()
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    synth.cancel()
    const utter = new window.SpeechSynthesisUtterance(text)
    utter.lang = 'tr-TR'
    const voice = pickTurkishVoice()
    if (voice) utter.voice = voice
    utter.rate = 0.95
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    synth.speak(utter)
    setSpeaking(true)
  }

  return (
    <Button
      size={size}
      onClick={toggle}
      startIcon={speaking ? <StopCircleOutlined /> : <VolumeUpOutlined />}
      aria-pressed={speaking}
      sx={{ color: speaking ? 'primary.main' : 'text.secondary', fontWeight: 600, minHeight: 36, borderRadius: 999, px: 1.25, ...sx }}
    >
      {speaking ? 'Durdur' : 'Sesli dinle'}
    </Button>
  )
}
