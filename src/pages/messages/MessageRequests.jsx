import { useCallback, useEffect, useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, Divider, IconButton, Stack, Tab, Tabs, Typography
} from '@mui/material'
import { ArrowBackRounded, MailOutlineRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import {
  listMessageRequests, acceptMessageRequest, rejectMessageRequest,
  listSentMessageRequests, cancelMessageRequest
} from '../../services/api.js'
import { initialsFrom } from '../../utils/format.js'

// Faz 2 adım 6: bekleyen (PENDING) mesaj istekleri - "Gelen" sekmesi kabul/red,
// "Giden" sekmesi kendi gönderdiklerimizi listeleyip iptal etmeyi sağlar.
// Kabul edilince backend bir Conversation oluşturup id'sini döner, biz de
// kullanıcıyı doğrudan o sohbete yönlendiriyoruz (bkz. MessageRequestService.accept).
export default function MessageRequests() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const { decrementPendingCount, subscribeToMessageRequests } = useMessaging()
  const navigate = useNavigate()

  const [tab, setTab] = useState(0) // 0: gelen, 1: giden

  const [incoming, setIncoming] = useState([])
  const [incomingLoading, setIncomingLoading] = useState(true)

  const [outgoing, setOutgoing] = useState([])
  const [outgoingLoading, setOutgoingLoading] = useState(true)
  const [outgoingLoaded, setOutgoingLoaded] = useState(false)

  const [actingId, setActingId] = useState(null)

  const loadIncoming = useCallback(() => {
    if (!token) return
    setIncomingLoading(true)
    listMessageRequests(token, { page: 0 })
      .then(res => setIncoming(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'İstekler alınamadı.'))
      .finally(() => setIncomingLoading(false))
  }, [token, showError])

  const loadOutgoing = useCallback(() => {
    if (!token) return
    setOutgoingLoading(true)
    listSentMessageRequests(token, { page: 0 })
      .then(res => setOutgoing(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'Giden istekler alınamadı.'))
      .finally(() => { setOutgoingLoading(false); setOutgoingLoaded(true) })
  }, [token, showError])

  useEffect(() => { loadIncoming() }, [loadIncoming])

  // Giden sekmesi ilk açıldığında yükle - baştan iki isteği birden atmıyoruz.
  useEffect(() => {
    if (tab === 1 && !outgoingLoaded) loadOutgoing()
  }, [tab, outgoingLoaded, loadOutgoing])

  useEffect(() => {
    return subscribeToMessageRequests((req) => {
      setIncoming(prev => (prev.some(r => r.id === req.id) ? prev : [req, ...prev]))
    })
  }, [subscribeToMessageRequests])

  const handleAccept = async (req) => {
    setActingId(req.id)
    try {
      const res = await acceptMessageRequest(token, req.id)
      setIncoming(prev => prev.filter(r => r.id !== req.id))
      decrementPendingCount()
      navigate(`/messages/${res.conversationId}`)
    } catch (err) {
      showError(err.message || 'İstek kabul edilemedi.')
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (req) => {
    setActingId(req.id)
    try {
      await rejectMessageRequest(token, req.id)
      setIncoming(prev => prev.filter(r => r.id !== req.id))
      decrementPendingCount()
      showSuccess('İstek reddedildi.')
    } catch (err) {
      showError(err.message || 'İstek reddedilemedi.')
    } finally {
      setActingId(null)
    }
  }

  const handleCancel = async (req) => {
    const ok = await confirm(
      `${req.recipientName} kişisine gönderdiğin mesaj isteğini geri çekmek istediğine emin misin?`,
      { title: 'İsteği geri çek', confirmLabel: 'Geri Çek' }
    )
    if (!ok) return
    setActingId(req.id)
    try {
      await cancelMessageRequest(token, req.id)
      setOutgoing(prev => prev.filter(r => r.id !== req.id))
      showSuccess('İstek geri çekildi.')
    } catch (err) {
      showError(err.message || 'İstek geri çekilemedi.')
    } finally {
      setActingId(null)
    }
  }

  const loading = tab === 0 ? incomingLoading : outgoingLoading
  const list = tab === 0 ? incoming : outgoing
  const emptyText = tab === 0 ? 'Bekleyen mesaj isteğin yok.' : 'Gönderdiğin bekleyen mesaj isteği yok.'

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, px: { xs: 0.5, md: 0 } }}>
        <IconButton onClick={() => navigate('/messages')} aria-label="Geri" size="small">
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>Mesaj İstekleri</Typography>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="Gelen" />
        <Tab label="Giden" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : list.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MailOutlineRounded sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5, opacity: 0.6 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {emptyText}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Stack divider={<Divider />}>
            {list.map(r => {
              const otherId = tab === 0 ? r.senderId : r.recipientId
              const otherName = tab === 0 ? r.senderName : r.recipientName
              return (
                <Box
                  key={r.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1.25,
                    px: 2,
                    py: 1.5
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar
                      sx={{ width: 44, height: 44, fontWeight: 600, flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/users/${otherId}`)}
                    >
                      {initialsFrom(otherName)}
                    </Avatar>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, minWidth: 0, wordBreak: 'break-word', cursor: 'pointer' }}
                      onClick={() => navigate(`/users/${otherId}`)}
                    >
                      {otherName}
                    </Typography>
                  </Stack>
                  {tab === 0 ? (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
                      <Button
                        size="small" variant="outlined" color="inherit"
                        disabled={actingId === r.id}
                        onClick={() => handleReject(r)}
                      >
                        Reddet
                      </Button>
                      <Button
                        size="small" variant="contained"
                        disabled={actingId === r.id}
                        onClick={() => handleAccept(r)}
                      >
                        {actingId === r.id ? <CircularProgress size={16} color="inherit" /> : 'Kabul Et'}
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      size="small" variant="outlined" color="error"
                      disabled={actingId === r.id}
                      onClick={() => handleCancel(r)}
                      sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                    >
                      {actingId === r.id ? <CircularProgress size={16} color="inherit" /> : 'Geri Çek'}
                    </Button>
                  )}
                </Box>
              )
            })}
          </Stack>
        </Box>
      )}
    </Box>
  )
}
