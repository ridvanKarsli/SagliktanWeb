import { useState, useRef, useEffect } from 'react'
import { Box, Button, Stack, TextField, Typography, Avatar, CircularProgress, IconButton } from '@mui/material'
import { SendRounded } from '@mui/icons-material'
import { delay } from '../utils/fakeApi.js'
import { mockAiAnswer } from '../data/fakeData.js'
import { useAuth } from '../context/AuthContext.jsx'
import SagliktaAiControllerApi from '../services/generated/src/api/SagliktaAiControllerApi'

export default function AIChat() {
  const { token } = useAuth()
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Ben Lumo, Sağlıktan\'ın sağlık asistanıyım. 👋\n\nSize nasıl yardımcı olabilirim?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    <Box sx={{ 
      py: { xs: 0, md: 2 }, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      maxHeight: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 40px)' }
    }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: { xs: 2, md: 3 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box
          component="img"
          src="/Lumo.png"
          alt="Lumo"
          sx={{ 
            width: { xs: 48, md: 64 }, 
            height: { xs: 48, md: 64 }, 
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(52,195,161,0.25))',
            flexShrink: 0
          }}
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Lumo
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sağlık Asistanınız
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((m, i) => {
          const isUser = m.role === 'user'
          return (
            <Stack
              key={i}
              direction={isUser ? 'row-reverse' : 'row'}
              spacing={1.5}
              alignItems="flex-start"
              sx={{ maxWidth: '100%' }}
            >
              {isUser ? (
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: { xs: 36, md: 40 }, 
                    height: { xs: 36, md: 40 },
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  S
                </Avatar>
              ) : (
                <Box
                  component="img"
                  src="/Lumo.png"
                  alt="Lumo"
                  sx={{
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                    objectFit: 'contain',
                    flexShrink: 0
                  }}
                />
              )}
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  maxWidth: { xs: '85%', md: '75%' },
                  borderRadius: 3,
                  bgcolor: isUser ? 'primary.main' : 'rgba(11, 58, 78, 0.04)',
                  color: isUser ? 'white' : 'text.primary',
                  wordBreak: 'break-word',
                  boxShadow: isUser ? '0 2px 8px rgba(11, 58, 78, 0.15)' : 'none'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.7, 
                    whiteSpace: 'pre-wrap',
                    fontSize: { xs: '0.9375rem', md: '1rem' }
                  }}
                >
                  {m.text}
                </Typography>
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
                width: { xs: 36, md: 44 },
                height: { xs: 36, md: 44 },
                objectFit: 'contain',
                flexShrink: 0,
                opacity: 0.7
              }}
            />
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 3,
                bgcolor: 'rgba(11, 58, 78, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CircularProgress size={16} sx={{ color: 'secondary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Lumo düşünüyor...
              </Typography>
            </Box>
          </Stack>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box 
        component="form" 
        onSubmit={send} 
        sx={{ 
          p: { xs: 2, md: 3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
          <TextField
            fullWidth
            placeholder="Lumo'ya bir şey sorun..."
            value={input}
            onChange={e => setInput(e.target.value)}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.default'
              }
            }}
          />
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading || !input.trim()}
            sx={{
              minWidth: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: 3,
              p: 0
            }}
          >
            <SendRounded />
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
