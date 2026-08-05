import { useEffect, useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CheckCircleRounded, CloseRounded, SendRounded } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { listConversations, sendChatMessage } from '../services/api.js'
import { initialsFrom } from '../utils/format.js'

// Faz 2 adım 7: bir gönderiyi sohbetlerinden birine mesaj olarak gönderme -
// IG/WhatsApp'taki "Gönder" (Send to...) dialogunun sadeleştirilmiş hali.
// Mesaj isteği/kabul akışına dokunmuyor - sadece zaten kabul edilmiş
// (serbestçe mesajlaşılabilen) konuşmalar listeleniyor. canMessage=false
// olan satırlar (herhangi bir yönde engel varsa, bkz. ConversationResponse)
// gönderilemez şekilde gri gösteriliyor - backend zaten 403 dönerdi, burada
// önceden engelliyoruz ki kullanıcı boşuna denemesin.
export default function SendPostDialog({ open, onClose, post }) {
  const { token } = useAuth()
  const { showError } = useNotification()
  const theme = useTheme()
  // Mobilde küçük bir modal (maxWidth="xs") liste + her satırda buton
  // barındırdığında dar alana sıkışıyordu - tam ekran, konuşma listesini
  // rahat kaydırılabilir ve dokunma hedefleri daha ferah hale getiriyor.
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState(null)
  const [sentIds, setSentIds] = useState(new Set())

  useEffect(() => {
    if (!open || !token) return
    let mounted = true
    setLoading(true)
    setSentIds(new Set())
    listConversations(token, { page: 0 })
      .then(res => { if (mounted) setConversations(Array.isArray(res?.content) ? res.content : []) })
      .catch(err => showError(err.message || 'Sohbetler alınamadı.'))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [open, token, showError])

  const handleSend = async (conversationId) => {
    setSendingId(conversationId)
    try {
      await sendChatMessage(token, conversationId, { sharedPostId: post.id })
      setSentIds(prev => new Set(prev).add(conversationId))
    } catch (err) {
      showError(err.message || 'Gönderilemedi.')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Gönderiyi Gönder
        <IconButton size="small" onClick={onClose} aria-label="Kapat">
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, px: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Henüz kimseyle mesajlaşmıyorsun.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
            {conversations.map(c => {
              const sent = sentIds.has(c.id)
              const disabled = c.canMessage === false
              return (
                <Box
                  key={c.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, opacity: disabled ? 0.5 : 1 }}
                >
                  <Avatar sx={{ width: 40, height: 40, fontWeight: 600, flexShrink: 0 }}>
                    {initialsFrom(c.otherUserName)}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
                    {c.otherUserName}
                  </Typography>
                  <Button
                    size="small"
                    variant={sent ? 'text' : 'outlined'}
                    color={sent ? 'success' : 'primary'}
                    disabled={disabled || sendingId === c.id || sent}
                    startIcon={
                      sent
                        ? <CheckCircleRounded fontSize="small" />
                        : sendingId === c.id
                          ? <CircularProgress size={14} />
                          : <SendRounded fontSize="small" />
                    }
                    onClick={() => handleSend(c.id)}
                  >
                    {sent ? 'Gönderildi' : 'Gönder'}
                  </Button>
                </Box>
              )
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}
