// Dünya oturumu: bölgeye katıl, 25 sn'de bir kalp atışı, ayrıl. Sunucu bizi
// düşürmüşse (move/say/heartbeat 404) ya da WebSocket yeniden bağlandıysa
// yeniden katılıp anlık görüntüyle durumu tazeler. Sekme 60 sn'den uzun
// arka planda kalırsa ayrılır, görünür olunca geri katılır.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'

const HEARTBEAT_MS = 25000
const HIDDEN_LEAVE_MS = 60000
const LEAVE_DELAY_MS = 400

// Dünyadan çıkış kısa bir gecikmeyle yapılır: dünya ekranı hemen yeniden
// açılırsa (StrictMode'un çift effect'i, odadan hızlı dönüş) "ayrıl" isteği
// yeni "katıl"ın ardından sunucuya varıp bizi düşürmesin.
let pendingLeave = 0

// zoneKey: alan anahtarı - bölge ("meydan") ya da ev ("room:{ownerPublicId}").
// joinFn(area, { spawn }): katılım isteği (varsayılan bölge katılımı).
// onJoinError(err, reason): katılım hatası (409 dolu, 404 kapalı ev...) - çağıran karar verir.
export function useWorldSession({ zoneKey, getSpawn, onSnapshot, onEvent, joinFn, onJoinError }) {
  const { token, onGameEvent, onConnection } = useGame()
  const [status, setStatus] = useState('joining') // joining | online | error
  const [errorMessage, setErrorMessage] = useState(null)
  const handlers = useRef({ getSpawn, onSnapshot, onEvent, joinFn, onJoinError })
  useEffect(() => { handlers.current = { getSpawn, onSnapshot, onEvent, joinFn, onJoinError } }, [getSpawn, onSnapshot, onEvent, joinFn, onJoinError])
  // Önceden yapılmış katılım (bölge geçişinde 409 kontrolü için çağıran önce katılır)
  const seeded = useRef(null)
  const zoneRef = useRef(zoneKey)
  const instanceRef = useRef(null)
  const joinedRef = useRef(null)
  const hiddenLeft = useRef(false)
  const seq = useRef(0)

  const join = useCallback(async (reason) => {
    const zone = zoneRef.current
    if (!zone) return // alan henüz belli değil (ör. oda verisi yükleniyor)
    const my = ++seq.current
    if (reason === 'enter') setStatus('joining')
    try {
      let r
      if (reason === 'enter' && seeded.current?.zone === zone) {
        r = seeded.current.response
        seeded.current = null
      } else {
        // doğma ipucu: girişte kapının toSpawn'ı, yeniden katılımda son konum
        const spawn = handlers.current.getSpawn?.(reason) || null
        const fn = handlers.current.joinFn || ((area, o) => api.joinZone(token, area, o))
        r = await fn(zone, { spawn })
      }
      if (my !== seq.current || zoneRef.current !== zone) return
      instanceRef.current = r?.instance ?? null
      // olaylardaki alan anahtarı sunucunun döndürdüğüdür ("room:abc" gibi)
      joinedRef.current = r?.zone || zone
      hiddenLeft.current = false
      setErrorMessage(null)
      handlers.current.onSnapshot?.(r || { players: [] }, reason)
      setStatus('online')
    } catch (err) {
      if (my !== seq.current) return
      console.warn('Mahalle: alana katılınamadı', err?.message)
      setErrorMessage(err?.status === 409 ? err.message : null)
      setStatus('error')
      handlers.current.onJoinError?.(err, reason)
    }
  }, [token])

  // 404 = "bir bölgede değilsin": yeniden katıl. Diğer hatalar çağırana.
  const call = useCallback(async (fn) => {
    try {
      return await fn()
    } catch (err) {
      if (api.isNotInWorld(err)) {
        join('rejoin')
        return null
      }
      throw err
    }
  }, [join])

  // Bölge değişti: yeni bölgeye katıl (sunucu eskisinden otomatik çıkarır).
  useEffect(() => {
    zoneRef.current = zoneKey
    clearTimeout(pendingLeave)
    join('enter')
  }, [zoneKey, join])

  // Ekran kapanınca ayrıl; sekme kapanırken keepalive ile.
  useEffect(() => {
    const onHide = () => api.leaveWorldKeepalive(token)
    const joins = seq // ekran kapanınca yarım kalan katılım cevabı yok sayılsın
    window.addEventListener('pagehide', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
      joins.current++
      clearTimeout(pendingLeave)
      pendingLeave = setTimeout(() => {
        // ayrılma başarısızsa sunucu 70 sn sonra kendisi düşürür
        api.leaveWorld(token).catch(() => {})
      }, LEAVE_DELAY_MS)
    }
  }, [token])

  // Kalp atışı
  useEffect(() => {
    const id = setInterval(() => {
      if (hiddenLeft.current) return
      api.heartbeat(token).catch((err) => {
        if (api.isNotInWorld(err)) join('rejoin')
        // diğer kalp atışı hataları geçici ağ sorunları: bir sonraki atış dener
      })
    }, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [token, join])

  // Arka plan: 60 sn'den uzun gizliyse ayrıl, dönünce katıl
  useEffect(() => {
    let timer = 0
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        timer = setTimeout(() => {
          hiddenLeft.current = true
          api.leaveWorld(token).catch(() => {}) // önemsiz: sunucu zaman aşımıyla da düşürür
        }, HIDDEN_LEAVE_MS)
      } else {
        clearTimeout(timer)
        if (hiddenLeft.current) join('rejoin')
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); clearTimeout(timer) }
  }, [token, join])

  // WebSocket koptu ve geri geldi: kaçan olaylar için anlık görüntüyü tazele
  useEffect(() => {
    let everConnected = false
    let prev = null
    return onConnection((connected) => {
      // ilk bağlanış değil, KOPUP geri gelme: aradaki olaylar kaçmış olabilir
      if (connected && prev === false && everConnected && joinedRef.current) join('rejoin')
      if (connected) everConnected = true
      prev = connected
    })
  }, [onConnection, join])

  // Olaylar: yalnızca bulunduğum bölge örneğine ait olanlar
  useEffect(() => onGameEvent((ev) => {
    if (ev.type === 'GIFT') return
    if (ev.zone && ev.zone !== joinedRef.current) return
    if (ev.instance != null && instanceRef.current != null && ev.instance !== instanceRef.current) return
    handlers.current.onEvent?.(ev)
  }), [onGameEvent])

  // Bölge geçişinde çağıran önceden katıldıysa (409 kontrolü) sonucu bir kez kullan
  const seed = useCallback((zone, response) => { seeded.current = { zone, response } }, [])

  return { status, errorMessage, call, rejoin: () => join('rejoin'), instance: instanceRef, seed }
}
