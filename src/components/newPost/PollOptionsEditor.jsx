import { Button, FormHelperText, IconButton, Stack, TextField } from '@mui/material'
import { AddRounded, RemoveCircleOutlineRounded } from '@mui/icons-material'
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS, POLL_OPTION_MAX } from './postComposerConfig.js'
import { clampLength, counterText } from '../../utils/validation.js'

// Anket seçenekleri: 2-6 metin alanı, seçenek ekle/kaldır.
// onChange bir state setter'ı gibi fonksiyonel güncelleme alır.
// errors: seçenek başına hata metni (tekrar, uzunluk); showErrors false iken
// yalnızca dokunulmuş (blur) alanların hatası görünür. generalError: "en az
// 2 seçenek" gibi listenin geneline ait hata. inputRef(i): odak için ref.
export default function PollOptionsEditor({
  options, onChange, errors = [], touched = {}, onTouch, showErrors = false, generalError = null, inputRef
}) {
  const setOption = (index, text) => onChange(prev => prev.map((o, j) => (j === index ? clampLength(text, POLL_OPTION_MAX) : o)))
  const removeOption = (index) => onChange(prev => prev.filter((_, j) => j !== index))
  const addOption = () => onChange(prev => [...prev, ''])
  // Yeni seçenek yalnızca mevcutların hepsi doluysa eklenebilir (boş alan birikmesin).
  const canAdd = options.length < POLL_MAX_OPTIONS && options.every(o => o.trim())

  return (
    <Stack spacing={1}>
      {options.map((opt, i) => {
        const err = (showErrors || touched[i]) ? errors[i] : null
        const counter = counterText(opt, POLL_OPTION_MAX)
        return (
          <Stack key={i} direction="row" spacing={0.5} alignItems="flex-start">
            <TextField
              fullWidth
              value={opt}
              onChange={e => setOption(i, e.target.value)}
              onBlur={() => onTouch?.(i)}
              inputRef={inputRef ? inputRef(i) : undefined}
              placeholder={`Seçenek ${i + 1}`}
              error={!!err}
              helperText={err || counter || undefined}
              slotProps={{
                htmlInput: {
                  maxLength: POLL_OPTION_MAX, enterKeyHint: 'next', autoCapitalize: 'sentences',
                  'aria-label': `Seçenek ${i + 1}`, 'data-testid': `poll-option-${i}`
                },
                formHelperText: { sx: { mx: 0.5 } }
              }}
            />
            {options.length > POLL_MIN_OPTIONS && (
              <IconButton aria-label={`Seçenek ${i + 1}'i kaldır`} onClick={() => removeOption(i)} sx={{ width: 40, height: 40 }}>
                <RemoveCircleOutlineRounded fontSize="small" />
              </IconButton>
            )}
          </Stack>
        )
      })}
      {generalError && <FormHelperText error sx={{ mx: 0.5, mt: 0 }}>{generalError}</FormHelperText>}
      {options.length < POLL_MAX_OPTIONS && (
        <Button size="small" startIcon={<AddRounded />} onClick={addOption} disabled={!canAdd} sx={{ alignSelf: 'flex-start', minHeight: 36 }}>
          Seçenek ekle
        </Button>
      )}
    </Stack>
  )
}
