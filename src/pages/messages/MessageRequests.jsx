import { useCallback, useEffect, useState } from 'react'
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material'
import { ArrowBackRounded, MailOutlineRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import {
  listMessageRequests, acceptMessageRequest, rejectMessageRequest, listSentMessageRequests, cancelMessageRequest
} from '../../services/api.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { initialsFrom } from '../../utils/format.js'
import { clickableProps } from '../../utils/clickable.js'
import EmptyState from '../../components/EmptyState.jsx'
import CenteredSpinner from '../../components/common/CenteredSpinner.jsx'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'

const INCOMING = 0
const OUTGOING = 1

function RequestRow({ name, onOpenProfile, children }) {
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1.25, px: 2, py: 1.5
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
        <Avatar
          sx={{ width: 44, height: 44, fontWeight: 600, flexShrink: 0, cursor: 'pointer' }}
          {...clickableProps(onOpenProfile)}
          aria-label={`${name || 'Kullanıcı'} profiline git`}
        >
          {initialsFrom(name)}
        </Avatar>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, minWidth: 0, wordBreak: 'break-word', cursor: 'pointer' }}
          onClick={onOpenProfile}
        >
          {name}
        </Typography>
      </Stack>
      {children}
    </Box>
  )
}

// Bekleyen mesaj istekleri: "Gelen" sekmesinde kabul/red, "Giden" sekmesinde
// kendi gönderdiklerini geri çekme. Kabul edilince sohbete geçilir.
export default function MessageRequests() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const { refreshPendingCount, subscribeToMessageRequests } = useMessaging()
  const navigate = useNavigate()
  const [tab, setTab] = useState(INCOMING)
  const [actingId, setActingId] = useState(null)

  const incomingFetcher = useCallback((page) => listMessageRequests(token, { page }), [token])
  const incoming = usePaginatedList(incomingFetcher, {
    enabled: !!token,
    deps: [token],
    onError: err => showError(err.message || 'İstekler alınamadı.')
  })

  // Giden sekmesi ilk açıldığında yüklenir - baştan iki istek atılmaz.
  const outgoingFetcher = useCallback((page) => listSentMessageRequests(token, { page }), [token])
  const outgoing = usePaginatedList(outgoingFetcher, {
    enabled: !!token && tab === OUTGOING,
    once: true,
    deps: [token],
    onError: err => showError(err.message || 'Giden istekler alınamadı.')
  })

  const { setItems: setIncoming } = incoming
  useEffect(() => subscribeToMessageRequests((req) => {
    setIncoming(prev => (prev.some(r => r.id === req.id) ? prev : [req, ...prev]))
  }), [subscribeToMessageRequests, setIncoming])

  const act = async (req, action, { onSuccess, errorMessage }) => {
    setActingId(req.id)
    try {
      const res = await action()
      onSuccess(res)
    } catch (err) {
      showError(err.message || errorMessage)
    } finally {
      setActingId(null)
    }
  }

  const removeIncoming = (id) => {
    incoming.setItems(prev => prev.filter(r => r.id !== id))
    // Nav rozetini sunucudan tazele: yerel +1/-1 kolayca senkron dışı kalıyor.
    refreshPendingCount()
  }

  const handleAccept = (req) => act(req, () => acceptMessageRequest(token, req.id), {
    errorMessage: 'İstek kabul edilemedi.',
    onSuccess: (res) => { removeIncoming(req.id); navigate(`/messages/${res.conversationId}`) }
  })

  const handleReject = (req) => act(req, () => rejectMessageRequest(token, req.id), {
    errorMessage: 'İstek reddedilemedi.',
    onSuccess: () => { removeIncoming(req.id); showSuccess('İstek reddedildi.') }
  })

  const handleCancel = async (req) => {
    const ok = await confirm(
      `${req.recipientName} kişisine gönderdiğin mesaj isteğini geri çekmek istediğine emin misin?`,
      { title: 'İsteği geri çek', confirmLabel: 'Geri Çek' }
    )
    if (!ok) return
    act(req, () => cancelMessageRequest(token, req.id), {
      errorMessage: 'İstek geri çekilemedi.',
      onSuccess: () => { outgoing.setItems(prev => prev.filter(r => r.id !== req.id)); showSuccess('İstek geri çekildi.') }
    })
  }

  const list = tab === INCOMING ? incoming : outgoing
  const emptyText = tab === INCOMING ? 'Bekleyen mesaj isteğin yok.' : 'Gönderdiğin bekleyen mesaj isteği yok.'

  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, px: { xs: 0.5, md: 0 } }}>
        <IconButton onClick={() => navigate('/messages')} aria-label="Geri" size="small">
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>Mesaj İstekleri</Typography>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Mesaj istekleri" sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label="Gelen" />
        <Tab label="Giden" />
      </Tabs>

      {list.loading ? (
        <CenteredSpinner py={6} size={28} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={MailOutlineRounded} title={emptyText} />
      ) : (
        <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Stack divider={<Divider />}>
            {list.items.map(r => {
              const busy = actingId === r.id
              const isIncoming = tab === INCOMING
              const otherId = isIncoming ? r.senderId : r.recipientId
              const otherName = isIncoming ? r.senderName : r.recipientName
              return (
                <RequestRow key={r.id} name={otherName} onOpenProfile={() => navigate(`/users/${otherId}`)}>
                  {isIncoming ? (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
                      <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={() => handleReject(r)} sx={{ minHeight: 40 }}>
                        Reddet
                      </Button>
                      <Button size="small" variant="contained" disabled={busy} onClick={() => handleAccept(r)} sx={{ minHeight: 40 }}>
                        {busy ? <CircularProgress size={16} color="inherit" /> : 'Kabul Et'}
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      size="small" variant="outlined" color="error" disabled={busy} onClick={() => handleCancel(r)}
                      sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, minHeight: 40 }}
                    >
                      {busy ? <CircularProgress size={16} color="inherit" /> : 'Geri Çek'}
                    </Button>
                  )}
                </RequestRow>
              )
            })}
          </Stack>
        </Box>
      )}

      {!list.loading && !list.last && <LoadMoreButton loading={list.loadingMore} onClick={list.loadMore} />}
    </Box>
  )
}
