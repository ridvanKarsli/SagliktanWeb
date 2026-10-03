import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Skeleton, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { reportMessage } from '../../services/api.js'
import { useChatConversation } from '../../hooks/useChatConversation.js'
import { useChatAttachment } from '../../hooks/useChatAttachment.js'
import { useReportDialog } from '../../hooks/useReportDialog.js'
import { cleanText } from '../../utils/validation.js'
import ChatHeader, { ChatHeaderSkeleton } from '../../components/chat/ChatHeader.jsx'
import MessageBubble from '../../components/chat/MessageBubble.jsx'
import ChatComposer from '../../components/chat/ChatComposer.jsx'
import ReportDialog from '../../components/comments/ReportDialog.jsx'
import Companion from '../../components/avatars/Companion.jsx'
import { radius } from '../../design/tokens.js'
import '../../styles/companions.css'

const PAGE_SX = { width: '100%', maxWidth: 680, mx: 'auto', display: 'flex', flexDirection: 'column', height: { xs: 'calc(100dvh - 128px)', md: 'calc(100dvh - 32px)' } }

// Mesajlar gelene kadar sohbetin taslağı: sırayla iki yana yaslı balonlar.
function ChatSkeleton() {
  const rows = [['l', '62%'], ['l', '40%'], ['r', '55%'], ['l', '70%'], ['r', '35%'], ['r', '60%']]
  return (
    <Box sx={PAGE_SX}>
      <ChatHeaderSkeleton />
      <Box aria-busy="true" aria-label="Mesajlar yükleniyor" sx={{ flex: 1, py: 2, px: { xs: 0.5, md: 0 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1 }}>
        {rows.map(([side, w], i) => (
          <Skeleton key={i} variant="rounded" height={40} sx={{ width: w, maxWidth: 360, alignSelf: side === 'r' ? 'flex-end' : 'flex-start', borderRadius: `${radius.lg}px` }} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={52} sx={{ mb: 1.25, borderRadius: `${radius.lg}px` }} />
    </Box>
  )
}

function BlockedNotice({ children, action }) {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'brand.border', px: { xs: 0.5, md: 0 }, py: 2, textAlign: 'center' }}>
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
  // State güncellemesi bir sonraki render'a kadar görünmez; hızlı çift Enter'da
  // aynı mesaj iki kez gitmesin diye anında okunan bayrak.
  const sendingRef = useRef(false)
  const [selectedMessageId, setSelectedMessageId] = useState(null)

  // İlk yüklemedeki mesajlar sahneye girmez; sonradan gelen/gönderilenler hafifçe süzülür.
  const initialIdsRef = useRef(null)

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
    if (sendingRef.current) return
    const content = cleanText(draft)
    const attachmentReady = attachment?.status === 'done'
    if (attachment && !attachmentReady) return // yükleme sürüyor
    if (!content && !attachmentReady) return

    sendingRef.current = true
    setSending(true)
    try {
      await chat.send({ content: content || null, attachmentKey: attachmentReady ? attachment.storageKey : null })
      setDraft('')
      clearAttachment()
    } catch (err) {
      showError(err.message || 'Mesaj gönderilemedi.')
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  if (chat.loading) {
    initialIdsRef.current = null
    return <ChatSkeleton />
  }
  if (initialIdsRef.current === null) initialIdsRef.current = new Set(chat.messages.map(m => m.id))

  const { conversation } = chat
  const openProfile = () => { if (conversation) navigate(`/users/${conversation.otherUserId}`) }

  return (
    // dvh: klasik vh mobilde klavye açılınca güncellenmez ve yazma alanı
    // klavyenin arkasında kalırdı.
    <Box sx={PAGE_SX}>
      <ChatHeader
        otherUserName={conversation?.otherUserName}
        otherUserAvatarKey={conversation?.otherUserAvatarKey}
        onBack={() => navigate('/messages')}
        onOpenProfile={openProfile}
        isBlocked={chat.isBlocked}
        onBlock={chat.block}
        onUnblock={chat.unblock}
      />

      <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 0.5, md: 0 }, py: 2 }}>
        {chat.hasMoreOlder && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button size="small" onClick={loadOlder} disabled={chat.loadingOlder} sx={{ minHeight: 44 }}>
              {chat.loadingOlder ? <CircularProgress size={16} /> : 'Daha eski mesajları yükle'}
            </Button>
          </Box>
        )}
        {chat.messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Box className="sg-float" sx={{ display: 'inline-block', mb: 1.5 }}><Companion name="serce" size={72} /></Box>
            <Typography variant="h5" component="p">İlk mesajı sen yaz</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 340, mx: 'auto' }}>
              Kısa bir selam yeter. Burada konuştuklarınızı yalnızca ikiniz görürsünüz.
            </Typography>
          </Box>
        )}
        <Box>
          {chat.messages.map((m, i) => {
            const prev = chat.messages[i - 1]
            const next = chat.messages[i + 1]
            const mine = String(m.senderId) === String(currentUser?.id)
            return (
              <MessageBubble
                key={m.id}
                message={m}
                mine={mine}
                first={!prev || String(prev.senderId) !== String(m.senderId)}
                last={!next || String(next.senderId) !== String(m.senderId)}
                animate={!initialIdsRef.current?.has(m.id)}
                selected={selectedMessageId === m.id}
                onToggleSelect={() => setSelectedMessageId(id => (id === m.id ? null : m.id))}
                onReport={() => { setSelectedMessageId(null); report.open(m.id) }}
                onOpenPost={(postId) => navigate(`/post/${postId}`)}
              />
            )
          })}
        </Box>
        <div ref={bottomRef} />
      </Box>

      {/* Engel varken form yerine bilgi: kendi engelini kaldırabilir, karşı
          tarafınkini kaldıramaz. Aksi halde gönderim 403 ile reddedilirdi. */}
      {chat.isBlocked ? (
        <BlockedNotice action={<Button variant="outlined" onClick={chat.unblock}>Engeli Kaldır</Button>}>
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
