// Başka bir oyuncunun kartı: büst + takma ad + yol arkadaşı; evini ziyaret,
// hediye bırakma, engelleme ve şikayet. Gerçek ad hiçbir yerde yok.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'
import { BlockRounded, CottageRounded, FlagRounded, RedeemRounded } from '@mui/icons-material'
import { CharacterBust } from '../art/index.js'
import Companion from '../../components/avatars/Companion.jsx'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import { REPORT_REASONS } from '../data/catalog.js'
import GameSheet from '../ui/GameSheet.jsx'

const bigBtn = { minHeight: 52, justifyContent: 'flex-start', px: 2, borderRadius: '16px', fontWeight: 800, fontSize: '1rem' }

export default function PlayerCardSheet({ player, open, onClose, onGift, onBlocked, hideVisit = false }) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { token, returnTo } = useGame()
  const { showSuccess, showError } = useNotification()
  const [visiting, setVisiting] = useState(false)
  const [roomError, setRoomError] = useState(null)
  const [reporting, setReporting] = useState(false)
  const [reason, setReason] = useState(null)
  const [sending, setSending] = useState(false)

  // Kart başka bir oyuncu için açılınca iç durum sıfırlanır.
  const pid = player?.publicId
  useEffect(() => {
    setRoomError(null)
    setReporting(false)
    setReason(null)
  }, [pid])

  if (!player) return null

  const visit = async () => {
    setVisiting(true)
    setRoomError(null)
    try {
      const room = await api.getRoom(token, player.publicId)
      onClose()
      navigate(`/game/ev/${player.publicId}`, { state: { room, from: returnTo.current } })
    } catch (err) {
      if (err?.status === 404) setRoomError('Bu eve şu an girilemiyor. Belki başka bir zaman.')
      else setRoomError(err?.message || 'Ev şu an açılamadı.')
    } finally {
      setVisiting(false)
    }
  }

  const block = async () => {
    const ok = await confirm(
      `${player.nickname} artık seni görmeyecek, sen de onu görmeyeceksin. Evine giremeyecek, hediye gönderemeyecek. İstediğin zaman kaldırabilirsin.`,
      { title: 'Engellensin mi?', confirmLabel: 'Engelle' },
    )
    if (!ok) return
    try {
      await api.blockPlayer(token, player.publicId)
      showSuccess(`${player.nickname} engellendi.`)
      onBlocked?.(player.publicId)
      onClose()
    } catch (err) {
      showError(err?.message || 'Engellenemedi, tekrar dene.')
    }
  }

  const report = async () => {
    setSending(true)
    try {
      await api.reportPlayer(token, player.publicId, reason)
      showSuccess('Teşekkürler. Şikayetin ekibimize ulaştı.')
      setReporting(false)
      onClose()
    } catch (err) {
      showError(err?.message || 'Şikayet gönderilemedi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <GameSheet open={open} onClose={onClose} title={player.nickname} subtitle="Mahalleden bir komşu">
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <CharacterBust appearance={player.appearance} size={88} />
        {player.petKey && (
          <Stack alignItems="center" spacing={0.5}>
            <Companion name={player.petKey} size={52} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Yol arkadaşı</Typography>
          </Stack>
        )}
      </Stack>

      {!reporting ? (
        <Stack spacing={1}>
          {!hideVisit && (
            <Button variant="contained" startIcon={visiting ? null : <CottageRounded />} onClick={visit} disabled={visiting} sx={bigBtn}>
              {visiting ? <SaglikLoader size="sm" color="inherit" label="Kapı çalınıyor" /> : 'Evini ziyaret et'}
            </Button>
          )}
          {roomError && <Alert severity="info">{roomError}</Alert>}
          <Button variant="outlined" startIcon={<RedeemRounded />} onClick={() => onGift?.(player)} sx={bigBtn}>
            Hediye bırak
          </Button>
          <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
            <Button color="inherit" startIcon={<BlockRounded />} onClick={block} sx={{ flex: 1, minHeight: 48, color: 'text.secondary', fontWeight: 700 }}>
              Engelle
            </Button>
            <Button color="inherit" startIcon={<FlagRounded />} onClick={() => setReporting(true)} sx={{ flex: 1, minHeight: 48, color: 'text.secondary', fontWeight: 700 }}>
              Şikayet et
            </Button>
          </Box>
        </Stack>
      ) : (
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Ne oldu? (İstersen boş bırakabilirsin)</Typography>
          <Box role="radiogroup" aria-label="Şikayet nedeni" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {REPORT_REASONS.map((r) => (
              <Chip
                key={r}
                role="radio"
                aria-checked={reason === r}
                label={r}
                onClick={() => setReason((cur) => (cur === r ? null : r))}
                color={reason === r ? 'primary' : 'default'}
                variant={reason === r ? 'filled' : 'outlined'}
                sx={{ minHeight: 44, borderRadius: 999, fontWeight: 700, fontSize: '0.95rem' }}
              />
            ))}
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Şikayetin gizli kalır; {player.nickname} kimin bildirdiğini görmez.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => setReporting(false)} sx={{ minHeight: 48 }}>Vazgeç</Button>
            <Button variant="contained" color="error" onClick={report} disabled={sending} sx={{ minHeight: 48, fontWeight: 800 }}>
              Şikayet et
            </Button>
          </Stack>
        </Box>
      )}
    </GameSheet>
  )
}
