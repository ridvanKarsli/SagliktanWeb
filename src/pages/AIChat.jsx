import { useState } from 'react'
import { Box, Button, Stack, TextField, Typography, Avatar, CircularProgress } from '@mui/material'
import { delay } from '../utils/fakeApi.js'
import { mockAiAnswer } from '../data/fakeData.js'
import { useAuth } from '../context/AuthContext.jsx'
import SagliktaAiControllerApi from '../services/generated/src/api/SagliktaAiControllerApi'

export default function AIChat() {
  const { token } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Ben Lumo, Sağlıktan\'ın sağlıklı yaşam asistanıyım. Nasıl yardımcı olabilirim? 🌊' }
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
    <Box sx={{ py: { xs: 1.5, md: 3 }, px: { xs: 0.5, sm: 0 } }}>
      <Stack 
        direction="row" 
        spacing={{ xs: 1.5, md: 2 }} 
        alignItems="center" 
        sx={{ 
          mb: { xs: 2.5, md: 4 },
          p: { xs: 1.5, md: 2.5 },
          borderRadius: { xs: 2, md: 3 },
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box
          component="img"
          src="/Lumo.png"
          alt="Lumo"
          sx={{ 
            width: { xs: 64, md: 96 }, 
            height: { xs: 64, md: 96 }, 
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 4px 12px rgba(52,195,161,0.3))',
            flexShrink: 0
          }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '20px', md: '24px' } }}>
            Lumo ile Sohbet
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8, fontSize: { xs: '13px', md: '14px' } }}>
            Sağlıklı yaşam asistanınız
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={{ xs: 1.25, md: 1.5 }} sx={{ minHeight: { xs: 300, md: 360 } }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, md: 0.75 },
          maxHeight: { xs: 'calc(100vh - 280px)', md: 480 },
          overflowY: 'auto',
          pr: { xs: 0.25, md: 0.5 }
        }}>
          {messages.map((m, i) => {
            const isUser = m.role === 'user'
            return (
              <Stack
                key={i}
                direction={isUser ? 'row-reverse' : 'row'}
                spacing={1.5}
                alignItems="flex-start"
              >
                {isUser ? (
                  <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 } }}>
                    U
                  </Avatar>
                ) : (
                  <Box
                    component="img"
                    src="/Lumo.png"
                    alt="Lumo - Sağlıktan Asistanı"
                    sx={{
                      width: { xs: 48, md: 56 },
                      height: { xs: 48, md: 56 },
                      objectFit: 'contain',
                      flexShrink: 0
                    }}
                  />
                )}
                <Box
                  sx={{
                    p: 1.5,
                    maxWidth: { xs: '100%', md: '70%' },
                    borderRadius: 2,
                    backgroundColor: isUser ? 'rgba(52,195,161,0.12)' : 'transparent',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'text.primary', fontSize: { xs: '14px', md: '15px' } }}>{m.text}</Typography>
                </Box>
              </Stack>
            )
          })}
          {loading && (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                component="img"
                src="/Lumo.png"
                alt="Lumo"
                sx={{
                  width: { xs: 48, md: 56 },
                  height: { xs: 48, md: 56 },
                  objectFit: 'contain',
                  flexShrink: 0,
                  opacity: 0.7
                }}
              />
              <Box sx={{ p: 1.5 }}>
                <CircularProgress size={20} sx={{ color: 'text.secondary' }} />
              </Box>
            </Stack>
          )}
        </Box>

        <Box component="form" onSubmit={send} sx={{ display: 'flex', gap: { xs: 0.75, md: 1 }, pt: { xs: 0.75, md: 1 } }}>
          <TextField
            fullWidth
            placeholder="Mesaj yaz…"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="AI mesaj girişi"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' },
                minHeight: { xs: 48, md: 40 }
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={loading}
            sx={{
              minHeight: { xs: 48, md: 40 },
              minWidth: { xs: 80, md: 100 },
              fontSize: { xs: '14px', md: '15px' },
              fontWeight: 600
            }}
          >
            Gönder
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
