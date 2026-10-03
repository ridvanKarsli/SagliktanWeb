import { Button, IconButton, Stack, TextField } from '@mui/material'
import { AddRounded, RemoveCircleOutlineRounded } from '@mui/icons-material'
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS, POLL_OPTION_MAX } from './postComposerConfig.js'

// Anket seçenekleri: 2-6 metin alanı, seçenek ekle/kaldır.
// onChange bir state setter'ı gibi fonksiyonel güncelleme alır.
export default function PollOptionsEditor({ options, onChange }) {
  const setOption = (index, text) => onChange(prev => prev.map((o, j) => (j === index ? text.slice(0, POLL_OPTION_MAX) : o)))
  const removeOption = (index) => onChange(prev => prev.filter((_, j) => j !== index))
  const addOption = () => onChange(prev => [...prev, ''])

  return (
    <Stack spacing={1}>
      {options.map((opt, i) => (
        <Stack key={i} direction="row" spacing={0.5} alignItems="center">
          <TextField
            size="small"
            fullWidth
            value={opt}
            onChange={e => setOption(i, e.target.value)}
            placeholder={`Seçenek ${i + 1}`}
            slotProps={{ htmlInput: { maxLength: POLL_OPTION_MAX, 'aria-label': `Seçenek ${i + 1}`, 'data-testid': `poll-option-${i}` } }}
          />
          {options.length > POLL_MIN_OPTIONS && (
            <IconButton aria-label={`Seçenek ${i + 1}'i kaldır`} onClick={() => removeOption(i)} sx={{ width: 40, height: 40 }}>
              <RemoveCircleOutlineRounded fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ))}
      {options.length < POLL_MAX_OPTIONS && (
        <Button size="small" startIcon={<AddRounded />} onClick={addOption} sx={{ alignSelf: 'flex-start', minHeight: 36 }}>
          Seçenek ekle
        </Button>
      )}
    </Stack>
  )
}
