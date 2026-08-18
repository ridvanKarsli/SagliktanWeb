import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Kişiselleştirme: yazı boyutu ölçeği + yüksek kontrast tercihi. Kronik/nadir
// hastalıklarla yaşayan kullanıcı kitlesinde görme yorgunluğu/zorluğu yaygın
// (bkz. theme.js'teki tipografi ölçeği notu) - bu context o niyeti bir adım
// öteye taşıyıp kullanıcıya kontrol veriyor. Yalnızca bu cihazda saklanır.
const STORAGE_KEY = 'sagliktan:accessibility'

const FONT_SCALES = {
  small: { label: 'Küçük', rootFontSize: '93.75%' },   // ~15px taban
  medium: { label: 'Orta', rootFontSize: '100%' },      // ~16px taban (varsayılan)
  large: { label: 'Büyük', rootFontSize: '112.5%' },    // ~18px taban
}

// Faz6: themeMode ('dark' | 'light') - bkz. theme.js'teki buildTheme notu.
// Aynı localStorage anahtarı/deseni kullanılıyor, fontScale/highContrast ile
// birlikte tek bir tercih objesi olarak saklanıyor.
const DEFAULT_STATE = { fontScale: 'medium', highContrast: false, themeMode: 'dark' }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return {
      fontScale: FONT_SCALES[parsed.fontScale] ? parsed.fontScale : 'medium',
      highContrast: !!parsed.highContrast,
      themeMode: parsed.themeMode === 'light' ? 'light' : 'dark',
    }
  } catch {
    return DEFAULT_STATE
  }
}

const AccessibilityContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage kullanılamıyor olabilir - tercih sadece bu oturumda geçerli olur
    }
    document.documentElement.style.fontSize = FONT_SCALES[state.fontScale].rootFontSize
    document.documentElement.dataset.contrast = state.highContrast ? 'high' : 'normal'
    document.documentElement.dataset.theme = state.themeMode
    // Mobil tarayıcı adres çubuğu/durum çubuğu rengi (PWA'da da kullanılıyor,
    // bkz. manifest.webmanifest theme_color) - temayla uyumsuz kalırsa
    // sistem çubuğu ile sayfa arasında göze batan bir renk sıçraması olur.
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', state.themeMode === 'light' ? '#FAF8F5' : '#1E1A16')
    }
  }, [state])

  const value = useMemo(() => ({
    fontScale: state.fontScale,
    highContrast: state.highContrast,
    themeMode: state.themeMode,
    fontScaleOptions: FONT_SCALES,
    setFontScale: (fontScale) => setState(s => ({ ...s, fontScale })),
    setHighContrast: (highContrast) => setState(s => ({ ...s, highContrast })),
    setThemeMode: (themeMode) => setState(s => ({ ...s, themeMode })),
  }), [state])

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility, AccessibilityProvider içinde kullanılmalı')
  return ctx
}
