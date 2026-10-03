import { useEffect, useState } from 'react'
import {
  Box, Button, Skeleton, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Stack, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CheckCircleRounded, CloseRounded, SendRounded } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import UserAvatar from './avatars/UserAvatar.jsx'
import SlideUp from './shell/SlideUp.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { listConversations, sendChatMessage } from '../services/api.js'

// Bir gönderiyi mevcut sohbetlerden birine mesaj olarak gönderme. Yalnızca
// zaten kabul edilmiş konuşmalar listelenir; canMessage=false olanlar (bir
// yönde engel varsa) gönderilemez şekilde soluk gösterilir - backend zaten
// 403 dönerdi, kullanıcı boşuna denemesin.
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
  const [loadFailed, setLoadFailed] = useState(false)
  const [sendingId, setSendingId] = useState(null)
  const [sentIds, setSentIds] = useState(new Set())

  useEffect(() => {
    if (!open || !token) return
    let mounted = true
    setLoading(true)
    setLoadFailed(false)
    setSentIds(new Set())
    listConversations(token, { page: 0 })
      .then(res => { if (mounted) setConversations(Array.isArray(res?.content) ? res.content : []) })
      .catch(err => {
        if (!mounted) return
        setLoadFailed(true)
        showError(err.message || 'Sohbetler alınamadı.')
      })
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
      slots={fullScreen ? { transition: SlideUp } : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: fullScreen ? 'calc(env(safe-area-inset-top) + 16px)' : 2 }}>
        Mesajla gönder
        <IconButton onClick={onClose} aria-label="Kapat" sx={{ width: 44, height: 44, mr: -1 }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box role="status" aria-label="Sohbetler yükleniyor">
            {[0, 1, 2].map(i => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25 }} aria-hidden>
                <Skeleton variant="circular" width={44} height={44} />
                <Skeleton variant="text" sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={84} height={36} sx={{ borderRadius: 999 }} />
              </Stack>
            ))}
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, px: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {loadFailed
                ? 'Sohbetlerini şu an getiremedik. Bağlantını kontrol edip yeniden dene.'
                : 'Henüz kimseyle mesajlaşmıyorsun. Bir üyenin profilinden ona mesaj isteği gönderebilirsin.'}
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
                  <UserAvatar avatarKey={c.otherUserAvatarKey} name={c.otherUserName || ''} size={44} sx={{ flexShrink: 0 }} />
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
                    sx={{ minHeight: 40 }}
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
