// Gün dilimi ve hava (game-spec EK v1.1 §D). Saf JS, deterministik: aynı an
// herkes için aynı sonuç. Saat dilimi Europe/Istanbul.

export const TIMES_OF_DAY = ['sabah', 'ogle', 'aksam', 'gece']
export const WEATHERS = ['clear', 'partly', 'cloudy', 'rain', 'snow', 'fog']

// Gökyüzü paletleri.
//  top/bottom: arka plan dikey geçişi (ekranın üstü -> altı)
//  tint/tintOpacity: dünyanın üstüne mix-blend-mode: multiply ile serilen ton
//  shadow: gölge opaklığı çarpanı (gece gölgeler zayıflar)
//  lightsOn: fener/pencere/deniz feneri ışıkları (lit prop) açık mı
//  stars: açık havada yıldız çizilsin mi
export const SKY = {
  sabah: { label: 'Sabah', top: '#BFE4F2', bottom: '#FDEBD3', tint: '#FFD9A8', tintOpacity: 0.1, shadow: 0.85, lightsOn: false, stars: false },
  ogle: { label: 'Öğle', top: '#9CD3F1', bottom: '#E3F4F8', tint: '#FFFFFF', tintOpacity: 0, shadow: 1, lightsOn: false, stars: false },
  aksam: { label: 'Akşam', top: '#F2A98A', bottom: '#FCE2C4', tint: '#F29A6B', tintOpacity: 0.16, shadow: 0.7, lightsOn: true, stars: false },
  gece: { label: 'Gece', top: '#18233F', bottom: '#3A4A6E', tint: '#2B3B6B', tintOpacity: 0.36, shadow: 0.35, lightsOn: true, stars: true },
}

// Hava etkileri: bulut yoğunluğu (0..1), yağmur şiddeti (0..1), kar, sis ve ek ton.
export const WEATHER = {
  clear: { label: 'Güneşli', clouds: 0.15, rain: 0, snow: false, fog: false, tint: null, tintOpacity: 0 },
  partly: { label: 'Parçalı bulutlu', clouds: 0.5, rain: 0, snow: false, fog: false, tint: null, tintOpacity: 0 },
  cloudy: { label: 'Bulutlu', clouds: 0.9, rain: 0, snow: false, fog: false, tint: '#8C9AA6', tintOpacity: 0.12 },
  rain: { label: 'Yağmurlu', clouds: 1, rain: 0.7, snow: false, fog: false, tint: '#6F8494', tintOpacity: 0.18 },
  snow: { label: 'Karlı', clouds: 0.8, rain: 0, snow: true, fog: false, tint: '#C9D6E6', tintOpacity: 0.12 },
  fog: { label: 'Sisli', clouds: 0.3, rain: 0, snow: false, fog: true, tint: '#DCE3E6', tintOpacity: 0.14 },
}

function istanbulParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t) => Number(parts.find((p) => p.type === t)?.value)
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour') }
}

// sabah 06–11, ogle 11–17, aksam 17–20, gece 20–06
export function timeOfDayAt(date = new Date()) {
  const { h } = istanbulParts(date)
  if (h >= 6 && h < 11) return 'sabah'
  if (h >= 11 && h < 17) return 'ogle'
  if (h >= 17 && h < 20) return 'aksam'
  return 'gece'
}

function hash32(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // karıştır (mulberry32 son adımı)
  h = Math.imul(h ^ (h >>> 15), h | 1)
  h ^= h + Math.imul(h ^ (h >>> 7), h | 61)
  return ((h ^ (h >>> 14)) >>> 0) / 4294967296
}

const SEASON_ODDS = {
  winter: { clear: 0.3, partly: 0.24, cloudy: 0.2, rain: 0.14, snow: 0.12 },
  spring: { clear: 0.42, partly: 0.3, cloudy: 0.14, rain: 0.14 },
  summer: { clear: 0.66, partly: 0.24, cloudy: 0.07, rain: 0.03 },
  autumn: { clear: 0.36, partly: 0.3, cloudy: 0.16, rain: 0.18 },
}

function season(m) {
  if (m === 12 || m <= 2) return 'winter'
  if (m <= 5) return 'spring'
  if (m <= 8) return 'summer'
  return 'autumn'
}

// Her 3 saatlik dilim için (tarih + dilim) tohumlu hava. Kar yalnızca Ara–Şub,
// sis yalnızca sabah.
export function weatherAt(date = new Date()) {
  const { y, m, d, h } = istanbulParts(date)
  const slot = Math.floor(h / 3)
  const key = `${y}-${m}-${d}#${slot}`
  const s = season(m)
  const tod = timeOfDayAt(date)
  if (tod === 'sabah' && hash32(`${key}:fog`) < (s === 'summer' ? 0.04 : 0.12)) return 'fog'
  let r = hash32(key)
  for (const [w, p] of Object.entries(SEASON_ODDS[s])) {
    if (r < p) return w
    r -= p
  }
  return 'clear'
}

// Gün dilimi + hava -> çizim için tek nesne.
export function atmosphereFor(timeOfDay = 'ogle', weather = 'clear') {
  const sky = SKY[timeOfDay] || SKY.ogle
  const w = WEATHER[weather] || WEATHER.clear
  return {
    timeOfDay,
    weather,
    skyTop: sky.top,
    skyBottom: sky.bottom,
    tint: sky.tint,
    tintOpacity: sky.tintOpacity,
    weatherTint: w.tint,
    weatherTintOpacity: w.tintOpacity,
    shadow: sky.shadow * (w.clouds > 0.8 ? 0.6 : 1),
    lightsOn: sky.lightsOn || (w.rain > 0 && timeOfDay !== 'ogle'),
    stars: sky.stars && w.clouds < 0.6,
    clouds: w.clouds,
    rain: w.rain,
    snow: w.snow,
    fog: w.fog,
  }
}
