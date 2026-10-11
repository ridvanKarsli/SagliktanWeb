// Oyun durumu: profil, katalog, hediye sayacı, gerçek zamanlı olay yolu ve
// ekran okuyucu duyuruları. Sık değişen dünya durumu (oyuncu konumları)
// BURADA DEĞİL - WorldScreen ve sahne motorunda yaşar; bu bağlam yalnızca
// seyrek değişen verileri taşır ki HUD her adımda yeniden çizilmesin.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { acquireRealtimeConnection, subscribeRealtime, onRealtimeStatus } from '../../services/realtimeSocket.js'
import { isAbortError } from '../../services/api.js'
import { visuallyHidden } from '../../utils/visuallyHidden.js'
import * as api from '../api/gameApi.js'
import { FALLBACK_CATALOG, indexCatalog } from '../data/catalog.js'

const GameContext = createContext(null)

const initial = {
  status: 'loading', // loading | needsProfile | ready | error
  error: null,
  profile: null,
  catalog: indexCatalog(FALLBACK_CATALOG),
}

function reducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return { ...state, status: action.profile ? 'ready' : 'needsProfile', profile: action.profile, error: null }
    case 'error':
      return { ...state, status: 'error', error: action.error }
    case 'catalog':
      return { ...state, catalog: indexCatalog(action.catalog) }
    case 'profile':
      return { ...state, profile: action.profile, status: action.profile ? 'ready' : state.status }
    case 'patch':
      return state.profile ? { ...state, profile: { ...state.profile, ...action.patch } } : state
    case 'giftArrived':
      return state.profile ? { ...state, profile: { ...state.profile, unseenGifts: (state.profile.unseenGifts || 0) + 1 } } : state
    default:
      return state
  }
}

const GAME_DEST = '/user/queue/game'

export function GameProvider({ children }) {
  const { token } = useAuth()
  const { showInfo } = useNotification()
  const [state, dispatch] = useReducer(reducer, initial)
  const listeners = useRef(new Set())
  const statusListeners = useRef(new Set())
  const liveRef = useRef(null)
  const lastAnnounce = useRef(0)
  const pendingAnnounce = useRef(null)
  const announceTimer = useRef(0)
  const catalogRef = useRef(state.catalog)
  catalogRef.current = state.catalog
  // dünyaya dönüşte nereden devam edileceği (oda ziyareti sonrası)
  const returnTo = useRef(null)
  // Topluluk nabzı (bölüm binalarının tabelaları) ve kendi bahçem: oturum boyunca önbellek
  const [pulse, setPulse] = useState(null)
  const pulseAt = useRef(0)
  const pulseInflight = useRef(null)
  const [myGarden, setMyGarden] = useState(null)

  // Nabız en fazla 60 sn'de bir tazelenir (sunucu da kişi başı 60 sn önbellekler)
  const loadPulse = useCallback((force = false) => {
    if (!force && Date.now() - pulseAt.current < 60000) return Promise.resolve()
    if (pulseInflight.current) return pulseInflight.current
    pulseInflight.current = api.getPulse(token)
      .then((p) => { if (p) { setPulse(p); pulseAt.current = Date.now() } })
      // nabız ikincil: gelmezse tabelalar sayısız görünür
      .catch(() => {})
      .finally(() => { pulseInflight.current = null })
    return pulseInflight.current
  }, [token])

  const loadMyGarden = useCallback(() => {
    if (myGardenLoaded.current) return
    myGardenLoaded.current = true
    api.getMyRoom(token)
      .then((r) => setMyGarden(r?.garden || { flowers: 0, lanterns: 0 }))
      .catch(() => { myGardenLoaded.current = false }) // bahçe ikincil: bir dahaki sefere yeniden dener
  }, [token])
  const myGardenLoaded = useRef(false)

  // Ekran okuyucu duyurusu: en fazla 4 sn'de bir; arada gelenlerin sonuncusu bekler.
  const announce = useCallback((text) => {
    const flush = (t) => {
      lastAnnounce.current = Date.now()
      if (liveRef.current) {
        liveRef.current.textContent = ''
        // aynı metin art arda okunsun diye bir tık sonra yaz
        setTimeout(() => { if (liveRef.current) liveRef.current.textContent = t }, 30)
      }
    }
    const wait = 4000 - (Date.now() - lastAnnounce.current)
    if (wait <= 0) return flush(text)
    pendingAnnounce.current = text
    if (!announceTimer.current) {
      announceTimer.current = setTimeout(() => {
        announceTimer.current = 0
        const t = pendingAnnounce.current
        pendingAnnounce.current = null
        if (t) flush(t)
      }, wait)
    }
  }, [])
  useEffect(() => () => clearTimeout(announceTimer.current), [])

  const load = useCallback(async (signal) => {
    try {
      const profile = await api.getMe(token, { signal })
      dispatch({ type: 'loaded', profile })
    } catch (err) {
      if (isAbortError(err)) return
      if (err?.status === 404) dispatch({ type: 'loaded', profile: null })
      else dispatch({ type: 'error', error: err?.message || 'Mahalle şu an açılamadı.' })
    }
  }, [token])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    api.getCatalog(token, { signal: ctrl.signal })
      .then((cat) => { if (cat?.clothing) dispatch({ type: 'catalog', catalog: cat }) })
      // katalog gelmezse yerleşik yedek kullanılır (aynı anahtarlar) - sessiz
      .catch(() => {})
    return () => ctrl.abort()
  }, [token, load])

  // Tek paylaşımlı WebSocket'e katıl + oyun kanalına abone ol.
  useEffect(() => {
    if (!token) return undefined
    const release = acquireRealtimeConnection(token)
    const unsub = subscribeRealtime(GAME_DEST, (ev) => {
      if (!ev || !ev.type) return
      if (ev.type === 'GIFT') {
        dispatch({ type: 'giftArrived' })
        const cat = catalogRef.current
        const gift = cat.giftsByKey[ev.giftKey]?.name || 'bir hediye'
        const msg = cat.messagesByKey[ev.messageKey]?.text
        const who = ev.fromNickname || 'Bir komşun'
        showInfo(`${who} sana ${gift.toLocaleLowerCase('tr')} bıraktı${msg ? `: “${msg}”` : ''}`)
        announce(`${who} sana hediye bıraktı`)
      }
      listeners.current.forEach((fn) => { try { fn(ev) } catch (e) { console.error('Mahalle olay dinleyicisi:', e) } })
    })
    const unStatus = onRealtimeStatus((connected) => statusListeners.current.forEach((fn) => fn(connected)))
    return () => { unsub(); unStatus(); release() }
  }, [token, showInfo, announce])

  const onGameEvent = useCallback((fn) => {
    listeners.current.add(fn)
    return () => listeners.current.delete(fn)
  }, [])

  // Bağlantı durumu değişimleri (yeniden bağlanınca dünyaya yeniden katılmak için)
  const onConnection = useCallback((fn) => {
    statusListeners.current.add(fn)
    return () => statusListeners.current.delete(fn)
  }, [])

  const setProfile = useCallback((profile) => dispatch({ type: 'profile', profile }), [])
  const patchProfile = useCallback((patch) => dispatch({ type: 'patch', patch }), [])

  const value = useMemo(() => ({
    token,
    status: state.status,
    error: state.error,
    profile: state.profile,
    catalog: state.catalog,
    reload: () => load(),
    setProfile,
    patchProfile,
    onGameEvent,
    onConnection,
    announce,
    returnTo,
    pulse,
    loadPulse,
    myGarden,
    setMyGarden,
    loadMyGarden,
  }), [token, state, load, setProfile, patchProfile, onGameEvent, onConnection, announce, pulse, loadPulse, myGarden, loadMyGarden])

  return (
    <GameContext.Provider value={value}>
      {children}
      <Box ref={liveRef} aria-live="polite" role="status" sx={visuallyHidden} />
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame, GameProvider içinde kullanılmalı')
  return ctx
}

// Sahip olunan eşya adedi (kıyafet: 0/1, mobilya: adet)
export function ownedCount(profile, key) {
  return profile?.ownedItems?.find((i) => i.itemKey === key)?.quantity || 0
}
