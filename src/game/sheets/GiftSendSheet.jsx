// Hediye bırakma: hediye + hazır mesaj seç, onayla. Tek sayfa, iki seçim.
import { useEffect, useState } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { RedeemRounded } from '@mui/icons-material'
import { GiftIcon, CharacterBust } from '../art/index.js'
import { useNotification } from '../../context/NotificationContext.jsx'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import GameSheet from '../ui/GameSheet.jsx'
import RadioTiles from '../ui/RadioTiles.jsx'
import { SeedAmount } from '../ui/SeedGlyph.jsx'

export default function GiftSendSheet({ to, open, onClose }) {
  const { token, catalog, profile, patchProfile, announce } = useGame()
  const { showSuccess } = useNotification()
  const [giftKey, setGiftKey] = useState(null)
  const [messageKey, setMessageKey] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const toId = to?.publicId
  useEffect(() => {
    setGiftKey(null)
    setMessageKey(null)
    setError(null)
  }, [toId])

  if (!to) return null
  const gift = catalog.giftsByKey[giftKey]
  const seeds = profile?.seeds ?? 0
  const short = gift && gift.price > seeds

  const send = async () => {
    if (!giftKey || !messageKey) return
    setBusy(true)
    setError(null)
    try {
      const r = await api.sendGift(token, { toPublicId: to.publicId, giftKey, messageKey })
      if (r?.seeds != null) patchProfile({ seeds: r.seeds })
      showSuccess(`Hediyen ${to.nickname} kapısına bırakıldı.`)
      announce('Hediyen gönderildi')
      onClose()
    } catch (err) {
      setError(err?.message || 'Hediye gönderilemedi, biraz sonra tekrar dene.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <GameSheet
      open={open}
      onClose={onClose}
      title="Hediye bırak"
      subtitle={`${to.nickname} için`}
      icon={<RedeemRounded />}
      actions={(
        <Button
          variant="contained" size="large" onClick={send}
          disabled={!giftKey || !messageKey || busy || short}
          sx={{ minHeight: 52, borderRadius: 999, fontWeight: 800, px: 3, width: { xs: '100%', sm: 'auto' } }}
        >
          {busy ? <SaglikLoader size="sm" color="inherit" label="Gönderiliyor" /> : gift ? <>Bırak ·&nbsp;<SeedAmount value={gift.price} /></> : 'Bir hediye seç'}
        </Button>
      )}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <CharacterBust appearance={to.appearance} size={48} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Küçük bir iyilik büyük gelir. Senin tohumun: <SeedAmount value={seeds} size={14} />
        </Typography>
      </Stack>

      <Typography id="gift-pick" sx={{ fontWeight: 800, mb: 1 }}>1. Hediyeni seç</Typography>
      <RadioTiles
        labelId="gift-pick" size={56} value={giftKey} onChange={setGiftKey}
        columns="repeat(3, 1fr)"
        options={catalog.gifts.map((g) => ({
          value: g.key,
          label: `${g.name} · ${g.price}`,
          ariaLabel: `${g.name}, ${g.price} tohum`,
          render: <GiftIcon giftKey={g.key} size={52} />,
        }))}
      />
      {short && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          Yeterli tohumun yok. Her gün uğramak ve hediye almak tohum kazandırır.
        </Alert>
      )}

      <Typography id="gift-msg" sx={{ fontWeight: 800, mt: 2.5, mb: 1 }}>2. Bir not ekle</Typography>
      <Box role="radiogroup" aria-labelledby="gift-msg" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
        {catalog.messages.map((m) => {
          const on = m.key === messageKey
          return (
            <Button
              key={m.key}
              role="radio"
              aria-checked={on}
              onClick={() => setMessageKey(m.key)}
              variant={on ? 'contained' : 'outlined'}
              sx={{ minHeight: 48, justifyContent: 'flex-start', textAlign: 'left', borderRadius: '14px', fontWeight: 700, textTransform: 'none' }}
            >
              “{m.text}”
            </Button>
          )
        })}
      </Box>
      {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
    </GameSheet>
  )
}
