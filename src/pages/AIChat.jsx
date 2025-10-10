import { useState } from 'react'
import { Box, Button, Stack, TextField, Typography, Avatar } from '@mui/material'
import { SmartToy } from '@mui/icons-material'
import { delay } from '../utils/fakeApi.js'
import { mockAiAnswer } from '../data/fakeData.js'
import Surface from '../components/Surface.jsx'

export default function AIChat() {
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
    await delay(500)
    setMessages(m => [...m, { role: 'ai', text: mockAiAnswer(text) }])
    setLoading(false)
  }

  return (
    <Surface sx={{ borderRadius: 16 }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
        AI ile Sohbet
      </Typography>

      <Stack spacing={2} sx={{ minHeight: 360 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                    backgroundColor: isUser ? 'rgba(52,195,161,0.08)' : 'transparent'
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{m.text}</Typography>
                </Box>
              </Stack>
            )
          })}
        </Box>

        <Box component="form" onSubmit={send} sx={{ display: 'flex', gap: 1, pt: 1 }}>
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
