import { Autocomplete, TextField } from '@mui/material'
import { TR_CITIES } from '../../utils/communityProfile.js'

// Türkçe büyük/küçük harfe duyarsız; önce "ile başlayanlar", sonra "içerenler".
function filterCities(options, { inputValue }) {
  const q = (inputValue || '').trim().toLocaleLowerCase('tr')
  if (!q) return options
  const starts = []
  const contains = []
  for (const o of options) {
    const l = o.toLocaleLowerCase('tr')
    if (l.startsWith(q)) starts.push(o)
    else if (l.includes(q)) contains.push(o)
  }
  return [...starts, ...contains].slice(0, 8)
}

// Yaşadığı şehir: 81 il listesinden seçilebilir ya da serbest yazılabilir
// (ilçe, yurt dışı vb.). Her zaman isteğe bağlı.
export default function CityField({ value, onChange, label = 'Yaşadığın şehir (isteğe bağlı)', helperText, size, testId }) {
  return (
    <Autocomplete
      freeSolo
      options={TR_CITIES}
      filterOptions={filterCities}
      value={value || ''}
      inputValue={value || ''}
      onInputChange={(_, city) => onChange((city || '').slice(0, 60))}
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText}
          autoComplete="address-level2"
          slotProps={{ htmlInput: { ...params.inputProps, maxLength: 60, ...(testId ? { 'data-testid': testId } : {}) } }}
        />
      )}
    />
  )
}
