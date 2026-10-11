// Gelen hediyeler: açılınca hepsi "görüldü" sayılır. Liste toplamı bilinmeyen
// bir dilim (Slice): `last` false iken "Daha fazla göster".
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { RedeemRounded } from '@mui/icons-material'
import { GiftIcon } from '../art/index.js'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { isAbortError } from '../../services/api.js'
import { relativeTime } from '../../utils/format.js'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import GameSheet from '../ui/GameSheet.jsx'

export default function GiftInboxSheet({ open, onClose }) {
  const { token, catalog, patchProfile } = useGame()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const ctrlRef = useRef(null)

  const load = useCallback(async (p) => {
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    setLoading(true)
    setError(null)
    try {
      const r = await api.getGifts(token, { page: p, signal: ctrl.signal })
      setItems((cur) => (p === 0 ? r.content : [...cur, ...r.content]))
      setLast(r.last !== false)
      setPage(p)
    } catch (err) {
      if (!isAbortError(err)) setError(err?.message || 'Hediyeler yüklenemedi.')
    } finally {
      if (!ctrl.signal.aborted) setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!open) return undefined
    load(0)
    api.markGiftsSeen(token)
      .then(() => patchProfile({ unseenGifts: 0 }))
      // "görüldü" işareti ikincil: başarısızsa rozet bir sonraki açılışta düzelir
      .catch(() => {})
    return () => ctrlRef.current?.abort()
  }, [open, token, load, patchProfile])

  return (
    <GameSheet open={open} onClose={onClose} title="Hediyelerin" subtitle="Kapına bırakılan iyilikler" icon={<RedeemRounded />}>
      {error && <Alert severity="warning" action={<Button color="inherit" onClick={() => load(0)}>Tekrar dene</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && items.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <GiftIcon giftKey="lantern" size={72} />
          <Typography sx={{ fontWeight: 800, mt: 1 }}>Henüz hediye yok</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320, mx: 'auto' }}>
            Komşularına küçük bir çay bırakmaya ne dersin? İyilik genelde geri döner.
          </Typography>
        </Box>
      )}
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {items.map((g) => {
          const gift = catalog.giftsByKey[g.giftKey]
          const msg = catalog.messagesByKey[g.messageKey]?.text
          return (
            <Box
              component="li"
              key={g.id}
              sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 1.25, borderRadius: '16px', bgcolor: g.seen ? 'transparent' : 'brand.apricotSoft', border: '1px solid', borderColor: 'divider' }}
            >
              <GiftIcon giftKey={g.giftKey} size={48} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                  {g.from?.nickname || 'Eski bir komşu'} <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>· {gift?.name || 'hediye'}</Box>
                </Typography>
                {msg && <Typography sx={{ lineHeight: 1.35 }}>“{msg}”</Typography>}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{relativeTime(g.createdAt)}</Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>
      {loading && <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}><SaglikLoader size="md" label="Hediyeler yükleniyor" /></Box>}
      {!loading && !last && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="outlined" onClick={() => load(page + 1)} sx={{ minHeight: 48 }}>Daha fazla göster</Button>
        </Box>
      )}
    </GameSheet>
  )
}
