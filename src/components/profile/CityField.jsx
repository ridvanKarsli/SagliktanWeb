import { useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { TR_CITIES } from '../../utils/communityProfile.js'
import { filterPrefixFirst, LIMITS, matchCity, normalizeCity } from '../../utils/validation.js'

const filterCities = (options, { inputValue }) => filterPrefixFirst(options, inputValue)

// Yaşadığı şehir: YALNIZCA Türkiye'nin 81 ilinden biri seçilebilir (serbest
// metin yok - backend listede olmayan değeri reddeder, bkz. TurkishCities).
// Yazdıkça Türkçe duyarlı süzülür ("izmir", "IZMIR", "canakkale" de bulur);
// ile başlayanlar önce. Değer her zaman '' ya da geçerli bir il; kayıtlı
// değer listede yoksa boş sayılır. Her zaman isteğe bağlı.
export default function CityField({
  value, onChange, label = 'Yaşadığın şehir (isteğe bağlı)', helperText, size, testId,
  error = false, inputRef, onBlur
}) {
  const selected = normalizeCity(value) || null
  const [inputValue, setInputValue] = useState(selected || '')
  const [lastSelected, setLastSelected] = useState(selected)
  // Değer dışarıdan değişince (ör. "Vazgeç") yazılan metni de eşitle.
  if (lastSelected !== selected) {
    setLastSelected(selected)
    setInputValue(selected || '')
  }

  // Listeden seçmeden alandan çıkıldıysa ve yazılan metin bir ilin adıysa
  // ("istanbul") onu seç; değilse metin seçili değere geri döner.
  const handleBlur = (e) => {
    const typed = inputValue.trim()
    if (typed && typed !== selected) {
      const match = matchCity(typed)
      if (match) onChange(match)
    }
    onBlur?.(e)
  }

  return (
    <Autocomplete
      options={TR_CITIES}
      filterOptions={filterCities}
      value={selected}
      onChange={(_, city) => onChange(city || '')}
      inputValue={inputValue}
      onInputChange={(_, text) => setInputValue((text || '').slice(0, LIMITS.CITY_MAX))}
      autoHighlight
      openOnFocus
      handleHomeEndKeys
      size={size}
      noOptionsText="Şehir bulunamadı"
      clearText="Temizle"
      openText="Listeyi aç"
      closeText="Listeyi kapat"
      slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
      // Mobilde üzerine gelme (hover) yok: temizle düğmesi seçim varken hep görünsün.
      sx={{ '& .MuiAutocomplete-clearIndicator': { visibility: selected ? 'visible' : undefined } }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText}
          error={error}
          inputRef={inputRef}
          onBlur={handleBlur}
          placeholder="İl seç ya da yazmaya başla"
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              maxLength: LIMITS.CITY_MAX,
              autoComplete: 'address-level1',
              autoCapitalize: 'words',
              autoCorrect: 'off',
              spellCheck: false,
              enterKeyHint: 'done',
              ...(testId ? { 'data-testid': testId } : {})
            }
          }}
        />
      )}
    />
  )
}
