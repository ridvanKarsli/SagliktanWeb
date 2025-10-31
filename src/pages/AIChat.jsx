import { useState } from 'react'
import { Box, Button, Stack, TextField, Typography, Avatar } from '@mui/material'
import { SmartToy } from '@mui/icons-material'
import { delay } from '../utils/fakeApi.js'
import { mockAiAnswer } from '../data/fakeData.js'
import Surface from '../components/Surface.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import SagliktaAiControllerApi from '../services/generated/src/api/SagliktaAiControllerApi'

export default function AIChat() {
  const { token } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Ben sağlıklı yaşam danışmanı AI. Nasıl yardımcı olabilirim?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      if (!token) {
        await delay(400)
        setMessages(m => [...m, { role: 'ai', text: mockAiAnswer(text) }])
      } else {
        const api = new SagliktaAiControllerApi()
        const res = await api.askSagliktaAI(text, `Bearer ${token}`)
        const answer = typeof res?.message === 'string' ? res.message : (res?.data ?? res ?? '')
        setMessages(m => [...m, { role: 'ai', text: String(answer || 'Bir yanıt alınamadı.') }])
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: mockAiAnswer(text) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Surface sx={{ overflow: 'visible', p: { xs: 1.5, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: { xs: 1, md: 2 }, fontWeight: 800 }}>
        AI ile Sohbet
      </Typography>

      <Stack spacing={1.5} sx={{ minHeight: 360 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          maxHeight: { xs: 360, md: 480 },
          overflowY: 'auto',
          pr: 0.5
        }}>
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            return (
              <Stack
                key={i}
                direction={isUser ? 'row-reverse' : 'row'}
                spacing={1}
                alignItems="flex-start"
              >
                <Avatar sx={{ bgcolor: isUser ? 'primary.main' : 'secondary.main' }}>
                  {isUser ? 'U' : <SmartToy fontSize="small" />}
                </Avatar>
                <Box
                  sx={{
                    p: 1.25,
                    maxWidth: { xs: '100%', md: '70%' },
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.16)',
                    backgroundColor: isUser ? 'rgba(52,195,161,0.08)' : 'transparent',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                </Box>
              </Stack>
            )
          })}
        </Box>

        <Box component="form" onSubmit={send} sx={{ display: 'flex', gap: { xs: 0.75, md: 1 }, pt: 1 }}>
          <TextField
            fullWidth
            placeholder="Mesaj yaz…"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="AI mesaj girişi"
          />
          <Button type="submit" disabled={loading}>
            Gönder
          </Button>
        </Box>
      </Stack>
    </Surface>
  )
}
