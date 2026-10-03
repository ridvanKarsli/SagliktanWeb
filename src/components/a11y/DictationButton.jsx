import { useEffect, useRef, useState } from 'react'
import { IconButton, Tooltip, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { MicNoneRounded, MicRounded } from '@mui/icons-material'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getRecognitionCtor } from '../../utils/speech.js'

/**
 * Sesle yazma: mikrofona basılı değil, dokun-başlat / dokun-durdur. Tanınan
 * her kesin (final) cümle onText ile alana EKLENİR - yazılanın üzerine
 * yazılmaz. Görme güçlüğü yaşayanlar, yaşlı kullanıcılar ve telefonda uzun
 * metin yazmak zor gelenler için.
 */
export default function DictationButton({ onText, disabled = false, size = 'medium', label = 'Sesle yaz' }) {
  const theme = useTheme()
  const { showError, showInfo } = useNotification()
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)
  const onTextRef = useRef(onText)
  useEffect(() => { onTextRef.current = onText }, [onText])

  useEffect(() => () => { try { recRef.current?.abort() } catch { /* yoksay */ } }, [])

  const Ctor = getRecognitionCtor()
  if (!Ctor) return null

  const stop = () => {
    try { recRef.current?.stop() } catch { /* yoksay */ }
  }

  const start = () => {
    const rec = new Ctor()
    rec.lang = 'tr-TR'
    rec.continuous = true
    rec.interimResults = false
    rec.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) text += event.results[i][0].transcript
      }
      text = text.trim()
      if (text) onTextRef.current?.(text)
    }
    rec.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        showError('Mikrofon izni verilmedi. Tarayıcı ayarlarından mikrofona izin verip tekrar dene.')
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        showError('Ses algılanamadı, tekrar dener misin?')
      }
    }
    rec.onend = () => { setListening(false); recRef.current = null }
    try {
      rec.start()
      recRef.current = rec
      setListening(true)
      showInfo('Dinliyorum… Bitince mikrofona tekrar dokun.', 2500)
    } catch {
      showError('Sesle yazma başlatılamadı.')
    }
  }

  return (
    <Tooltip title={listening ? 'Dinlemeyi durdur' : label}>
      <span>
        <IconButton
          onClick={(e) => { e.stopPropagation(); if (listening) stop(); else start() }}
          disabled={disabled}
          size={size}
          aria-label={listening ? 'Dinlemeyi durdur' : label}
          aria-pressed={listening}
          sx={{
            width: 44, height: 44,
            color: listening ? 'error.main' : 'text.secondary',
            ...(listening ? {
              bgcolor: 'action.selected',
              animation: 'dictation-pulse 1.4s ease-in-out infinite',
              '@keyframes dictation-pulse': {
                '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.35)}` },
                '50%': { boxShadow: `0 0 0 8px ${alpha(theme.palette.error.main, 0)}` }
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
            } : {})
          }}
        >
          {listening ? <MicRounded /> : <MicNoneRounded />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
