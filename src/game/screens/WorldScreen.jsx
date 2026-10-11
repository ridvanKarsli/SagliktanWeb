// Açık dünya: bölge sahnesi, oyuncular, konuşma, kapılar, HUD ve sayfalar.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Button, ButtonBase, Typography } from '@mui/material'
import {
  CottageRounded, ForumRounded, GroupsRounded, MapRounded, PeopleAltRounded, RedeemRounded, SignpostRounded,
} from '@mui/icons-material'
import { ZoneEdge } from '../art/index.js'
import LeafBurst from '../../components/celebration/LeafBurst.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { focusRingSx } from '../../design/focus.js'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import { ZONES } from '../world/zones.js'
import { StageEngine } from '../engine/StageEngine.js'
import { setupFor, cellMeaning } from '../engine/zoneSetup.js'
import Stage from '../render/Stage.jsx'
import { TileLayer, TapMarker } from '../render/layers.jsx'
import { Actor } from '../render/Actor.jsx'
import { prefersReducedMotion } from '../render/gameStyles.js'
import { useWorldSession } from '../hooks/useWorldSession.js'
import { useAtmosphere } from '../hooks/useAtmosphere.js'
import { useViewportSize } from '../hooks/useViewportSize.js'
import { SkyLayer, WeatherLayer } from '../render/AtmosphereLayers.jsx'
import { AtmoPill } from '../hud/AtmoPill.jsx'
import ActionSheet from '../sheets/ActionSheet.jsx'
import { worldActions, seatsOf, seatApproach, bestApproach, faceToward, fxPointOf, PROP_NAMES } from '../engine/interactions.js'
import { propCells } from '../world/zones.js'
import { FX } from '../art/index.js'
import { TopHud, BottomBar, ZoomControls, RoundButton } from '../hud/Hud.jsx'
import { pillSx } from '../hud/hudStyle.js'
import { SpeechSheet, PlayersHereSheet, ZoneMapSheet } from '../sheets/WorldSheets.jsx'
import PlayerCardSheet from '../sheets/PlayerCardSheet.jsx'
import GiftSendSheet from '../sheets/GiftSendSheet.jsx'
import GiftInboxSheet from '../sheets/GiftInboxSheet.jsx'
import NeighborsSheet from '../sheets/NeighborsSheet.jsx'
import SettingsSheet from '../sheets/SettingsSheet.jsx'
import ShopSheet from '../sheets/ShopSheet.jsx'

const ZOOMS = [0.55, 0.7, 0.85, 1, 1.2, 1.45, 1.75]
const TAP_THROTTLE_MS = 250
const BUBBLE_MS = 5000
const LAST_ZONE_KEY = 'sagliktan:mahalle:last-zone'
const ITEM_FX_MS = 4500
// akşam/gece ışıkları yanan dünya nesneleri
const LIT_KEYS = new Set(['lamp_post', 'house_a', 'house_b', 'house_c', 'house_d', 'tea_kiosk', 'lighthouse_small'])
const seatId = (obj, seat) => `${obj.key}@${obj.x},${obj.y}#${seat.index}`
const HINT_KEY = 'sagliktan:mahalle:hint-seen'

const store = {
  get(k) { try { return localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* gizli sekme: yalnızca bu oturum */ } },
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const omit = (obj, key) => {
  const next = { ...obj }
  delete next[key]
  return next
}

function defaultZoomIndex() {
  if (typeof window === 'undefined') return 3
  return window.innerWidth >= 900 ? 4 : 3
}

// İlk kez gelenlere tabela kartı: alt çubuğun hemen üstünde durur ve
// kamerayı kart yüksekliğinin yarısı kadar kaydırır ki karakter (ekran
// ortası) kartın altında kalmasın - küçük telefonlarda da.
function WelcomeCard({ engine, onDismiss }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const apply = () => engine.setFocusOffset(Math.round(el.offsetHeight / 2 + 24))
    apply()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null
    ro?.observe(el)
    return () => { ro?.disconnect(); engine.setFocusOffset(0) }
  }, [engine])
  return (
    <Box
      ref={ref}
      role="region" aria-label="Meydan tabelası"
      sx={{
        ...pillSx, position: 'absolute', zIndex: 6, left: 0, right: 0, mx: 'auto',
        bottom: 'calc(env(safe-area-inset-bottom) + 5.2rem)', borderRadius: '20px', p: 1.75,
        width: 'min(calc(100vw - 1.2rem), 440px)',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        <SignpostRounded sx={{ color: '#A07250', fontSize: '1.8rem', mt: 0.25 }} aria-hidden="true" />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', mb: 0.25 }}>Mahalleye hoş geldin!</Typography>
          <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.4, mb: 1 }}>
            Bir yere dokun, oraya yürü. Kemerli kapılar Park, Çarşı, Sahil ve Mahalle sokağına çıkar; evin sokaktaki ilk kapı.
          </Typography>
          <Button variant="contained" onClick={onDismiss} sx={{ minHeight: 44, borderRadius: 999, fontWeight: 800 }}>Anladım</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default function WorldScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, profile, catalog, patchProfile, announce, returnTo } = useGame()
  const { showSuccess, showInfo, showError } = useNotification()
  const me = profile.publicId
  const [reduced] = useState(prefersReducedMotion)

  // Başlangıç: odadan dönüşte kaldığın yer; yoksa son bölge; yoksa Meydan.
  const [start] = useState(() => {
    const r = location.state?.world || returnTo.current
    const last = store.get(LAST_ZONE_KEY)
    const zone = r?.zone && ZONES[r.zone] ? r.zone : (last && ZONES[last] ? last : 'meydan')
    const spawn = r?.zone === zone && r.x != null ? { x: r.x, y: r.y } : ZONES[zone].spawn
    return { zone, spawn }
  })
  const [engine] = useState(() => {
    const e = new StageEngine({ reducedMotion: reduced })
    e.reset(setupFor(ZONES[start.zone]))
    e.ensure(me, start.spawn.x, start.spawn.y)
    e.setFollow(me)
    return e
  })
  useEffect(() => () => engine.destroy(), [engine])

  const [zoneKey, setZoneKey] = useState(start.zone)
  const zoneKeyRef = useRef(start.zone)
  zoneKeyRef.current = zoneKey
  const zone = ZONES[zoneKey]
  const setup = setupFor(zone)
  const zoneName = catalog.zonesByKey[zoneKey]?.name || zone.name
  const spawnRef = useRef(start.spawn)
  const [players, setPlayers] = useState({})
  const posRef = useRef({})
  const [bubbles, setBubbles] = useState({})
  const [hops, setHops] = useState({})
  const [marker, setMarker] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [fading, setFading] = useState(false)
  const [zoomIdx, setZoomIdx] = useState(defaultZoomIndex)
  const [zoomFine, setZoomFine] = useState(null)
  const [burst, setBurst] = useState(0)
  const [dailyBusy, setDailyBusy] = useState(false)
  const [hint, setHint] = useState(() => start.zone === 'meydan' && !store.get(HINT_KEY))
  const lastTap = useRef(0)
  const pendingAction = useRef(null)
  const [menu, setMenu] = useState(null) // { obj, actions }
  const [itemFx, setItemFx] = useState([]) // eşya üstü kısa efektler
  const heldTimer = useRef(0)
  const remoteSeats = useRef({}) // publicId -> seatId (dolu yerler)
  const atmo = useAtmosphere()
  const vp = useViewportSize()
  const transitioning = useRef(false)
  const timers = useRef(new Set())
  const bubbleSeq = useRef(0)

  const zoom = zoomFine ?? ZOOMS[zoomIdx]
  useEffect(() => { engine.setZoom(zoom) }, [engine, zoom])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])
  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => { timers.current.delete(id); fn() }, ms)
    timers.current.add(id)
  }, [])

  // ------------------------------------------------------------ balonlar
  const showBubble = useCallback((id, { phraseKey, emoteKey }) => {
    const text = phraseKey ? catalog.phrasesByKey[phraseKey]?.text : null
    if (!text && !emoteKey) return
    const seq = ++bubbleSeq.current
    setBubbles((b) => ({ ...b, [id]: { id: seq, text, emoteKey } }))
    if (emoteKey && !reduced) setHops((h) => ({ ...h, [id]: seq }))
    later(() => setBubbles((b) => (b[id]?.id === seq ? omit(b, id) : b)), BUBBLE_MS)
  }, [catalog, reduced, later])

  // ------------------------------------------------------------ duruşlar
  // Başkasının duruşu: oturuyor/uzanıyorsa ve bir oturma yerinin karesindeyse
  // oraya (aynı ofsetlerle) yerleştir; değilse ayakta göster.
  const applyRemotePose = useCallback((id, p, cell) => {
    if (!p) return
    const posture = p.pose === 'sit' || p.pose === 'lie' ? p.pose : 'stand'
    let seat = null
    delete remoteSeats.current[id]
    if (posture !== 'stand' && cell) {
      const objs = setupFor(ZONES[zoneKeyRef.current]).objects
      for (const o of objs) {
        const cands = seatsOf(o, posture).filter((st) => st.cell.x === cell.x && st.cell.y === cell.y)
        if (!cands.length) continue
        seat = cands.find((st) => st.facing === p.facing) || cands[0]
        remoteSeats.current[id] = seatId(o, seat)
        break
      }
    }
    engine.ensure(id, cell?.x ?? 0, cell?.y ?? 0)
    engine.setPosture(id, seat
      ? { posture, facing: seat.facing, flip: seat.flip, held: p.held || null, seat }
      : { posture: 'stand', facing: p.facing, flip: !!p.flip, held: p.held || null })
  }, [engine])

  // ------------------------------------------------------------ oturum
  const onSnapshot = useCallback((r, reason) => {
    const list = (r.players || []).filter((p) => p.publicId !== me)
    const pos = {}
    for (const p of list) pos[p.publicId] = { x: p.x, y: p.y }
    for (const id of [...engine.actors.keys()]) {
      if (id !== me && !pos[id]) engine.remove(id)
      else if (id !== me) engine.place(id, pos[id].x, pos[id].y)
    }
    posRef.current = pos
    remoteSeats.current = {}
    for (const p of list) if (p.pose && (p.pose !== 'stand' || p.held)) applyRemotePose(p.publicId, p, { x: p.x, y: p.y })
    setPlayers(Object.fromEntries(list.map((p) => [p.publicId, p])))
    // yeniden katılımda kendi duruşumu yeniden bildir (sunucu düşürdüyse kayboldu)
    const mine = engine.poseOf(me)
    if (reason !== 'enter' && mine && (mine.posture !== 'stand' || mine.held)) {
      api.setPose(token, { pose: mine.posture, facing: mine.facing, flip: mine.flip, held: mine.held }).catch(() => {})
    }
    // Konum katılımla birlikte gönderildi (doğma ipucu). Sunucu yine de başka
    // bir yere koyduysa (eski sunucu / sınır dışı) yerel konumu bir kez bildir.
    const cell = reason === 'enter' ? spawnRef.current : (engine.destinationOf(me) || spawnRef.current)
    if (r.me && (r.me.x !== cell.x || r.me.y !== cell.y)) {
      api.moveTo(token, cell.x, cell.y).catch(() => {}) // bir sonraki adımda yine gider
    }
    setFading(false)
    transitioning.current = false
    if (reason === 'enter') announce(list.length ? `${zoneName}. Burada ${list.length} kişi var.` : `${zoneName}. Şu an burada kimse yok.`)
  }, [engine, me, token, announce, zoneName, applyRemotePose])

  const onEvent = useCallback((ev) => {
    const id = ev.publicId
    if (!id || id === me) return
    switch (ev.type) {
      case 'JOIN': {
        const p = { ...(ev.player || {}), publicId: id }
        const x = ev.x ?? p.x ?? 0
        const y = ev.y ?? p.y ?? 0
        posRef.current[id] = { x, y }
        if (engine.has(id)) engine.place(id, x, y)
        if (p.pose && (p.pose !== 'stand' || p.held)) applyRemotePose(id, p, { x, y })
        setPlayers((cur) => ({ ...cur, [id]: { ...p, x, y } }))
        if (p.nickname) announce(`${p.nickname} geldi`)
        break
      }
      case 'MOVE':
        if (ev.x == null || ev.y == null) break
        posRef.current[id] = { x: ev.x, y: ev.y }
        delete remoteSeats.current[id]
        if (engine.has(id)) engine.walkTo(id, ev.x, ev.y)
        // sunucu: hareket duruşu "stand" yapar, eldeki kalır
        setPlayers((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], pose: 'stand' } } : cur))
        break
      case 'POSE': {
        // varış animasyonu bitmeden oturmasın diye hedef kareyi kullan
        const cell = posRef.current[id] || engine.destinationOf(id)
        applyRemotePose(id, { pose: ev.pose, facing: ev.facing, flip: ev.flip, held: ev.held || null }, cell)
        setPlayers((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], pose: ev.pose, held: ev.held || null } } : cur))
        break
      }
      case 'SAY':
        showBubble(id, ev)
        break
      case 'LEAVE':
        delete posRef.current[id]
        delete remoteSeats.current[id]
        engine.remove(id)
        setPlayers((cur) => omit(cur, id))
        break
      case 'LOOK':
        setPlayers((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], ...(ev.player || {}), publicId: id } } : cur))
        break
      default:
    }
  }, [engine, me, showBubble, announce, applyRemotePose])

  const getSpawn = useCallback(
    (reason) => (reason === 'enter' ? spawnRef.current : (engine.destinationOf(me) || spawnRef.current)),
    [engine, me],
  )
  const session = useWorldSession({ zoneKey, getSpawn, onSnapshot, onEvent })

  // ------------------------------------------------------------ geçişler
  const goToZone = useCallback(async (to, spawn) => {
    if (transitioning.current || !ZONES[to]) return
    transitioning.current = true
    setSheet(null)
    setFading(true)
    await wait(reduced ? 120 : 320)
    const target = spawn || ZONES[to].spawn
    engine.reset(setupFor(ZONES[to]))
    engine.ensure(me, target.x, target.y)
    engine.setFollow(me)
    spawnRef.current = target
    posRef.current = {}
    pendingAction.current = null
    remoteSeats.current = {}
    clearTimeout(heldTimer.current)
    setMenu(null)
    setItemFx([])
    setPlayers({})
    setBubbles({})
    setMarker(null)
    setZoneKey(to)
    store.set(LAST_ZONE_KEY, to)
    returnTo.current = { zone: to, ...target }
    // katılım uzun sürerse perdeyi yine de aç
    later(() => { setFading(false); transitioning.current = false }, 2500)
  }, [engine, me, reduced, returnTo, later])

  const openMyRoom = useCallback(() => {
    // dönüşte evin önünde başla
    returnTo.current = zoneKey === 'mahalle' ? { zone: 'mahalle', x: 2, y: 4 } : { zone: zoneKey, ...(engine.cellOf(me) || zone.spawn) }
    navigate('/mahalle/ev')
  }, [navigate, returnTo, zoneKey, engine, me, zone])

  // ------------------------------------------------------------ etkileşimler
  const sendPose = useCallback(() => {
    const p = engine.poseOf(me)
    if (!p) return
    session.call(() => api.setPose(token, { pose: p.posture, facing: p.facing, flip: p.flip, held: p.held }))
      .catch(() => {}) // duruş paylaşımı ikincil: başkaları bir sonraki duruşta görür
  }, [engine, me, session, token])

  const showItemFx = useCallback((obj, fx) => {
    const pt = fxPointOf(obj)
    if (!pt || !FX[fx]) return
    const k = `${obj.key}@${obj.x},${obj.y}:${Date.now()}`
    setItemFx((list) => [...list, { k, sx: pt.sx, sy: pt.sy, fx }])
    later(() => setItemFx((list) => list.filter((f) => f.k !== k)), ITEM_FX_MS)
  }, [later])

  // Varınca: otur/uzan (yer karesini + duruşu bildir) ya da eşyaya dönüp eyle.
  const applyInteraction = useCallback(async (plan, cell) => {
    const { action, obj } = plan
    if (plan.seat) {
      const seat = plan.seat
      engine.setPosture(me, { posture: seat.kind, facing: seat.facing, flip: seat.flip, seat })
      // başkaları beni yer karesinde görsün: önce move (duruşu sıfırlar), sonra pose
      try { await session.call(() => api.moveTo(token, seat.cell.x, seat.cell.y)) } catch { /* bir sonraki adımda düzelir */ }
      sendPose()
      return
    }
    const d = faceToward(cell, plan.target)
    engine.face(me, d.dx, d.dy)
    if (action.held) {
      engine.setPosture(me, { posture: 'stand', held: action.held })
      clearTimeout(heldTimer.current)
      if (action.heldMs) {
        // elde tutulan 60 sn sonra biter (sunucu yalnızca saklar)
        heldTimer.current = setTimeout(() => {
          if (engine.poseOf(me)?.held === action.held) {
            engine.setHeld(me, null)
            sendPose()
          }
        }, action.heldMs)
      }
      sendPose()
    }
    if (action.fx && action.fxAt === 'item') showItemFx(obj, action.fx)
  }, [engine, me, session, token, sendPose, showItemFx])
  useEffect(() => () => clearTimeout(heldTimer.current), [])

  // ------------------------------------------------------------ yürüme
  const handleArrival = useCallback((cell) => {
    setMarker(null)
    returnTo.current = { zone: zoneKey, x: cell.x, y: cell.y }
    const action = pendingAction.current
    pendingAction.current = null
    const m = cellMeaning(zone, cell.x, cell.y)
    if (m?.type === 'portal') return goToZone(m.portal.to, m.portal.toSpawn)
    if (m?.type === 'shop' || action?.type === 'shop') {
      engine.face(me, 0, -1)
      return setSheet({ type: 'shop', tab: m?.tab || action.tab })
    }
    if (m?.type === 'door' || action?.type === 'door') {
      const i = m?.index ?? action.index
      engine.face(me, 0, -1)
      if (i === 0) return openMyRoom()
      return setSheet({ type: 'neighbors' })
    }
    if (action?.type === 'hint') setHint(true)
    if (action?.type === 'interact') applyInteraction(action, cell)
  }, [zone, zoneKey, engine, me, goToZone, openMyRoom, returnTo, applyInteraction])

  const arrivalRef = useRef(handleArrival)
  useEffect(() => { arrivalRef.current = handleArrival }, [handleArrival])
  useEffect(() => {
    engine.onArrive = (id, cell) => { if (id === me) arrivalRef.current(cell) }
    return () => { engine.onArrive = null }
  }, [engine, me])

  const walk = useCallback((x, y, action = null) => {
    pendingAction.current = action
    const dest = engine.walkTo(me, x, y)
    if (!dest) return
    if (!reduced) setMarker({ ...dest, k: Date.now() })
    session.call(() => api.moveTo(token, dest.x, dest.y)).catch((err) => {
      if (err?.status === 429) showInfo('Biraz yavaşlayalım; birazdan yine yürüyebilirsin.')
    })
  }, [engine, me, reduced, session, token, showInfo])

  const onTap = useCallback(({ cell, actorId, objIndex }) => {
    if (actorId && actorId !== me) {
      setSheet({ type: 'player', id: actorId })
      return
    }
    const now = Date.now()
    if (now - lastTap.current < TAP_THROTTLE_MS) return
    lastTap.current = now
    const obj = objIndex != null ? setup.objects[objIndex] : null
    if (obj?.action?.type === 'hint') {
      setHint(true)
      return
    }
    if (obj?.action?.spot) {
      const s = obj.action.spot
      const here = engine.cellOf(me)
      // zaten oradaysa yürümeden aç
      if (here && here.x === s.x && here.y === s.y && engine.destinationOf(me)?.x === s.x) {
        pendingAction.current = obj.action
        return handleArrival(here)
      }
      return walk(s.x, s.y, obj.action)
    }
    if (obj?.interact) {
      setMenu({ obj, actions: worldActions(obj.key) })
      return
    }
    if (cell.x < 0 || cell.y < 0 || cell.x >= zone.width || cell.y >= zone.height) return
    walk(cell.x, cell.y)
  }, [me, setup, engine, walk, zone, handleArrival])

  // Eylem seçildi: oturma yerine ya da eşyanın yanına yürü
  const runWorldAction = (obj, action) => {
    setMenu(null)
    const grid = setup.grid
    const from = engine.cellOf(me)
    let plan = null
    if (action.kind === 'sit' || action.kind === 'lie') {
      const taken = new Set(Object.values(remoteSeats.current))
      for (const seat of seatsOf(obj, action.kind)) {
        if (taken.has(seatId(obj, seat))) continue
        const ap = seatApproach(grid, from, seat)
        if (ap && (!plan || (ap.d ?? 0) < plan.d)) plan = { seat, cell: ap.cell, d: ap.d ?? 0 }
      }
      if (!plan) return showInfo('Burası şu an dolu. Biraz sonra yine bak.')
    } else {
      const ap = bestApproach(grid, from, propCells(obj))
      if (!ap) return showInfo('Yanına geçecek yer yok.')
      plan = { cell: ap.cell, target: ap.target }
    }
    const pend = { type: 'interact', ...plan, action, obj }
    const here = engine.cellOf(me)
    if (here.x === plan.cell.x && here.y === plan.cell.y && engine.destinationOf(me)?.x === here.x && engine.destinationOf(me)?.y === here.y) {
      engine.setPosture(me, { posture: 'stand' })
      applyInteraction(pend, here)
      return
    }
    walk(plan.cell.x, plan.cell.y, pend)
  }

  // Klavye: ok tuşları ekran yönünde iki kare yürütür (erişilebilirlik)
  useEffect(() => {
    const onKey = (e) => {
      if (sheet || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      const d = { ArrowUp: [-1, -1], ArrowDown: [1, 1], ArrowLeft: [-1, 1], ArrowRight: [1, -1] }[e.key]
      if (!d) return
      e.preventDefault()
      const c = engine.destinationOf(me)
      if (!c) return
      const x = Math.max(0, Math.min(zone.width - 1, c.x + d[0]))
      const y = Math.max(0, Math.min(zone.height - 1, c.y + d[1]))
      walk(x, y)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet, engine, me, zone, walk])

  // ------------------------------------------------------------ eylemler
  const say = useCallback((payload) => {
    setSheet(null)
    showBubble(me, payload)
    session.call(() => api.say(token, payload)).catch((err) => {
      showError(err?.status === 429 ? 'Biraz soluklanalım; birazdan yine konuşabilirsin.' : (err?.message || 'Söyleyemedik, tekrar dene.'))
    })
  }, [me, showBubble, session, token, showError])

  const claimDaily = async () => {
    setDailyBusy(true)
    try {
      const r = await api.claimDaily(token)
      patchProfile({ seeds: r.seeds, dailyAvailable: false })
      if (r.granted) {
        setBurst(Date.now())
        showSuccess(`+${r.amount} tohum! Bugün uğradığın için teşekkürler.`)
        announce(`${r.amount} tohum kazandın`)
      } else showInfo('Bugünkü tohumunu zaten almışsın. Yarın yine bekleriz.')
    } catch (err) {
      showError(err?.message || 'Şu an alınamadı, biraz sonra dene.')
    } finally {
      setDailyBusy(false)
    }
  }

  const onBlocked = useCallback((id) => {
    delete posRef.current[id]
    engine.remove(id)
    setPlayers((cur) => omit(cur, id))
  }, [engine])

  const dismissHint = () => {
    setHint(false)
    store.set(HINT_KEY, '1')
  }

  const zoomBy = useCallback((dir) => {
    setZoomFine(null)
    setZoomIdx((i) => Math.max(0, Math.min(ZOOMS.length - 1, i + dir)))
  }, [])
  const onPinchZoom = useCallback((ratio) => {
    setZoomFine((z) => Math.max(ZOOMS[0], Math.min(ZOOMS[ZOOMS.length - 1], (z ?? ZOOMS[zoomIdx]) * ratio)))
  }, [zoomIdx])

  // ------------------------------------------------------------ çizim
  const playerList = useMemo(() => Object.values(players).sort((a, b) => a.nickname?.localeCompare(b.nickname, 'tr')), [players])
  const lit = !!atmo.lightsOn
  const objects = useMemo(
    () => (lit ? setup.objects.map((o) => (LIT_KEYS.has(o.key) ? { ...o, props: { ...o.props, lit: true } } : o)) : setup.objects),
    [setup, lit],
  )
  const fxOverlay = itemFx.length ? (
    <g pointerEvents="none">
      {itemFx.map((f) => {
        const Comp = FX[f.fx]
        return <g key={f.k} transform={`translate(${f.sx} ${f.sy})`}><Comp /></g>
      })}
    </g>
  ) : null
  const tiles = useMemo(() => <TileLayer tiles={zone.tiles} />, [zone])
  const background = useMemo(() => <ZoneEdge tiles={zone.tiles} />, [zone])
  const floor = marker ? <TapMarker key={marker.k} x={marker.x} y={marker.y} /> : null
  const actors = (
    <>
      {playerList.map((p) => (
        <Actor
          key={p.publicId} engine={engine} id={p.publicId}
          x={posRef.current[p.publicId]?.x ?? p.x} y={posRef.current[p.publicId]?.y ?? p.y}
          appearance={p.appearance} petKey={p.petKey} nickname={p.nickname}
          bubble={bubbles[p.publicId]} hop={hops[p.publicId]}
        />
      ))}
      <Actor
        key={me} engine={engine} id={me} x={spawnRef.current.x} y={spawnRef.current.y} me
        appearance={profile.appearance} petKey={profile.petKey} nickname={profile.nickname}
        bubble={bubbles[me]} hop={hops[me]}
      />
    </>
  )

  const cardPlayer = sheet?.type === 'player' ? players[sheet.id] : null
  const close = () => setSheet(null)

  return (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', bgcolor: atmo.skyBottom || zone.ambience?.sky || '#D7EEF3' }}>
      <SkyLayer atmo={atmo} w={vp.w} h={vp.h} />
      <Stage
        key={zoneKey}
        engine={engine}
        objects={objects}
        maxDepth={setup.maxDepth}
        overlay={fxOverlay}
        transparent
        background={background}
        tiles={tiles}
        floor={floor}
        actors={actors}
        onTap={onTap}
        onPinchZoom={onPinchZoom}
        onWheelZoom={zoomBy}
        sky={zone.ambience?.sky}
        ariaLabel={`${zoneName}. Yürümek için bir yere dokun. Buradaki kişiler için “Buradakiler” düğmesini kullan.`}
      />

      <WeatherLayer atmo={atmo} w={vp.w} h={vp.h} />

      <TopHud
        profile={profile}
        rightExtra={<AtmoPill atmo={atmo} />}
        zoneName={zoneName}
        onProfile={() => setSheet({ type: 'settings' })}
        onSettings={() => setSheet({ type: 'settings' })}
        onExit={() => navigate('/home')}
        onDaily={claimDaily}
        dailyBusy={dailyBusy}
        extraLeft={session.status === 'error' ? (
          <ButtonBase onClick={session.rejoin} sx={{ ...pillSx, pointerEvents: 'auto', px: 1.5, height: '2.6rem', fontWeight: 800, color: '#8A5300', '&.Mui-focusVisible': focusRingSx }}>
            Bağlantı kurulamadı · Tekrar dene
          </ButtonBase>
        ) : null}
      />

      {/* sağ alt: yakınlaştırma; sol alt: buradakiler */}
      <Box sx={{ position: 'absolute', zIndex: 5, right: 'calc(env(safe-area-inset-right) + 0.6rem)', bottom: 'calc(env(safe-area-inset-bottom) + 5.4rem)', pointerEvents: 'none' }}>
        <ZoomControls onIn={() => zoomBy(1)} onOut={() => zoomBy(-1)} canIn={zoom < ZOOMS[ZOOMS.length - 1]} canOut={zoom > ZOOMS[0]} />
      </Box>
      <Box sx={{ position: 'absolute', zIndex: 5, left: 'calc(env(safe-area-inset-left) + 0.6rem)', bottom: 'calc(env(safe-area-inset-bottom) + 5.4rem)', display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-start' }}>
        <RoundButton label={`Buradakiler (${playerList.length})`} showLabel onClick={() => setSheet({ type: 'players' })}>
          <PeopleAltRounded />
        </RoundButton>
      </Box>

      {hint && zoneKey === 'meydan' && !sheet && (
        <WelcomeCard engine={engine} onDismiss={dismissHint} />
      )}

      <BottomBar
        items={[
          { key: 'map', label: 'Harita', icon: <MapRounded />, onClick: () => setSheet({ type: 'map' }) },
          { key: 'say', label: 'Konuş', icon: <ForumRounded />, onClick: () => setSheet({ type: 'speech' }) },
          { key: 'home', label: 'Evim', icon: <CottageRounded />, onClick: openMyRoom },
          { key: 'nb', label: 'Komşular', icon: <GroupsRounded />, onClick: () => setSheet({ type: 'neighbors' }) },
          { key: 'gifts', label: 'Hediyeler', icon: <RedeemRounded />, onClick: () => setSheet({ type: 'inbox' }), badge: profile.unseenGifts },
        ]}
      />

      {/* bölge geçişi perdesi */}
      <Box
        aria-hidden="true"
        className="smg-fade"
        sx={{ position: 'absolute', inset: 0, zIndex: 8, bgcolor: '#FFFDF8', opacity: fading ? 1 : 0, pointerEvents: fading ? 'auto' : 'none', display: 'grid', placeItems: 'center' }}
      >
        {fading && <Typography sx={{ color: '#4A635D', fontWeight: 800 }}>Yürüyoruz…</Typography>}
      </Box>

      <LeafBurst trigger={burst} />

      <ActionSheet
        open={!!menu} onClose={() => setMenu(null)}
        title={menu ? PROP_NAMES[menu.obj.key] : ''} itemKey={menu?.obj.key} actions={menu?.actions}
        onPick={(a) => runWorldAction(menu.obj, a)}
      />
      <SpeechSheet open={sheet?.type === 'speech'} onClose={close} onSay={say} />
      <PlayersHereSheet open={sheet?.type === 'players'} onClose={close} players={playerList} zoneName={zoneName} onPick={(id) => setSheet({ type: 'player', id })} />
      <ZoneMapSheet open={sheet?.type === 'map'} onClose={close} current={zoneKey} onPick={(k) => goToZone(k)} />
      <PlayerCardSheet
        open={!!cardPlayer} player={cardPlayer} onClose={close}
        onGift={(p) => setSheet({ type: 'gift', to: p })} onBlocked={onBlocked}
      />
      <GiftSendSheet open={sheet?.type === 'gift'} to={sheet?.type === 'gift' ? sheet.to : null} onClose={close} />
      <GiftInboxSheet open={sheet?.type === 'inbox'} onClose={close} />
      <NeighborsSheet open={sheet?.type === 'neighbors'} onClose={close} onGift={(p) => setSheet({ type: 'gift', to: p })} />
      <SettingsSheet open={sheet?.type === 'settings'} onClose={close} />
      <ShopSheet
        open={sheet?.type === 'shop'} onClose={close}
        tab={sheet?.type === 'shop' ? sheet.tab : 'clothing'}
        onTabChange={(t) => setSheet({ type: 'shop', tab: t })}
      />
    </Box>
  )
}
