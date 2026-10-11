// Mola anları: 1 dakikalık nefes (4 sn al, 4 sn tut, 6 sn ver; 5 tur) ve
// 60 sn dalga seyri (ses yok). İkisi de her an kapatılabilir.
import { useEffect, useRef, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { BreathingCircle, WavesView } from '../art/index.js'
import { useDialogHistory } from '../../hooks/useDialogHistory.js'

const PHASES = [
  { key: 'in', ms: 4000, label: 'Nefes al' },
  { key: 'hold', ms: 4000, label: 'Tut' },
  { key: 'out', ms: 6000, label: 'Yavaşça ver' },
]
const ROUNDS = 5
const CYCLE = PHASES.reduce((a, p) => a + p.ms, 0)

function useElapsed(running) {
  const [t, setT] = useState(0)
  const start = useRef(0)
  useEffect(() => {
    if (!running) return undefined
    start.current = performance.now()
    // 10 fps yeterli (çember zaten kendi içinde yumuşak); pil dostu
    const id = setInterval(() => setT(performance.now() - start.current), 100)
    return () => clearInterval(id)
  }, [running])
  return t
}

function Shell({ children, onClose, label, bg }) {
  useDialogHistory(true, onClose)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <Box
      role="dialog" aria-modal="true" aria-label={label}
      sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: bg, p: 2, pt: 'calc(env(safe-area-inset-top) + 16px)', pb: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      {children}
    </Box>
  )
}

export function BreathingOverlay({ onClose }) {
  const t = useElapsed(true)
  const done = t >= CYCLE * ROUNDS
  const round = Math.min(ROUNDS, Math.floor(t / CYCLE) + 1)
  let inCycle = t % CYCLE
  let phase = PHASES[0]
  for (const p of PHASES) {
    if (inCycle < p.ms) { phase = p; break }
    inCycle -= p.ms
  }
  const progress = done ? 1 : inCycle / phase.ms
  return (
    <Shell onClose={onClose} label="1 dakikalık nefes" bg="rgba(236, 248, 242, 0.97)">
      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#1F5A4E', mb: 1 }}>
        {done ? 'Güzel. Kendine bir dakika ayırdın.' : `${round}. tur / ${ROUNDS}`}
      </Typography>
      <BreathingCircle phase={done ? 'hold' : phase.key} progress={progress} size={Math.min(300, window.innerWidth - 48)} label={done ? '' : phase.label} />
      {/* ekran okuyucu: yalnızca aşama değişince okunur */}
      <Typography aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
        {done ? 'Bitti' : phase.label}
      </Typography>
      <Button variant={done ? 'contained' : 'outlined'} onClick={onClose} sx={{ mt: 3, minHeight: 52, minWidth: 180, borderRadius: 999, fontWeight: 800, fontSize: '1.05rem' }}>
        {done ? 'Tamam' : 'Bitir'}
      </Button>
    </Shell>
  )
}

export function WavesOverlay({ onClose, seconds = 60 }) {
  const t = useElapsed(true)
  const left = Math.max(0, Math.ceil(seconds - t / 1000))
  useEffect(() => { if (left === 0) onClose() }, [left, onClose])
  return (
    <Shell onClose={onClose} label="Dalgaları dinle" bg="#CFE9F2">
      <Box sx={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <WavesView />
      </Box>
      <Box sx={{ position: 'relative', mt: 'auto', textAlign: 'center', display: 'grid', gap: 1.5, justifyItems: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1F4E5A', bgcolor: 'rgba(255,253,248,0.88)', px: 2.5, py: 1, borderRadius: '20px' }}>
          Dalgalara bak, nefesin yavaşlasın
          <Box component="span" sx={{ display: 'block', fontSize: '0.95rem', fontWeight: 700 }}>{left} sn</Box>
        </Typography>
        <Button variant="contained" onClick={onClose} sx={{ minHeight: 52, minWidth: 180, borderRadius: 999, fontWeight: 800, fontSize: '1.05rem' }}>
          Kapat
        </Button>
      </Box>
    </Shell>
  )
}
