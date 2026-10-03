import { useEffect, useState } from 'react'

// Değer `delay` ms boyunca değişmeden kalınca güncellenen kopyasını döner -
// arama kutularında her tuş vuruşunda istek atmamak için.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
