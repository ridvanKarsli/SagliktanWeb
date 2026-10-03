import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { reportMessage } from '../../services/api.js'
import { useChatConversation } from '../../hooks/useChatConversation.js'
import { useChatAttachment } from '../../hooks/useChatAttachment.js'
import { useReportDialog } from '../../hooks/useReportDialog.js'
import ChatHeader from '../../components/chat/ChatHeader.jsx'
import MessageBubble from '../../components/chat/MessageBubble.jsx'
import ChatComposer from '../../components/chat/ChatComposer.jsx'
import ReportDialog from '../../components/comments/ReportDialog.jsx'
import CenteredSpinner from '../../components/common/CenteredSpinner.jsx'

function BlockedNotice({ children, action }) {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: { xs: 0.5, md: 0 }, py: 2, textAlign: 'center' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: action ? 1 : 0 }}>{children}</Typography>
      {action}
    </Box>
  )
}

// Tek bir konuşmanın mesaj akışı: eski mesajlar üstte ("daha eski mesajları
// yükle"), yeni mesaj gelince en alta kaydırılır.
export default function Chat() {
  const { conversationId } = useParams()
  const { token, user: currentUser } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()

  const chat = useChatConversation(conversationId)
  const { attachment, attach, clear: clearAttachment } = useChatAttachment(token)
  const report = useReportDialog((messageId, reason) => reportMessage(token, messageId, reason))
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState(null)

  const listRef = useRef(null)
  const bottomRef = useRef(null)
  // Eski mesajlar üste eklenince görünen yer zıplamasın: eklemeden önceki
  // yüksekliği saklayıp aradaki fark kadar kaydırma telafi edilir.
  const prependAnchorRef = useRef(null)

  // Yalnızca listenin SONUNA mesaj eklendiğinde (ilk yükleme, gönderilen ya
  // da gelen mesaj) en alta kaydır; eski mesaj yüklemek kaydırmayı bozmasın.
  const lastMessageId = chat.messages.length ? chat.messages[chat.messages.length - 1].id : null
  useEffect(() => {
    if (!chat.loading) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lastMessageId, chat.loading])

  useLayoutEffect(() => {
    const box = listRef.current
    const previousHeight = prependAnchorRef.current
    if (box && previousHeight != null) {
      box.scrollTop = box.scrollHeight - previousHeight
      prependAnchorRef.current = null
    }
  }, [chat.messages.length])

  const loadOlder = () => {
    prependAnchorRef.current = listRef.current?.scrollHeight ?? null
    chat.loadOlder().then(ok => { if (!ok) prependAnchorRef.current = null })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    // Enter tuşu düğmenin disabled durumunu atlar: çift gönderimi burada engelle.
    if (sending) return
    const content = draft.trim()
    const attachmentReady = attachment?.status === 'done'
    if (attachment && !attachmentReady) return // yükleme sürüyor
    if (!content && !attachmentReady) return

    setSending(true)
    try {
      await chat.send({ content: content || null, attachmentKey: attachmentReady ? attachment.storageKey : null })
      setDraft('')
      clearAttachment()
    } catch (err) {
      showError(err.message || 'Mesaj gönderilemedi.')
    } finally {
      setSending(false)
    }
  }

  if (chat.loading) return <CenteredSpinner page />

  const { conversation } = chat
  const openProfile = () => { if (conversation) navigate(`/users/${conversation.otherUserId}`) }

  return (
    // dvh: klasik vh mobilde klavye açılınca güncellenmez ve yazma alanı
    // klavyenin arkasında kalırdı.
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', display: 'flex', flexDirection: 'column', height: { xs: 'calc(100dvh - 128px)', md: 'calc(100dvh - 32px)' } }}>
      <ChatHeader
        otherUserName={conversation?.otherUserName}
        onBack={() => navigate('/messages')}
        onOpenProfile={openProfile}
        isBlocked={chat.isBlocked}
        onBlock={chat.block}
        onUnblock={chat.unblock}
      />

      <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 0.5, md: 0 }, py: 2 }}>
        {chat.hasMoreOlder && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button size="small" onClick={loadOlder} disabled={chat.loadingOlder} sx={{ minHeight: 36 }}>
              {chat.loadingOlder ? <CircularProgress size={16} /> : 'Daha eski mesajları yükle'}
            </Button>
          </Box>
        )}
        <Stack spacing={1}>
          {chat.messages.map(m => (
            <MessageBubble
              key={m.id}
              message={m}
              mine={String(m.senderId) === String(currentUser?.id)}
              selected={selectedMessageId === m.id}
              onToggleSelect={() => setSelectedMessageId(id => (id === m.id ? null : m.id))}
              onReport={() => { setSelectedMessageId(null); report.open(m.id) }}
              onOpenPost={(postId) => navigate(`/post/${postId}`)}
            />
          ))}
        </Stack>
        <div ref={bottomRef} />
      </Box>

      {/* Engel varken form yerine bilgi: kendi engelini kaldırabilir, karşı
          tarafınkini kaldıramaz. Aksi halde gönderim 403 ile reddedilirdi. */}
      {chat.isBlocked ? (
        <BlockedNotice action={<Button size="small" variant="outlined" onClick={chat.unblock} sx={{ minHeight: 36 }}>Engeli Kaldır</Button>}>
          Bu kullanıcıyı engelledin, mesajlaşamazsınız.
        </BlockedNotice>
      ) : chat.blockedByOther ? (
        <BlockedNotice>Bu kişiye mesaj gönderemezsin.</BlockedNotice>
      ) : (
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          attachment={attachment}
          onAttach={attach}
          onRemoveAttachment={clearAttachment}
          sending={sending}
          onSubmit={handleSend}
        />
      )}

      <ReportDialog
        {...report.dialogProps}
        title="Mesajı Şikayet Et"
        description="Bu mesajı neden şikayet ediyorsun? (isteğe bağlı)"
        placeholder="Açıklama..."
      />
    </Box>
  )
}
