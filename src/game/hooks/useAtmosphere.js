// Gün dilimi + hava (EK v1.1 §D): İstanbul saatine göre herkes için aynı,
// dakikada bir tazelenir. Görsel test için `?atmo=gece:rain` yalnızca
// geliştirme derlemesinde ya da görsel test betiği (window.__SG_HARNESS__)
// altında dikkate alınır; üretimde yok sayılır.
import { useEffect, useState } from 'react'
import { atmosphereFor, timeOfDayAt, weatherAt, TIMES_OF_DAY, WEATHERS } from '../art/index.js'

function forcedAtmo() {
  if (typeof window === 'undefined') return null
  if (!import.meta.env.DEV && !window.__SG_HARNESS__) return null
  try {
    const raw = new URLSearchParams(window.location.search).get('atmo')
    if (!raw) return null
    const [t, w] = raw.split(':')
    return { timeOfDay: TIMES_OF_DAY.includes(t) ? t : null, weather: WEATHERS.includes(w) ? w : null }
  } catch {
    return null
  }
}

function compute() {
  const now = new Date()
  const f = forcedAtmo()
  const timeOfDay = f?.timeOfDay || timeOfDayAt(now)
  const weather = f?.weather || weatherAt(now)
  return { key: `${timeOfDay}:${weather}`, ...atmosphereFor(timeOfDay, weather) }
}

export function useAtmosphere() {
  const [atmo, setAtmo] = useState(compute)
  useEffect(() => {
    const id = setInterval(() => {
      const next = compute()
      // yalnızca değişince yeni nesne: üst bileşenler boşuna çizilmesin
      setAtmo((cur) => (cur.key === next.key ? cur : next))
    }, 60000)
    return () => clearInterval(id)
  }, [])
  return atmo
}

export const WEATHER_LABELS = { clear: 'Güneşli', partly: 'Parçalı bulutlu', cloudy: 'Bulutlu', rain: 'Yağmurlu', snow: 'Karlı', fog: 'Sisli' }
export const TIME_LABELS = { sabah: 'Sabah', ogle: 'Öğle', aksam: 'Akşam', gece: 'Gece' }
