// Eşya eylem menüsü: büyük, etiketli düğmeler (Otur, Uzan, Müzik aç...).
import { Button, Stack, Typography } from '@mui/material'
import {
  AutoAwesomeRounded, BakeryDiningRounded, BedRounded, BrushRounded, ChairRounded, EmojiFoodBeverageRounded,
  LightbulbRounded, LocalFireDepartmentRounded, LocalFloristRounded, MenuBookRounded, MusicNoteRounded,
  PetsRounded, PianoRounded, TvRounded, WaterRounded, WorkRounded,
} from '@mui/icons-material'
import GameSheet from '../ui/GameSheet.jsx'

function iconFor(action, itemKey) {
  if (action.kind === 'toggle') {
    if (itemKey === 'tv') return <TvRounded />
    if (itemKey === 'radio') return <MusicNoteRounded />
    if (itemKey === 'fireplace') return <LocalFireDepartmentRounded />
    return <LightbulbRounded />
  }
  switch (action.id) {
    case 'sit': return <ChairRounded />
    case 'lie': return <BedRounded />
    case 'play': return <PianoRounded />
    case 'watch': return <WaterRounded />
    case 'read': return <MenuBookRounded />
    case 'paint': return <BrushRounded />
    case 'work': return <WorkRounded />
    case 'pet': return <PetsRounded />
    case 'smell': return <LocalFloristRounded />
    case 'tea': return <EmojiFoodBeverageRounded />
    case 'simit': return <BakeryDiningRounded />
    default: return <AutoAwesomeRounded />
  }
}

export default function ActionSheet({ open, onClose, title, itemKey, actions, onPick, note }) {
  return (
    <GameSheet open={open} onClose={onClose} title={title || 'Ne yapalım?'} subtitle={note}>
      {actions?.length ? (
        <Stack spacing={1} role="menu" aria-label={title}>
          {actions.map((a) => (
            <Button
              key={a.id}
              role="menuitem"
              variant={a.kind === 'toggle' ? 'outlined' : 'contained'}
              startIcon={iconFor(a, itemKey)}
              onClick={() => onPick(a)}
              sx={{ minHeight: 56, justifyContent: 'flex-start', px: 2.25, borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', '& .MuiButton-startIcon svg': { fontSize: '1.6rem' } }}
            >
              {a.label}
            </Button>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ color: 'text.secondary' }}>Bu eşyayla şimdilik yapılacak bir şey yok.</Typography>
      )}
    </GameSheet>
  )
}
