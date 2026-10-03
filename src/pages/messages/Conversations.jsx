import { useCallback, useEffect, useRef } from 'react'
import { Badge, Box, Button, Divider, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, MailOutlineRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import { listConversations } from '../../services/api.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import EmptyState from '../../components/EmptyState.jsx'
import CenteredSpinner from '../../components/common/CenteredSpinner.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'
import ConversationRow from '../../components/chat/ConversationRow.jsx'

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
        <CenteredSpinner py={6} size={28} />
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
              <ConversationRow key={c.id} conversation={c} onOpen={() => navigate(`/messages/${c.id}`)} />
            ))}
          </Stack>
        </Box>
      )}

      {!loading && !last && <LoadMoreButton loading={loadingMore} onClick={loadMore} />}
    </Box>
  )
}
