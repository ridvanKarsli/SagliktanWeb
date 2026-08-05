import { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material'
import { ArrowBackRounded, MailOutlineRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import { listMessageRequests, acceptMessageRequest, rejectMessageRequest } from '../../services/api.js'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) return ((parts[0][0] || '') + (parts[0][1] || '')).toUpperCase()
  return '?'
}

// Faz 2 adım 6: bekleyen (PENDING) gelen mesaj istekleri - kabul edilince
// backend bir Conversation oluşturup id'sini döner, biz de kullanıcıyı
// doğrudan o sohbete yönlendiriyoruz (bkz. MessageRequestService.accept).
export default function MessageRequests() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const { decrementPendingCount, subscribeToMessageRequests } = useMessaging()
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    listMessageRequests(token, { page: 0 })
      .then(res => setRequests(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'İstekler alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, showError])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    return subscribeToMessageRequests((req) => {
      setRequests(prev => (prev.some(r => r.id === req.id) ? prev : [req, ...prev]))
    })
  }, [subscribeToMessageRequests])

  const handleAccept = async (req) => {
    setActingId(req.id)
    try {
      const res = await acceptMessageRequest(token, req.id)
      setRequests(prev => prev.filter(r => r.id !== req.id))
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
      setRequests(prev => prev.filter(r => r.id !== req.id))
      decrementPendingCount()
      showSuccess('İstek reddedildi.')
    } catch (err) {
      showError(err.message || 'İstek reddedilemedi.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, px: { xs: 0.5, md: 0 } }}>
        <IconButton onClick={() => navigate('/messages')} aria-label="Geri" size="small">
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>Mesaj İstekleri</Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : requests.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MailOutlineRounded sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5, opacity: 0.6 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bekleyen mesaj isteğin yok.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Stack divider={<Divider />}>
            {requests.map(r => (
              <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
                <Avatar
                  sx={{ width: 44, height: 44, fontWeight: 600, flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => navigate(`/users/${r.senderId}`)}
                >
                  {initialsFrom(r.senderName)}
                </Avatar>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, flex: 1, cursor: 'pointer' }}
                  onClick={() => navigate(`/users/${r.senderId}`)}
                >
                  {r.senderName}
                </Typography>
                <Stack direction="row" spacing={1}>
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
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}
