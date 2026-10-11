// Çarşı mağazası: Giyim / Mobilya. Fiyatlar tohumla; 50'den pahalı alımlar
// onay ister. Yetersiz tohumda istek atılmaz, nazik bir açıklama gösterilir.
import { useState } from 'react'
import { Alert, Box, Button, Chip, Stack, Tab, Tabs, Typography } from '@mui/material'
import { StorefrontRounded } from '@mui/icons-material'
import { ClothingSwatch, FURNITURE, IsoTile, footprintPolygon, toPoints, iso } from '../art/index.js'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useGame, ownedCount } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import GameSheet from '../ui/GameSheet.jsx'
import { SeedAmount } from '../ui/SeedGlyph.jsx'

const SHORT_MSG = 'Yeterli tohumun yok. Her gün uğramak ve hediye almak tohum kazandırır.'
const CLOTHING_SLOTS = ['top', 'bottom', 'accessory']
const SLOT_TITLES = { top: 'Üstler', bottom: 'Altlar', accessory: 'Aksesuarlar' }

// Mobilya önizlemesi: kendi ayak izi kadar parke üzerinde.
export function FurniturePreview({ itemKey, size = 96 }) {
  const f = FURNITURE[itemKey]
  if (!f) return null
  const { w, d } = f
  const tiles = []
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    const { sx, sy } = iso(x, y)
    tiles.push(<g key={`${x}${y}`} transform={`translate(${sx} ${sy})`}><IsoTile kind="floor_room" variant={(x + y) % 2} /></g>)
  }
  const minX = -d * 32 - 4
  const width = (w + d) * 32 + 8
  const top = -112
  const height = (w + d) * 16 - top + 6
  const Comp = f.Component
  return (
    <svg width={size} height={size} viewBox={`${minX} ${top} ${width} ${height}`} aria-hidden="true">
      {tiles}
      <polygon points={toPoints(footprintPolygon(w, d))} fill="none" stroke="#B98656" strokeOpacity="0.4" />
      <Comp />
    </svg>
  )
}

// Rozet ("Sende", "Üzerinde") kendi satırında durur: görselin ya da adın
// üstüne hiç binmez; rozetsiz kartlarda da aynı yükseklik korunur.
function ItemCard({ visual, name, price, badge, action }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, p: 1, pt: 0.75, borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-end', minHeight: 22 }}>
        {badge && <Chip size="small" label={badge} color="success" sx={{ height: 22, fontWeight: 800 }} />}
      </Box>
      <Box sx={{ height: 88, display: 'grid', placeItems: 'center' }}>{visual}</Box>
      <Typography sx={{ fontWeight: 800, textAlign: 'center', lineHeight: 1.2, fontSize: '0.95rem' }}>{name}</Typography>
      {price != null && <Typography variant="body2" sx={{ color: 'text.secondary' }}><SeedAmount value={price} size={15} /></Typography>}
      <Box sx={{ width: '100%', mt: 'auto', pt: 0.5 }}>{action}</Box>
    </Box>
  )
}

export default function ShopSheet({ open, onClose, tab: initialTab = 'clothing', onTabChange }) {
  const { token, catalog, profile, setProfile, announce } = useGame()
  const confirm = useConfirm()
  const { showSuccess, showError } = useNotification()
  const [busyKey, setBusyKey] = useState(null)
  const [notice, setNotice] = useState(null)
  const [wearOffer, setWearOffer] = useState(null)
  const tab = initialTab

  if (!profile) return null
  const seeds = profile.seeds ?? 0

  const buy = async (item) => {
    setNotice(null)
    setWearOffer(null)
    if (item.price > seeds) {
      setNotice({ key: item.key, text: SHORT_MSG })
      return
    }
    if (item.price > 50) {
      const ok = await confirm(`${item.name} için ${item.price} tohum harcanacak. Kalan tohumun ${seeds - item.price} olur.`, {
        title: 'Satın alınsın mı?', confirmLabel: 'Al', danger: false,
      })
      if (!ok) return
    }
    setBusyKey(item.key)
    try {
      const p = await api.buyItem(token, item.key)
      setProfile(p)
      announce(`${item.name} alındı`)
      if (item.slot) setWearOffer(item)
      else showSuccess(`${item.name} evine gönderildi. Evim’den yerleştirebilirsin.`)
    } catch (err) {
      setNotice({ key: item.key, text: err?.message === 'Yeterli tohumun yok' ? SHORT_MSG : (err?.message || 'Satın alınamadı.') })
    } finally {
      setBusyKey(null)
    }
  }

  const wear = async (item) => {
    setBusyKey(item.key)
    try {
      const p = await api.updateAppearance(token, { ...profile.appearance, [item.slot]: item.key })
      setProfile(p)
      setWearOffer(null)
      showSuccess(`${item.name} üzerinde, çok yakıştı!`)
    } catch (err) {
      showError(err?.message || 'Giyilemedi.')
    } finally {
      setBusyKey(null)
    }
  }

  const btnSx = { minHeight: 44, borderRadius: 999, fontWeight: 800 }

  const clothing = CLOTHING_SLOTS.map((slot) => ({
    slot,
    items: catalog.clothing.filter((c) => c.slot === slot && !c.starter && c.price > 0),
  }))

  return (
    <GameSheet
      open={open}
      onClose={onClose}
      title="Çarşı"
      subtitle={<>Tohumun: <SeedAmount value={seeds} size={15} /></>}
      icon={<StorefrontRounded />}
      height="min(86dvh, 860px)"
      maxWidth={720}
    >
      <Tabs
        value={tab} onChange={(_, v) => { setNotice(null); setWearOffer(null); onTabChange?.(v) }} variant="fullWidth" aria-label="Mağaza bölümü"
        sx={{ mb: 1.5, position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', '& .MuiTab-root': { minHeight: 48, fontWeight: 800, fontSize: '1rem' } }}
      >
        <Tab value="clothing" label="Giyim" />
        <Tab value="furniture" label="Mobilya" />
      </Tabs>

      {wearOffer && (
        <Alert
          severity="success" sx={{ mb: 2, alignItems: 'center' }}
          action={<Button color="inherit" onClick={() => wear(wearOffer)} disabled={busyKey === wearOffer.key} sx={{ fontWeight: 800, minHeight: 44 }}>Hemen giy</Button>}
        >
          {wearOffer.name} artık senin.
        </Alert>
      )}

      {tab === 'clothing' ? clothing.map(({ slot, items }) => (
        <Box key={slot} sx={{ mb: 2.5 }}>
          <Typography component="h3" sx={{ fontWeight: 800, mb: 1 }}>{SLOT_TITLES[slot]}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1 }}>
            {items.map((c) => {
              const owned = ownedCount(profile, c.key) > 0
              const wearing = profile.appearance?.[slot] === c.key
              return (
                <ItemCard
                  key={c.key}
                  visual={<ClothingSwatch slot={slot} keyName={c.key} base={slot === 'accessory' ? profile.appearance : { ...profile.appearance, accessory: null }} size={84} title={c.name} />}
                  name={c.name}
                  price={owned ? null : c.price}
                  badge={owned ? (wearing ? 'Üzerinde' : 'Sende') : null}
                  action={(
                    <>
                      {owned ? (
                        <Button fullWidth variant="outlined" disabled={wearing || busyKey === c.key} onClick={() => wear(c)} sx={btnSx}>
                          {wearing ? 'Giyiyorsun' : 'Giy'}
                        </Button>
                      ) : (
                        <Button fullWidth variant="contained" disabled={!!busyKey} onClick={() => buy(c)} sx={btnSx} aria-label={`${c.name} al, ${c.price} tohum`}>
                          {busyKey === c.key ? <SaglikLoader size="sm" color="inherit" label="Alınıyor" /> : 'Al'}
                        </Button>
                      )}
                      {notice?.key === c.key && <Typography variant="caption" role="status" sx={{ display: 'block', mt: 0.75, color: 'text.secondary', lineHeight: 1.3 }}>{notice.text}</Typography>}
                    </>
                  )}
                />
              )
            })}
          </Box>
        </Box>
      )) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1 }}>
          {catalog.furniture.map((f) => {
            const n = ownedCount(profile, f.key)
            return (
              <ItemCard
                key={f.key}
                visual={<FurniturePreview itemKey={f.key} size={84} />}
                name={f.name}
                price={f.price}
                badge={n ? `Sende: ${n}` : null}
                action={(
                  <>
                    <Button fullWidth variant={n ? 'outlined' : 'contained'} disabled={!!busyKey} onClick={() => buy(f)} sx={btnSx} aria-label={`${f.name} al, ${f.price} tohum`}>
                      {busyKey === f.key ? <SaglikLoader size="sm" color="inherit" label="Alınıyor" /> : n ? 'Bir daha al' : 'Al'}
                    </Button>
                    {notice?.key === f.key && <Typography variant="caption" role="status" sx={{ display: 'block', mt: 0.75, color: 'text.secondary', lineHeight: 1.3 }}>{notice.text}</Typography>}
                  </>
                )}
              />
            )
          })}
        </Box>
      )}
      <Stack sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Tohumlar her gün uğradığında ve sana hediye bırakıldığında birikir.
        </Typography>
      </Stack>
    </GameSheet>
  )
}
