import { useCallback, useEffect, useRef } from 'react'
import { Badge, Box, Button, Stack, Typography } from '@mui/material'
import { MailOutlineRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import { listConversations } from '../../services/api.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import CompanionEmpty from '../../components/avatars/CompanionEmpty.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'
import ConversationRow, { ConversationRowSkeleton } from '../../components/chat/ConversationRow.jsx'
import { radius } from '../../design/tokens.js'
import '../../styles/companions.css'

const LIST_SX = { borderRadius: `${radius.lg}px`, border: '1px solid', borderColor: 'brand.border', bgcolor: 'background.paper', p: 0.75 }

// Sohbet listesi: son mesaj önizlemesi ve okunmamış sayısı backend'in liste
// yanıtında gelir. Canlı mesajlar listeyi yerinde günceller.
export default function Conversations() {
  const { token, user } = useAuth()
  const { showError } = useNotification()
  const { pendingRequestCount, subscribeToMessages } = useMessaging()
  const navigate = useNavigate()

  const fetcher = useCallback((page) => listConversations(token, { page }), [token])
  const {
    items: conversations, setItems: setConversations, loading, loadingMore, last, loadMore, reload
  } = usePaginatedList(fetcher, {
    enabled: !!token,
    deps: [token],
    onError: err => showError(err.message || 'Sohbetler alınamadı.')
  })
  const conversationsRef = useRef(conversations)
  useEffect(() => { conversationsRef.current = conversations }, [conversations])

  // Canlı mesaj: konuşma listede varsa önizlemesini tazeleyip en üste taşı,
  // yoksa (yeni konuşma) listeyi yeniden çek.
  useEffect(() => subscribeToMessages((message) => {
    // Yan etki (reload) state updater'ın içinde olmamalı: karar ref üzerinden.
    const exists = conversationsRef.current.some(c => c.id === message.conversationId)
    if (!exists) { reload(); return }
    const fromMe = user && String(message.senderId) === String(user.id)
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === message.conversationId)
      if (idx === -1) return prev
      const updated = {
        ...prev[idx],
        lastMessagePreview: message.content,
        lastMessageHasAttachment: Boolean(message.attachmentUrl),
        lastMessageHasSharedPost: Boolean(message.sharedPost),
        lastMessageAt: message.createdAt,
        // Kendi gönderdiğim mesaj (ör. başka sekmeden) okunmamış sayılmaz.
        unreadCount: fromMe ? prev[idx].unreadCount : (prev[idx].unreadCount || 0) + 1,
      }
      return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }), [subscribeToMessages, reload, setConversations, user])

  return (
    <Box className="page-transition" sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 1.5, md: 4 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5, px: 0.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h2" component="h1">Mesajlar</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Birebir, sakin sohbetler. Kimse sana izinsiz yazamaz.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={
            <Badge badgeContent={pendingRequestCount} color="error" max={99}>
              <MailOutlineRounded />
            </Badge>
          }
          onClick={() => navigate('/messages/requests')}
          sx={{ flexShrink: 0, bgcolor: 'background.paper' }}
        >
          İstekler
        </Button>
      </Stack>

      {loading ? (
        <Box sx={LIST_SX} aria-busy="true" aria-label="Sohbetler yükleniyor">
          {[0, 1, 2, 3].map(i => <ConversationRowSkeleton key={i} />)}
        </Box>
      ) : conversations.length === 0 ? (
        <CompanionEmpty
          companion="serce"
          title="Henüz bir sohbetin yok"
          description="Birinin paylaşımı sana iyi geldiyse profiline gidip mesaj isteği gönderebilirsin. Kabul ederse sohbetiniz burada başlar."
          actionLabel="Akışa göz at"
          onAction={() => navigate('/home')}
        />
      ) : (
        <Stack component="ul" spacing={0.25} className="sg-stagger" sx={{ ...LIST_SX, listStyle: 'none', m: 0 }}>
          {conversations.map(c => (
            <li key={c.id}>
              <ConversationRow conversation={c} onOpen={() => navigate(`/messages/${c.id}`)} />
            </li>
          ))}
        </Stack>
      )}

      {!loading && !last && <LoadMoreButton loading={loadingMore} onClick={loadMore} />}
    </Box>
  )
}
