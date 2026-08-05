import { useEffect, useRef, useState } from 'react'
import {
  Avatar, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, IconButton, ListItemText, Menu, MenuItem, Stack, TextField, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ArrowBackRounded, BlockRounded, FlagOutlined, ImageOutlined, LockOpenRounded, MoreVertRounded, SendRounded
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import { compressImage } from '../../utils/compressImage.js'
import {
  getConversation, listConversationMessages, sendChatMessage, markConversationRead,
  requestPresignedUpload, uploadToPresignedUrl, blockUser, unblockUser, listBlockedUsers, reportMessage
} from '../../services/api.js'
import { initialsFrom } from '../../utils/format.js'

// Faz 2 adım 6: tek bir konuşmanın mesaj akışı. Backend sayfaları en yeni
// mesaj önce (DESC) döndürüyor - bu bileşen kronolojik (eski üstte, yeni
// altta) göstermek için ters çeviriyor; "daha eski mesajları yükle" en
// üstte, aşağı kaydırma otomatik en alta.
export default function Chat() {
  const { conversationId } = useParams()
  const { token, user: currentUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const { subscribeToMessages, refreshUnreadCount } = useMessaging()
  const navigate = useNavigate()
  const theme = useTheme()
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'))

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([]) // kronolojik sırada (eski -> yeni)
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMoreOlder, setHasMoreOlder] = useState(false)

  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState(null) // { status, previewUrl, storageKey }
  const [sending, setSending] = useState(false)

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [reportTarget, setReportTarget] = useState(null) // message id
  const [reportReason, setReportReason] = useState('')
  const [isBlocked, setIsBlocked] = useState(false) // ben onu engelledim
  const [blockedByOther, setBlockedByOther] = useState(false) // o beni engellemiş

  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const listBoxRef = useRef(null)

  useEffect(() => {
    if (!token || !conversationId) return
    let mounted = true
    setLoading(true)
    Promise.all([
      getConversation(token, conversationId),
      listConversationMessages(token, conversationId, { page: 0 }),
      // Engellenmişse "Kullanıcıyı Engelle" menüsü yanlışlıkla hep aynı
      // etiketle görünüyordu - burada gerçek durumu öğrenip menüyü/yazma
      // alanını ona göre gösteriyoruz. Ayrı bir çağrı başarısız olursa sohbet
      // açılışını bozmasın diye [] ile yutuluyor.
      listBlockedUsers(token).catch(() => []),
    ])
      .then(([conv, msgPage, blocked]) => {
        if (!mounted) return
        setConversation(conv)
        setMessages([...(msgPage?.content || [])].reverse())
        setHasMoreOlder(!(msgPage?.last ?? true))
        setPage(0)
        const iBlockedThem = Array.isArray(blocked) && blocked.some(b => b.userId === conv.otherUserId)
        setIsBlocked(iBlockedThem)
        // canMessage=false ve ben engellememişsem, engelleyen karşı taraf
        // olmalı - backend hangi yönde olduğunu ayrıca söylemiyor (bkz.
        // BlockService.isBlockedEitherDirection), bu ikisini birleştirerek
        // çıkarıyoruz.
        setBlockedByOther(conv.canMessage === false && !iBlockedThem)
        // İkincil işlem: "okundu" işaretleme başarısız olsa bile sohbet
        // zaten açıldı - nav rozeti bir sonraki refreshUnreadCount'ta
        // kendiliğinden düzelir, kullanıcıyı toast'la rahatsız etmeye değmez.
        markConversationRead(token, conversationId).then(refreshUnreadCount).catch(() => {})
      })
      .catch(err => {
        showError(err.message || 'Sohbet açılamadı.')
        navigate('/messages')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [token, conversationId, showError, navigate, refreshUnreadCount])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, loading])

  // Bu sohbet açıkken gelen canlı mesajı listeye ekle ve hemen okundu
  // işaretle - kullanıcı zaten mesajı görüyor.
  useEffect(() => {
    return subscribeToMessages((message) => {
      if (String(message.conversationId) !== String(conversationId)) return
      setMessages(prev => (prev.some(m => m.id === message.id) ? prev : [...prev, message]))
      // Yukarıdaki ile aynı gerekçe: ikincil işlem, sessizce başarısız olabilir.
      markConversationRead(token, conversationId).then(refreshUnreadCount).catch(() => {})
    })
  }, [subscribeToMessages, conversationId, token, refreshUnreadCount])

  const loadOlder = async () => {
    const nextPage = page + 1
    setLoadingOlder(true)
    const box = listBoxRef.current
    const prevHeight = box?.scrollHeight || 0
    try {
      const res = await listConversationMessages(token, conversationId, { page: nextPage })
      setMessages(prev => [...[...(res?.content || [])].reverse(), ...prev])
      setHasMoreOlder(!(res?.last ?? true))
      setPage(nextPage)
      // Eski mesajlar üste eklenince scroll pozisyonu zıplamasın diye,
      // eklenen içerik kadar scrollTop'u telafi ediyoruz.
      requestAnimationFrame(() => {
        if (box) box.scrollTop = box.scrollHeight - prevHeight
      })
    } catch (err) {
      showError(err.message || 'Eski mesajlar yüklenemedi.')
    } finally {
      setLoadingOlder(false)
    }
  }

  const handleAttachFile = async (file) => {
    if (!file) return
    setAttachment({ status: 'compressing', previewUrl: null, storageKey: null })
    try {
      const compressed = await compressImage(file)
      const previewUrl = URL.createObjectURL(compressed)
      setAttachment({ status: 'uploading', previewUrl, storageKey: null })
      const presigned = await requestPresignedUpload(token, compressed.type)
      await uploadToPresignedUrl(presigned.uploadUrl, compressed, compressed.type)
      setAttachment({ status: 'done', previewUrl, storageKey: presigned.storageKey })
    } catch (err) {
      showError(err.message || 'Fotoğraf yüklenemedi.')
      setAttachment(null)
    }
  }

  const removeAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl)
    setAttachment(null)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const content = draft.trim()
    const hasAttachment = attachment?.status === 'done'
    if (!content && !hasAttachment) return
    if (attachment && attachment.status !== 'done') return // yükleme sürüyor

    setSending(true)
    try {
      const message = await sendChatMessage(token, conversationId, {
        content: content || null,
        attachmentKey: hasAttachment ? attachment.storageKey : null,
      })
      setMessages(prev => [...prev, message])
      setDraft('')
      removeAttachment()
    } catch (err) {
      showError(err.message || 'Mesaj gönderilemedi.')
    } finally {
      setSending(false)
    }
  }

  const handleBlock = async () => {
    setMenuAnchor(null)
    if (!conversation) return
    const ok = await confirm(
      `${conversation.otherUserName} kişisini engellemek istediğine emin misin? Artık birbirinize mesaj gönderemezsiniz.`,
      { title: 'Kullanıcıyı engelle', confirmLabel: 'Engelle' }
    )
    if (!ok) return
    try {
      await blockUser(token, conversation.otherUserId)
      setIsBlocked(true)
      showSuccess('Kullanıcı engellendi.')
    } catch (err) {
      showError(err.message || 'Engellenemedi.')
    }
  }

  const handleUnblock = async () => {
    setMenuAnchor(null)
    if (!conversation) return
    try {
      await unblockUser(token, conversation.otherUserId)
      setIsBlocked(false)
      showSuccess('Engel kaldırıldı.')
    } catch (err) {
      showError(err.message || 'Engel kaldırılamadı.')
    }
  }

  const submitReport = async () => {
    try {
      await reportMessage(token, reportTarget, reportReason.trim() || null)
      showSuccess('Şikayetiniz alındı, teşekkür ederiz.')
    } catch (err) {
      showError(err.message || 'Şikayet gönderilemedi.')
    } finally {
      setReportTarget(null)
      setReportReason('')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    // dvh (dynamic viewport height) - klasik vh mobilde klavye açıldığında
    // güncellenmiyor, bu da mesaj yazma alanının klavyenin arkasında kalıp
    // görünmez olmasına yol açıyordu. dvh, klavye/adres çubuğu gibi dinamik
    // viewport değişikliklerini otomatik yansıtır (bkz. kontrol listesi
    // "klavye açıldığında input alanının kaybolmaması" maddesi).
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', display: 'flex', flexDirection: 'column', height: { xs: 'calc(100dvh - 128px)', md: 'calc(100dvh - 32px)' } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.5, px: { xs: 0.5, md: 0 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={() => navigate('/messages')} aria-label="Geri" size="small">
          <ArrowBackRounded />
        </IconButton>
        <Avatar
          sx={{ width: 36, height: 36, fontWeight: 600, cursor: 'pointer' }}
          onClick={() => conversation && navigate(`/users/${conversation.otherUserId}`)}
        >
          {initialsFrom(conversation?.otherUserName)}
        </Avatar>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, flex: 1, cursor: 'pointer' }}
          onClick={() => conversation && navigate(`/users/${conversation.otherUserId}`)}
        >
          {conversation?.otherUserName}
        </Typography>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Seçenekler" size="small">
          <MoreVertRounded />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          {isBlocked ? (
            <MenuItem onClick={handleUnblock}>
              <LockOpenRounded fontSize="small" sx={{ mr: 1.5 }} />
              <ListItemText primary="Engeli Kaldır" />
            </MenuItem>
          ) : (
            <MenuItem onClick={handleBlock} sx={{ color: 'error.main' }}>
              <BlockRounded fontSize="small" sx={{ mr: 1.5 }} />
              <ListItemText primary="Kullanıcıyı Engelle" />
            </MenuItem>
          )}
        </Menu>
      </Stack>

      {/* Mesaj akışı */}
      <Box ref={listBoxRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 0.5, md: 0 }, py: 2 }}>
        {hasMoreOlder && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button size="small" onClick={loadOlder} disabled={loadingOlder}>
              {loadingOlder ? <CircularProgress size={16} /> : 'Daha eski mesajları yükle'}
            </Button>
          </Box>
        )}
        <Stack spacing={1}>
          {messages.map(m => {
            const mine = String(m.senderId) === String(currentUser?.id)
            return (
              <Box key={m.id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <Box
                  onContextMenu={(e) => { if (!mine) { e.preventDefault(); setReportTarget(m.id) } }}
                  sx={{
                    maxWidth: '75%',
                    bgcolor: mine ? 'primary.main' : 'action.hover',
                    color: mine ? '#fff' : 'text.primary',
                    borderRadius: 3,
                    borderBottomRightRadius: mine ? 4 : 3,
                    borderBottomLeftRadius: mine ? 3 : 4,
                    px: 1.75, py: 1,
                    position: 'relative',
                    '&:hover .report-message-btn': { opacity: 1 }
                  }}
                >
                  {/* Faz 2 adım 7: mesajla paylaşılan gönderi önizlemesi -
                      backend post silinmişse sharedPost'u null döner (bkz.
                      ChatMessageResponse), o durumda kısa bir "silinmiş"
                      notu gösteriyoruz. */}
                  {m.sharedPost ? (
                    <Box
                      onClick={() => navigate(`/post/${m.sharedPost.id}`)}
                      sx={{
                        display: 'flex', gap: 1, alignItems: 'center', cursor: 'pointer',
                        borderRadius: 2, overflow: 'hidden', maxWidth: 260,
                        mb: (m.content || m.attachmentUrl) ? 0.75 : 0,
                        bgcolor: mine ? 'rgba(255,255,255,0.14)' : 'background.paper',
                        border: '1px solid', borderColor: mine ? 'rgba(255,255,255,0.26)' : 'divider',
                        p: 1
                      }}
                    >
                      {m.sharedPost.thumbnailUrl && (
                        <Box
                          component="img"
                          src={m.sharedPost.thumbnailUrl}
                          alt=""
                          loading="lazy"
                          sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
                        />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }} noWrap>
                          {m.sharedPost.title}
                        </Typography>
                        {m.sharedPost.contentSnippet && (
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.85, display: '-webkit-box', WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}
                          >
                            {m.sharedPost.contentSnippet}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (!m.content && !m.attachmentUrl && (
                    <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                      Paylaşılan gönderi silinmiş
                    </Typography>
                  ))}
                  {m.attachmentUrl && (
                    <Box
                      component="img"
                      src={m.attachmentUrl}
                      alt=""
                      loading="lazy"
                      sx={{ maxWidth: '100%', borderRadius: 2, display: 'block', mb: m.content ? 0.75 : 0, cursor: 'pointer' }}
                      onClick={() => window.open(m.attachmentUrl, '_blank')}
                    />
                  )}
                  {m.content && (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {m.content}
                    </Typography>
                  )}
                  {!mine && (
                    <IconButton
                      size="small"
                      onClick={() => setReportTarget(m.id)}
                      aria-label="Mesajı şikayet et"
                      className="report-message-btn"
                      sx={{
                        position: 'absolute', top: -10, right: -10,
                        width: { xs: 30, sm: 24 }, height: { xs: 30, sm: 24 },
                        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                        // Hover, dokunmatik cihazlarda tetiklenmiyor - "hover'da
                        // görün" davranışı masaüstünde temiz dursun diye
                        // korunuyor, ama mobilde buton hiç görünmez/erişilemez
                        // hale gelmesin diye orada her zaman görünür tutuluyor.
                        opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.15s'
                      }}
                    >
                      <FlagOutlined sx={{ fontSize: { xs: 16, sm: 13 } }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            )
          })}
        </Stack>
        <div ref={bottomRef} />
      </Box>

      {/* Mesaj yazma alanı - herhangi bir yönde engel varken form yerine
          bilgi gösterilir, aksi halde kullanıcı yazıp gönderince 403 ile
          karşılaşırdı. İki durum ayrı metinle anlatılıyor: kendi engelini
          kaldırabilir ama karşı tarafın engelini kaldıramaz. */}
      {isBlocked ? (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: { xs: 0.5, md: 0 }, py: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Bu kullanıcıyı engelledin, mesajlaşamazsınız.
          </Typography>
          <Button size="small" variant="outlined" onClick={handleUnblock}>Engeli Kaldır</Button>
        </Box>
      ) : blockedByOther ? (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: { xs: 0.5, md: 0 }, py: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bu kişiye mesaj gönderemezsin.
          </Typography>
        </Box>
      ) : (
      <Box component="form" onSubmit={handleSend} sx={{ borderTop: '1px solid', borderColor: 'divider', px: { xs: 0.5, md: 0 }, py: 1.5 }}>
        {attachment && (
          <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: 2, overflow: 'hidden', mb: 1, bgcolor: 'action.hover' }}>
            {attachment.previewUrl && (
              <Box component="img" src={attachment.previewUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: attachment.status === 'done' ? 1 : 0.5 }} />
            )}
            {attachment.status !== 'done' && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <CircularProgress size={18} />
              </Box>
            )}
            <IconButton
              size="small" onClick={removeAttachment}
              aria-label="Eki kaldır"
              sx={{
                position: 'absolute', top: 2, right: 2,
                width: { xs: 26, sm: 18 }, height: { xs: 26, sm: 18 },
                fontSize: { xs: '1.05rem', sm: '0.875rem' },
                bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
              }}
            >
              ×
            </IconButton>
          </Box>
        )}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <input
            ref={fileInputRef} type="file" accept="image/*" hidden
            onChange={(e) => { handleAttachFile(e.target.files?.[0]); e.target.value = '' }}
          />
          <IconButton onClick={() => fileInputRef.current?.click()} disabled={sending} aria-label="Fotoğraf ekle">
            <ImageOutlined />
          </IconButton>
          <TextField
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Mesaj yaz..."
            fullWidth
            multiline
            maxRows={4}
            size="small"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={sending || (!draft.trim() && attachment?.status !== 'done')}
            aria-label="Gönder"
          >
            {sending ? <CircularProgress size={20} /> : <SendRounded />}
          </IconButton>
        </Stack>
      </Box>
      )}

      {/* Mesaj şikayet dialogu */}
      <Dialog open={Boolean(reportTarget)} onClose={() => setReportTarget(null)} maxWidth="xs" fullWidth fullScreen={fullScreenDialog}>
        <DialogTitle>Mesajı Şikayet Et</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1.5 }}>
            Bu mesajı neden şikayet ediyorsun? (isteğe bağlı)
          </DialogContentText>
          <TextField
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Açıklama..."
            fullWidth multiline minRows={2} size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReportTarget(null)}>Vazgeç</Button>
          <Button variant="contained" color="error" onClick={submitReport}>Şikayet Et</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
