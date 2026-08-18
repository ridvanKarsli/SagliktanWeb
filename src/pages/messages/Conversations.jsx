import { useCallback, useEffect } from 'react'
import { Avatar, Badge, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, MailOutlineRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import { listConversations } from '../../services/api.js'
import { initialsFrom } from '../../utils/format.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import EmptyState from '../../components/EmptyState.jsx'

function formatWhen(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}

// Faz 2 adım 6: sohbet listesi - konuşma listCard'ı, backend'in tek
// sayfada döndürdüğü lastMessagePreview/unreadCount'u (bkz.
// MessageController.listConversations toplu çekim) doğrudan gösteriyor,
// ayrıca sorgu atmıyor.
export default function Conversations() {
  const { token } = useAuth()
  const { showError } = useNotification()
  const { pendingRequestCount, subscribeToMessages } = useMessaging()
  const navigate = useNavigate()

  const conversationsFetcher = useCallback((page) => listConversations(token, { page }), [token])
  const {
    items: conversations, setItems: setConversations, loading, loadingMore, last, loadMore, reload: load
  } = usePaginatedList(conversationsFetcher, {
    enabled: !!token,
    deps: [token],
    onError: err => showError(err.message || 'Sohbetler alınamadı.')
  })

  // Canlı mesaj geldiğinde tüm listeyi yeniden çekmek yerine (gereksiz ağ
  // trafiği) yerinde güncelliyoruz - konuşma listede zaten varsa önizlemesini
  // tazeleyip en üste taşıyoruz, yoksa (ilk mesaj/yeni konuşma) tam yenileme
  // yapıyoruz.
  useEffect(() => {
    return subscribeToMessages((message) => {
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === message.conversationId)
        if (idx === -1) {
          load()
          return prev
        }
        const updated = {
          ...prev[idx],
          lastMessagePreview: message.content,
          lastMessageHasAttachment: Boolean(message.attachmentUrl),
          lastMessageHasSharedPost: Boolean(message.sharedPost),
          lastMessageAt: message.createdAt,
          unreadCount: (prev[idx].unreadCount || 0) + 1,
        }
        const next = [...prev]
        next.splice(idx, 1)
        return [updated, ...next]
      })
    })
  }, [subscribeToMessages, load, setConversations])

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>Mesajlar</Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={
            <Badge badgeContent={pendingRequestCount} color="error" max={99}>
              <MailOutlineRounded />
            </Badge>
          }
          onClick={() => navigate('/messages/requests')}
          sx={{ minHeight: 40 }}
        >
          İstekler
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={ChatBubbleOutlineRounded}
          title="Henüz bir sohbetin yok"
          description="Bir profilden mesaj isteği göndererek başlayabilirsin."
        />
      ) : (
        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Stack divider={<Divider />}>
            {conversations.map(c => (
              <Box
                key={c.id}
                onClick={() => navigate(`/messages/${c.id}`)}
                className="tap-scale"
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer',
                  bgcolor: c.unreadCount > 0 ? 'action.hover' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Avatar sx={{ width: 48, height: 48, fontWeight: 600, flexShrink: 0 }}>
                  {initialsFrom(c.otherUserName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: c.unreadCount > 0 ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {c.otherUserName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, ml: 1 }}>
                      {formatWhen(c.lastMessageAt)}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color: c.unreadCount > 0 ? 'text.primary' : 'text.secondary',
                      fontWeight: c.unreadCount > 0 ? 600 : 400,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}
                  >
                    {c.lastMessagePreview
                      || (c.lastMessageHasAttachment ? '📷 Fotoğraf'
                        : c.lastMessageHasSharedPost ? '🔗 Gönderi paylaştı'
                          : 'Sohbete başla')}
                  </Typography>
                </Box>
                {c.unreadCount > 0 && (
                  <Badge badgeContent={c.unreadCount} color="error" max={99} sx={{ flexShrink: 0, mr: 0.5 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {!loading && !last && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Button variant="outlined" onClick={loadMore} disabled={loadingMore} sx={{ minWidth: 180, minHeight: 44 }}>
            {loadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
          </Button>
        </Box>
      )}
    </Box>
  )
}
