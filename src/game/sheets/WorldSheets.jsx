// Dünya ekranının küçük sayfaları: konuşma, buradakiler, harita.
import { useState } from 'react'
import { Box, Button, ButtonBase, Stack, Tab, Tabs, Typography } from '@mui/material'
import { ForumRounded, MapRounded, PeopleAltRounded, PlaceRounded } from '@mui/icons-material'
import { CharacterBust, EmoteIcon } from '../art/index.js'
import Companion from '../../components/avatars/Companion.jsx'
import { focusRingSx } from '../../design/focus.js'
import { useGame } from '../state/GameContext.jsx'
import { ZONE_BLURBS } from '../data/catalog.js'
import { ZONES, ZONE_KEYS } from '../world/zones.js'
import GameSheet from '../ui/GameSheet.jsx'

// --------------------------------------------------------------- Konuş
export function SpeechSheet({ open, onClose, onSay }) {
  const { catalog } = useGame()
  const [tab, setTab] = useState('phrases')
  return (
    <GameSheet open={open} onClose={onClose} title="Ne söylemek istersin?" icon={<ForumRounded />} height="min(72dvh, 640px)">
      <Tabs
        value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" aria-label="Konuşma türü"
        sx={{ mb: 1.5, position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper', '& .MuiTab-root': { minHeight: 48, fontWeight: 800, fontSize: '1rem' } }}
      >
        <Tab value="phrases" label="Cümleler" />
        <Tab value="emotes" label="İfadeler" />
      </Tabs>
      {tab === 'phrases' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 1 }}>
          {catalog.phrases.map((p) => (
            <Button
              key={p.key}
              variant="outlined"
              onClick={() => onSay({ phraseKey: p.key })}
              sx={{ minHeight: 52, borderRadius: '16px', textTransform: 'none', fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.25, color: 'text.primary', borderColor: 'divider', bgcolor: 'background.paper' }}
            >
              {p.text}
            </Button>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {catalog.emotes.map((e) => (
            <ButtonBase
              key={e.key}
              onClick={() => onSay({ emoteKey: e.key })}
              aria-label={e.name}
              sx={{ flexDirection: 'column', gap: 0.5, py: 1.25, borderRadius: '18px', border: '1px solid', borderColor: 'divider', '&.Mui-focusVisible': focusRingSx, '&:hover': { bgcolor: 'action.hover' } }}
            >
              <EmoteIcon emoteKey={e.key} size={52} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{e.name}</Typography>
            </ButtonBase>
          ))}
        </Box>
      )}
    </GameSheet>
  )
}

// --------------------------------------------------------------- Buradakiler
export function PlayersHereSheet({ open, onClose, players, zoneName, onPick }) {
  return (
    <GameSheet open={open} onClose={onClose} title={`Buradakiler (${players.length})`} subtitle={zoneName} icon={<PeopleAltRounded />}>
      {players.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
          Şu an burada senden başka kimse yok. Biraz bekle ya da başka bir yere uğra.
        </Typography>
      ) : (
        <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {players.map((p) => (
            <li key={p.publicId}>
              <ButtonBase
                onClick={() => onPick(p.publicId)}
                sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.5, p: 1, borderRadius: '16px', border: '1px solid', borderColor: 'divider', textAlign: 'left', '&.Mui-focusVisible': focusRingSx, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <CharacterBust appearance={p.appearance} size={52} />
                <Typography sx={{ fontWeight: 800, flex: 1, minWidth: 0 }} noWrap>{p.nickname}</Typography>
                {p.petKey && <Companion name={p.petKey} size={36} />}
              </ButtonBase>
            </li>
          ))}
        </Stack>
      )}
    </GameSheet>
  )
}

// --------------------------------------------------------------- Harita
const ZONE_COLORS = { meydan: '#F2E6CF', park: '#C6E9A6', carsi: '#FCE1B8', sahil: '#C4ECF6', mahalle: '#E2DCFB' }

export function ZoneMapSheet({ open, onClose, current, onPick }) {
  const { catalog } = useGame()
  return (
    <GameSheet open={open} onClose={onClose} title="Nereye gidelim?" icon={<MapRounded />}>
      <Stack spacing={1}>
        {ZONE_KEYS.map((k) => {
          const here = k === current
          return (
            <ButtonBase
              key={k}
              onClick={() => onPick(k)}
              disabled={here}
              aria-current={here ? 'location' : undefined}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', gap: 1.5, p: 1.5, borderRadius: '18px', bgcolor: ZONE_COLORS[k], color: '#23302E', border: '2px solid', borderColor: here ? '#2F8F78' : 'transparent', '&.Mui-focusVisible': focusRingSx }}
            >
              <PlaceRounded sx={{ fontSize: 30, color: '#2F8F78' }} aria-hidden="true" />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{catalog.zonesByKey[k]?.name || ZONES[k].name}</Typography>
                <Typography variant="body2" sx={{ color: '#4A635D' }}>{here ? 'Şu an buradasın' : ZONE_BLURBS[k]}</Typography>
              </Box>
            </ButtonBase>
          )
        })}
      </Stack>
    </GameSheet>
  )
}
