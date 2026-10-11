// Görsel seçenek döşemeleri: gerçek bir radyo grubu gibi davranır
// (role=radiogroup/radio, ok tuşlarıyla gezinme, tek sekme durağı).
// Kilitli seçenekler odaklanabilir ama seçilemez; fiyatı gösterilir.
import { useRef } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { CheckRounded, LockRounded } from '@mui/icons-material'
import { focusRingSx } from '../../design/focus.js'
import { SeedAmount } from './SeedGlyph.jsx'

export default function RadioTiles({ label, labelId, options, value, onChange, size = 72, columns, dense }) {
  const refs = useRef([])
  const selectable = options.filter((o) => !o.locked)
  const current = Math.max(0, options.findIndex((o) => o.value === value))

  const move = (from, dir) => {
    const n = options.length
    for (let s = 1; s <= n; s++) {
      const i = (from + dir * s + n) % n
      if (!options[i].locked) {
        refs.current[i]?.focus()
        onChange(options[i].value)
        return
      }
    }
  }

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1) }
  }

  return (
    <Box
      role="radiogroup"
      aria-labelledby={labelId}
      aria-label={labelId ? undefined : label}
      sx={{
        display: 'grid',
        gridTemplateColumns: columns || `repeat(auto-fill, minmax(${size + 12}px, 1fr))`,
        gap: dense ? 0.75 : 1,
      }}
    >
      {options.map((o, i) => {
        const checked = o.value === value
        const tabbable = checked || (!selectable.some((s) => s.value === value) && i === current)
        return (
          <ButtonBase
            key={String(o.value)}
            ref={(el) => { refs.current[i] = el }}
            role="radio"
            aria-checked={checked}
            aria-disabled={o.locked || undefined}
            aria-label={o.locked ? `${o.label}, kilitli${o.price ? `, ${o.price} tohum` : ''}` : (o.ariaLabel || o.label)}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => { if (!o.locked) onChange(o.value) }}
            onKeyDown={(e) => onKeyDown(e, i)}
            sx={{
              position: 'relative', flexDirection: 'column', gap: 0.5, p: 0.75, minHeight: 44, minWidth: 44,
              borderRadius: '16px', border: '2px solid',
              borderColor: checked ? 'primary.main' : 'divider',
              bgcolor: checked ? 'brand.primarySoft' : 'background.paper',
              opacity: o.locked ? 0.72 : 1,
              transition: 'border-color 140ms ease, background-color 140ms ease',
              '&.Mui-focusVisible': focusRingSx,
            }}
          >
            <Box sx={{ display: 'grid', placeItems: 'center', width: size, height: size, filter: o.locked ? 'grayscale(0.55)' : undefined }}>
              {o.render}
            </Box>
            {!o.hideLabel && (
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.2, textAlign: 'center', color: 'text.primary' }}>
                {o.label}
              </Typography>
            )}
            {o.locked && o.price != null && (
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                <SeedAmount value={o.price} size={13} />
              </Typography>
            )}
            {checked && (
              <Box aria-hidden="true" sx={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center' }}>
                <CheckRounded sx={{ fontSize: 15 }} />
              </Box>
            )}
            {o.locked && (
              <Box aria-hidden="true" sx={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', bgcolor: 'action.selected', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
                <LockRounded sx={{ fontSize: 13 }} />
              </Box>
            )}
          </ButtonBase>
        )
      })}
    </Box>
  )
}
