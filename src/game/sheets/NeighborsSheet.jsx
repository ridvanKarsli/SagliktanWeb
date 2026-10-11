// Komşular: bana açık evler, son aktif olan önce. Sonsuz kaydırma
// (sayfanın kendi kaydırma kabı kök alınır).
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'
import { CottageRounded, GroupsRounded, RedeemRounded } from '@mui/icons-material'
import { CharacterBust } from '../art/index.js'
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel.jsx'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { isAbortError } from '../../services/api.js'
import { relativeTime } from '../../utils/format.js'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import GameSheet from '../ui/GameSheet.jsx'

export default function NeighborsSheet({ open, onClose, onGift }) {
  const navigate = useNavigate()
  const { token, returnTo } = useGame()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(-1)
  const [last, setLast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [root, setRoot] = useState(null)
  const [visitingId, setVisitingId] = useState(null)
  const [rowError, setRowError] = useState({})
  const ctrlRef = useRef(null)

  const load = useCallback(async (p) => {
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    setLoading(true)
    setError(null)
    try {
      const r = await api.getNeighbors(token, { page: p, size: 20, signal: ctrl.signal })
      setItems((cur) => (p === 0 ? r.content : [...cur, ...r.content]))
      setLast(r.last !== false)
      setPage(p)
    } catch (err) {
      if (!isAbortError(err)) setError(err?.message || 'Komşular yüklenemedi.')
    } finally {
      if (!ctrl.signal.aborted) setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!open) return undefined
    load(0)
    return () => ctrlRef.current?.abort()
  }, [open, load])

  const mixed = items.some((n) => n.known) && items.some((n) => !n.known)

  const visit = async (player) => {
    setVisitingId(player.publicId)
    try {
      const room = await api.getRoom(token, player.publicId)
      onClose()
      navigate(`/mahalle/ev/${player.publicId}`, { state: { room, from: returnTo.current } })
    } catch (err) {
      setRowError((m) => ({ ...m, [player.publicId]: err?.status === 404 ? 'Bu eve şu an girilemiyor.' : (err?.message || 'Ev açılamadı.') }))
    } finally {
      setVisitingId(null)
    }
  }

  return (
    <GameSheet open={open} onClose={onClose} title="Komşular" subtitle="Kapısı sana açık olan evler" icon={<GroupsRounded />} contentRef={setRoot} height="min(86dvh, 860px)">
      {error && <Alert severity="warning" action={<Button color="inherit" onClick={() => load(0)}>Tekrar dene</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      {page === 0 && !loading && items.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ fontWeight: 800 }}>Mahalle henüz sessiz</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Meydanda biriyle selamlaşmaya ne dersin?</Typography>
        </Box>
      )}
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {items.map(({ player, visitedByMeAt, lastActiveAt, known }, i) => (
          <Fragment key={player.publicId}>
          {/* sunucu tanıdıkları önce sıralar; ikisi de varsa bölüm başlıkları */}
          {mixed && (i === 0 || !!items[i - 1].known !== !!known) && (
            <Typography component="li" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.9rem', pt: i ? 1 : 0, listStyle: 'none' }}>
              {known ? 'Tanıdıkların' : 'Mahalleden'}
            </Typography>
          )}
          <Box component="li" sx={{ p: 1.25, borderRadius: '18px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CharacterBust appearance={player.appearance} size={56} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }} noWrap>{player.nickname}</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                  {known && <Chip size="small" label="Tanıdık" color="primary" sx={{ height: 22, fontWeight: 800 }} />}
                  {visitedByMeAt && <Chip size="small" label="Uğradın" color="success" variant="outlined" sx={{ height: 22, fontWeight: 700 }} />}
                  {lastActiveAt && <Typography variant="caption" sx={{ color: 'text.secondary' }}>Son görülme {relativeTime(lastActiveAt)}</Typography>}
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained" size="small" startIcon={visitingId === player.publicId ? null : <CottageRounded />}
                onClick={() => visit(player)} disabled={!!visitingId}
                sx={{ flex: 1, minHeight: 44, borderRadius: 999, fontWeight: 800 }}
              >
                {visitingId === player.publicId ? <SaglikLoader size="sm" color="inherit" label="Kapı çalınıyor" /> : 'Ziyaret et'}
              </Button>
              <Button variant="outlined" size="small" startIcon={<RedeemRounded />} onClick={() => onGift?.(player)} sx={{ flex: 1, minHeight: 44, borderRadius: 999, fontWeight: 800 }}>
                Hediye bırak
              </Button>
            </Stack>
            {rowError[player.publicId] && <Alert severity="info" sx={{ mt: 1 }}>{rowError[player.publicId]}</Alert>}
          </Box>
          </Fragment>
        ))}
      </Stack>
      {page >= 0 && (
        <InfiniteScrollSentinel
          hasMore={!last} loading={loading} onLoadMore={() => load(page + 1)} itemCount={items.length}
          root={root} rootMargin="200px 0px" dense
        />
      )}
      {page < 0 && loading && <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}><SaglikLoader size="md" label="Komşular yükleniyor" /></Box>}
    </GameSheet>
  )
}
