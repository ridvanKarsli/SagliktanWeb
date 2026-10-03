import { useCallback, useEffect, useState } from 'react'
import { Box, Button, ButtonBase, CircularProgress, IconButton, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material'
import { ArrowBackRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useMessaging } from '../../context/MessagingContext.jsx'
import {
  listMessageRequests, acceptMessageRequest, rejectMessageRequest, listSentMessageRequests, cancelMessageRequest
} from '../../services/api.js'
import { usePaginatedList } from '../../hooks/usePaginatedList.js'
import { prettyDate } from '../../utils/format.js'
import UserAvatar from '../../components/avatars/UserAvatar.jsx'
import CompanionEmpty from '../../components/avatars/CompanionEmpty.jsx'
import { radius } from '../../design/tokens.js'
import '../../styles/companions.css'
import LoadMoreButton from '../../components/common/LoadMoreButton.jsx'

const INCOMING = 0
const OUTGOING = 1

const LIST_SX = { borderRadius: `${radius.lg}px`, border: '1px solid', borderColor: 'brand.border', bgcolor: 'background.paper', overflow: 'hidden' }

function RequestRow({ name, avatarKey, when, note, onOpenProfile, children }) {
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1.5, px: { xs: 1.5, sm: 2 }, py: 1.75
      }}
    >
      <ButtonBase
        onClick={onOpenProfile}
        aria-label={`${name || 'Kullanıcı'} profiline git`}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', gap: 1.5, textAlign: 'left', borderRadius: `${radius.md}px`, p: 0.5, m: -0.5 }}
      >
        <UserAvatar avatarKey={avatarKey} name={name} size={52} sx={{ flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" component="span" sx={{ display: 'block', wordBreak: 'break-word' }}>{name}</Typography>
          <Typography variant="body2" component="span" sx={{ display: 'block', color: 'text.secondary' }}>
            {note}{when ? ` · ${when}` : ''}
          </Typography>
        </Box>
      </ButtonBase>
      {children}
    </Box>
  )
}

function RequestSkeleton() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.75 }}>
      <Skeleton variant="circular" width={52} height={52} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="45%" />
        <Skeleton variant="text" width="60%" sx={{ fontSize: '0.8rem' }} />
      </Box>
    </Stack>
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
    <Box className="page-transition" sx={{ width: '100%', maxWidth: 680, mx: 'auto', py: { xs: 1.5, md: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <IconButton onClick={() => navigate('/messages')} aria-label="Geri" sx={{ width: 44, height: 44 }}>
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h2" component="h1">Mesaj İstekleri</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, px: 0.5 }}>
        Biri sana yazmak istediğinde önce burada görürsün. Kabul edersen sohbetiniz açılır.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Mesaj istekleri" sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label="Gelen" />
        <Tab label="Giden" />
      </Tabs>

      {list.loading ? (
        <Box sx={LIST_SX} aria-busy="true" aria-label="İstekler yükleniyor">
          <RequestSkeleton /><RequestSkeleton />
        </Box>
      ) : list.items.length === 0 ? (
        <CompanionEmpty
          companion={tab === INCOMING ? 'kedi' : 'kirpi'}
          title={emptyText}
          description={tab === INCOMING
            ? 'Yeni bir istek geldiğinde sana haber veririz.'
            : 'Bir profilden "Mesaj Gönder"e dokunduğunda istek burada bekler.'}
          dense
        />
      ) : (
        <Stack component="ul" className="sg-stagger" sx={{ ...LIST_SX, listStyle: 'none', p: 0, m: 0, '& > li + li': { borderTop: '1px solid', borderColor: 'divider' } }}>
          {list.items.map(r => {
            const busy = actingId === r.id
            const isIncoming = tab === INCOMING
            const otherId = isIncoming ? r.senderId : r.recipientId
            const otherName = isIncoming ? r.senderName : r.recipientName
            const otherAvatar = isIncoming ? r.senderAvatarKey : r.recipientAvatarKey
            return (
              <li key={r.id}>
                <RequestRow
                  name={otherName}
                  avatarKey={otherAvatar}
                  when={prettyDate(r.createdAt)}
                  note={isIncoming ? 'Seninle sohbet etmek istiyor' : 'Yanıt bekleniyor'}
                  onOpenProfile={() => navigate(`/users/${otherId}`)}
                >
                  {isIncoming ? (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'stretch', sm: 'flex-start' }, '& > *': { flex: { xs: 1, sm: '0 0 auto' } } }}>
                      <Button variant="outlined" disabled={busy} onClick={() => handleReject(r)}>
                        Reddet
                      </Button>
                      <Button variant="contained" disabled={busy} onClick={() => handleAccept(r)}>
                        {busy ? <CircularProgress size={18} color="inherit" /> : 'Kabul Et'}
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant="outlined" color="error" disabled={busy} onClick={() => handleCancel(r)}
                      sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
                    >
                      {busy ? <CircularProgress size={18} color="inherit" /> : 'Geri Çek'}
                    </Button>
                  )}
                </RequestRow>
              </li>
            )
          })}
        </Stack>
      )}

      {!list.loading && !list.last && <LoadMoreButton loading={list.loadingMore} onClick={list.loadMore} />}
    </Box>
  )
}
