import { useEffect, useState } from 'react'
import { Box } from '@mui/material'

const COLORS = ['#4CB89F', '#8FDCAF', '#F2A33A', '#FFC94A', '#6DB6F0', '#A895F0']

function makeLeaves(seed) {
  return Array.from({ length: 18 }).map((_, i) => ({
    id: `${seed}-${i}`,
    left: 8 + Math.random() * 84,
    delay: Math.random() * 260,
    drift: Math.round(Math.random() * 80 - 40),
    spin: Math.round(Math.random() * 360 - 180),
    color: COLORS[i % COLORS.length],
    size: 10 + Math.random() * 8,
  }))
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Kutlama anı (en iyi cevap seçildi, yeni avatar açıldı): ekranın üstünden
 * birkaç yaprak süzülür, ~1.9 sn sonra kendiliğinden kaybolur. `trigger`
 * her değiştiğinde (ör. Date.now()) yeniden oynar. Hareket azaltma
 * tercihinde gösterilmez.
 */
export default function LeafBurst({ trigger }) {
  const [burst, setBurst] = useState(null)

  useEffect(() => {
    if (!trigger || prefersReducedMotion()) return undefined
    const show = setTimeout(() => setBurst(makeLeaves(trigger)), 0)
    const hide = setTimeout(() => setBurst(null), 1900)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [trigger])

  if (!burst) return null
  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2000, overflow: 'hidden' }}>
      {burst.map(l => (
        <Box
          key={l.id}
          component="svg"
          viewBox="0 0 20 20"
          sx={{
            position: 'absolute', top: '12%', left: `${l.left}%`, width: l.size, height: l.size,
            animation: `sg-leaf-fall 1500ms ${l.delay}ms var(--ease-flow) both`,
            '--sg-drift': `${l.drift}px`, '--sg-spin': `${l.spin}deg`,
          }}
        >
          <path d="M10 1 C16 4 19 10 10 19 C1 10 4 4 10 1Z" fill={l.color} />
        </Box>
      ))}
    </Box>
  )
}
