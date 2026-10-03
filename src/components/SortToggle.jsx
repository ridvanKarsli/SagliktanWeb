import { ToggleButton, ToggleButtonGroup } from '@mui/material'

// Akışlardaki "Yeni / Popüler" sıralama anahtarı (backend: sort=recent|popular).
export default function SortToggle({ value, onChange, sx }) {
  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      aria-label="Sıralama"
      sx={sx}
    >
      <ToggleButton value="recent">Yeni</ToggleButton>
      <ToggleButton value="popular">Popüler</ToggleButton>
    </ToggleButtonGroup>
  )
}
