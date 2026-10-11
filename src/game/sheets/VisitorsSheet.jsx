// "Seni ziyaret edenler": kendi odamın son 20 ziyaretçisi.
import { useEffect, useState } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { PeopleAltRounded, RedeemRounded } from '@mui/icons-material'
import { CharacterBust } from '../art/index.js'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { isAbortError } from '../../services/api.js'
import { relativeTime } from '../../utils/format.js'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import GameSheet from '../ui/GameSheet.jsx'

export default function VisitorsSheet({ open, onClose, onGift }) {
  const { token } = useGame()
  const [list, setList] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    const ctrl = new AbortController()
    setError(null)
    api.getVisitors(token, { signal: ctrl.signal })
      .then((r) => setList(Array.isArray(r) ? r : []))
      .catch((err) => { if (!isAbortError(err)) setError(err?.message || 'Ziyaretçiler yüklenemedi.') })
    return () => ctrl.abort()
  }, [open, token])

  return (
    <GameSheet open={open} onClose={onClose} title="Seni ziyaret edenler" subtitle="Son uğrayan komşuların" icon={<PeopleAltRounded />}>
      {error && <Alert severity="warning">{error}</Alert>}
      {!error && list === null && <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}><SaglikLoader size="md" label="Yükleniyor" /></Box>}
      {list && list.length === 0 && (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          Henüz kimse uğramadı. Evini güzelleştirip meydanda selam vermeye ne dersin?
        </Typography>
      )}
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {(list || []).map(({ player, visitedAt }) => (
          <Box component="li" key={player.publicId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <CharacterBust appearance={player.appearance} size={52} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }} noWrap>{player.nickname}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{relativeTime(visitedAt)}</Typography>
            </Box>
            <Button size="small" variant="outlined" startIcon={<RedeemRounded />} onClick={() => onGift?.(player)} sx={{ minHeight: 44, borderRadius: 999, fontWeight: 800 }}>
              Teşekkür et
            </Button>
          </Box>
        ))}
      </Stack>
    </GameSheet>
  )
}
