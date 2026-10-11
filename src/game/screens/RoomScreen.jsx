// Ev: kendi odam (düzenlenebilir) ya da bir komşunun odası (salt okunur).
// Sahne dünya ile aynı motoru kullanır; kamera sabit, oda ekrana sığar.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, ButtonBase, IconButton, Stack, Typography } from '@mui/material'
import {
  ArrowBackRounded, CheckRounded, ForumRounded, CloseRounded, DeleteOutlineRounded, EditRounded, ExitToAppRounded,
  OpenWithRounded, PeopleAltRounded, RedeemRounded, RotateRightRounded, UndoRounded,
} from '@mui/icons-material'
import { FURNITURE, FX, RoomWalls, RoomWindowLight, RoomPlanters, TvGlow, footprintPolygon, toPoints, iso } from '../art/index.js'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { isAbortError } from '../../services/api.js'
import { focusRingSx } from '../../design/focus.js'
import { useGame, ownedCount } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import { StageEngine } from '../engine/StageEngine.js'
import {
  ROOM_SIZE, ROOM_DOOR, ROOM_SPAWN, checkPlacement, findFreeSpot, footprintOf, isFloorItem, roomWalkable, safeCell,
} from '../engine/room.js'
import Stage from '../render/Stage.jsx'
import { TileLayer, PlacedObject, TapMarker } from '../render/layers.jsx'
import { Actor } from '../render/Actor.jsx'
import { prefersReducedMotion } from '../render/gameStyles.js'
import { TopHud, BottomBar, ZoomControls } from '../hud/Hud.jsx'
import { pillSx, HUD_INK } from '../hud/hudStyle.js'
import GiftSendSheet from '../sheets/GiftSendSheet.jsx'
import GiftInboxSheet from '../sheets/GiftInboxSheet.jsx'
import SettingsSheet from '../sheets/SettingsSheet.jsx'
import VisitorsSheet from '../sheets/VisitorsSheet.jsx'
import { FurniturePreview } from '../sheets/ShopSheet.jsx'
import ActionSheet from '../sheets/ActionSheet.jsx'
import { SpeechSheet } from '../sheets/WorldSheets.jsx'
import PlayerCardSheet from '../sheets/PlayerCardSheet.jsx'
import { useRoomLive } from '../hooks/useRoomLive.js'
import { AtmoPill } from '../hud/AtmoPill.jsx'
import { roomActions, seatsOf, seatApproach, bestApproach, faceToward, fxPointOf } from '../engine/interactions.js'
import { cellsOf } from '../engine/room.js'
import { useAtmosphere } from '../hooks/useAtmosphere.js'

const FLOOR_TILES = Array.from({ length: ROOM_SIZE }, () => Array(ROOM_SIZE).fill('floor_room'))
const ROOM_SKY = '#F3E9DA'
// odanın çevresi gün dilimine göre (gece koyu lacivert: oda sıcak bir ada gibi)
const ROOM_BG = { sabah: '#F6EBDC', ogle: '#F3E9DA', aksam: '#F0D8C4', gece: '#2A3350' }
const SEAT_KEYS = ['sofa', 'armchair', 'chair', 'beanbag']
const placeKey = (it) => `${it.itemKey}@${it.x},${it.y},${it.rot ? 1 : 0}`
const FLOOR_OFFSET = 1000 // halılar zemin katmanında: data-obj = 1000 + taslak sırası

function toObject(item, draftIndex, on) {
  const f = FURNITURE[item.itemKey]
  const { w, d } = footprintOf(item)
  return {
    key: item.itemKey, x: item.x, y: item.y, rot: item.rot ? 1 : 0, w, d, Component: f?.Component || (() => null), draftIndex, tappable: true,
    props: f?.toggle ? { on: !!on } : undefined,
  }
}

// Oda ekrana sığsın. Düzenlerken envanter paneli geniş ekranda sağda,
// telefonda altta durur; oda kalan alana ortalanır.
const SIDE_PANEL_W = 380
// Oda kamerası.
//  - Gezerken (telefon): zemin elması ekran genişliğinin ~%120'si kadar (dış duvar
//    köşeleri kırpılır, kapı ve karakter görünür kalır); kamera karakteri izler,
//    sürükleme/yakınlaştırma serbest, oda sınırları içinde.
//  - Gezerken (masaüstü): oda rahatça sığar.
//  - Düzenlerken: sabit kamera, oda envanter panelinin dışındaki alana sığar.
const ROOM_FLOOR_W = ROOM_SIZE * 64 // zemin elmasının genişliği (px)
const ROOM_ZOOMS = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.6, 1.9]
const ROOM_BOUNDS = { minX: -ROOM_SIZE * 32, maxX: ROOM_SIZE * 32, minY: -130, maxY: ROOM_SIZE * 32 + 6 }
const TOP_HUD = 120 // üst HUD (kimlik + hava hapı) yaklaşık yüksekliği
const BOTTOM_BAR = 92
function useFitZoom(editing) {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const phone = vp.w < 900
  const side = editing && !phone
  const panelH = editing && !side ? Math.min(300, vp.h * 0.38) : 0
  if (editing) {
    const reservedH = 70 + panelH
    const availW = vp.w - (side ? SIDE_PANEL_W : 0)
    const z = Math.max(0.45, Math.min(availW / 490, (vp.h - reservedH) / 400, 1.6))
    const center = { x: side ? SIDE_PANEL_W / 2 / z : 0, y: 70 + (panelH + 70 - 170) / 2 / z }
    return { zoom: z, center, side, panelH, phone }
  }
  const avail = vp.h - TOP_HUD - BOTTOM_BAR
  const z = phone
    ? Math.min((vp.w * 1.2) / ROOM_FLOOR_W, avail / 300)
    : Math.min(vp.w / 600, avail / 380, 1.6)
  return { zoom: Math.max(0.45, z), center: null, side: false, panelH: 0, phone }
}

export default function RoomScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { publicId: paramId } = useParams()
  const { token, profile, setProfile, catalog, returnTo, announce, setMyGarden } = useGame()
  const { showSuccess, showInfo, showError } = useNotification()
  const me = profile.publicId
  const mineRoute = !paramId || paramId === me
  const [room, setRoom] = useState(() => {
    const r = location.state?.room
    return r && (mineRoute ? r.mine : r.owner?.publicId === paramId) ? r : null
  })
  const [loadError, setLoadError] = useState(null)
  const [reduced] = useState(prefersReducedMotion)
  const [engine] = useState(() => {
    const e = new StageEngine({ reducedMotion: reduced })
    e.reset({ grid: roomWalkable([]), fixedCenter: { x: 0, y: 70 } })
    e.ensure(me, ROOM_SPAWN.x, ROOM_SPAWN.y)
    e.setFollow(me)
    return e
  })
  useEffect(() => () => engine.destroy(), [engine])

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState([])
  const [history, setHistory] = useState([])
  const [ghost, setGhost] = useState(null) // { itemKey, x, y, rot }
  const [selected, setSelected] = useState(-1)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [marker, setMarker] = useState(null)
  // İşlevli eşyalar: açık/kapalı (yerleşim başına, yalnızca bu oturumda),
  // açık eylem menüsü ve şu anki etkinliğim (oturuyorum, piyano çalıyorum...)
  const [toggles, setToggles] = useState({})
  const [menu, setMenu] = useState(null)
  const [activity, setActivity] = useState(null)
  const pending = useRef(null)
  const atmo = useAtmosphere()
  const { zoom: fitZoom, center, side, panelH } = useFitZoom(editing)
  // kullanıcı yakınlaştırması (yalnızca gezerken); null = uygun varsayılan
  const [userZoom, setUserZoom] = useState(null)
  const zoom = !editing && userZoom != null ? userZoom : fitZoom
  const zoomBy = useCallback((dir) => {
    setUserZoom((z) => {
      const cur = z ?? fitZoom
      const list = dir > 0 ? ROOM_ZOOMS.filter((v) => v > cur + 0.01) : ROOM_ZOOMS.filter((v) => v < cur - 0.01).reverse()
      return list[0] ?? cur
    })
  }, [fitZoom])
  const onPinchZoom = useCallback((ratio) => {
    setUserZoom((z) => Math.max(ROOM_ZOOMS[0], Math.min(ROOM_ZOOMS[ROOM_ZOOMS.length - 1], (z ?? fitZoom) * ratio)))
  }, [fitZoom])

  // Odayı yükle
  useEffect(() => {
    if (room) return undefined
    const ctrl = new AbortController()
    const p = mineRoute ? api.getMyRoom(token, { signal: ctrl.signal }) : api.getRoom(token, paramId, { signal: ctrl.signal })
    p.then((r) => setRoom(r)).catch((err) => {
      if (isAbortError(err)) return
      setLoadError(err?.status === 404 ? 'Bu eve şu an girilemiyor. Belki başka bir zaman.' : (err?.message || 'Ev açılamadı.'))
    })
    return () => ctrl.abort()
  }, [room, mineRoute, paramId, token])

  const mine = !!room?.mine
  // kendi evime girince bahçemi önbelleğe al (sokaktaki kapımın önü de aynı)
  useEffect(() => { if (room?.mine && room.garden) setMyGarden(room.garden) }, [room, setMyGarden])
  const items = useMemo(() => (editing ? draft : room?.items || []), [editing, draft, room])
  const grid = useMemo(() => roomWalkable(items), [items])

  // Izgara değişince: karakter eşyanın altında kaldıysa en yakın boş kareye
  useEffect(() => {
    engine.setGrid(grid)
    const c = engine.cellOf(me)
    if (c && !grid[c.y]?.[c.x]) {
      const s = safeCell(grid, c)
      engine.place(me, s.x, s.y)
    }
  }, [engine, grid, me])

  useEffect(() => {
    if (center) {
      // düzenleme: sabit kamera
      engine.fixedCenter = center
      engine.bounds = null
      engine.setFocusOffset(0)
    } else {
      // gezinti: karakteri izle, oda sınırında kal; üst HUD ile alt çubuk arasında ortala
      engine.fixedCenter = null
      engine.bounds = ROOM_BOUNDS
      engine.setFocusOffset((BOTTOM_BAR - TOP_HUD) / 2)
      engine.recenter()
    }
    engine.setZoom(zoom)
  }, [engine, zoom, center?.x, center?.y]) // eslint-disable-line react-hooks/exhaustive-deps

  const exit = useCallback(() => {
    const back = location.state?.from || returnTo.current || { zone: 'mahalle', x: 2, y: 4 } // varsayılan: sokağın başı
    navigate('/mahalle', { state: { world: back } })
  }, [navigate, location.state, returnTo])

  // ------------------------------------------------------------ canlı ev
  const roomItemsRef = useRef([])
  roomItemsRef.current = room?.items || []
  const seatObjects = useCallback(() => roomItemsRef.current.filter((it) => !isFloorItem(it)).map((it) => toObject(it, -1)), [])
  const onJoinError = useCallback((err) => {
    if (err?.status === 409) { showInfo(err.message || 'Bu ev şu an dolu, biraz sonra tekrar uğra.'); exit() }
    else if (err?.status === 404) { showInfo('Bu eve şu an girilemiyor.'); exit() }
  }, [showInfo, exit])
  const onKick = useCallback((reason) => {
    const msg = { visibility: 'Ev sahibi evini kapattı.', blocked: 'Bu eve artık giremezsin.', closed: 'Bu ev artık yok.' }[reason] || 'Evden çıktın.'
    showInfo(msg)
    exit()
  }, [showInfo, exit])
  const live = useRoomLive({
    engine, ownerId: loadError ? null : room?.owner?.publicId || null, spawn: ROOM_SPAWN, seatObjects, onJoinError, onKick, reduced,
  })
  const liveList = useMemo(() => Object.values(live.players), [live.players])

  const isOn = useCallback((it) => {
    const k = placeKey(it)
    return k in toggles ? toggles[k] : !!FURNITURE[it.itemKey]?.defaultOn
  }, [toggles])
  const flipToggle = useCallback((it) => setToggles((t) => {
    const k = placeKey(it)
    const cur = k in t ? t[k] : !!FURNITURE[it.itemKey]?.defaultOn
    return { ...t, [k]: !cur }
  }), [])

  // Varınca bekleyen etkileşimi uygula (otur, uzan, eşyaya dön, aç/kapat)
  const applyPending = useCallback((cell) => {
    const p = pending.current
    pending.current = null
    if (!p) return
    if (p.type === 'seat') {
      engine.setPosture(me, { posture: p.seat.kind, facing: p.seat.facing, flip: p.seat.flip, held: p.action.held ?? null, seat: p.seat })
      // misafirler beni oturduğum yerin karesinde görsün: önce konum, sonra duruş
      live.sendMove(p.seat.cell).then(live.sendPose)
    } else {
      const d = faceToward(cell, p.target)
      engine.face(me, d.dx, d.dy)
      if (p.action.kind !== 'toggle') {
        engine.setPosture(me, { posture: 'stand', held: p.action.held ?? null })
        live.sendPose()
      }
    }
    if (p.action.kind === 'toggle') flipToggle(p.item)
    else setActivity({ item: p.item, action: p.action })
  }, [engine, me, flipToggle, live.sendMove, live.sendPose]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    engine.onArrive = (id, cell) => {
      if (id !== me) return
      setMarker(null)
      if (pending.current) return applyPending(cell)
      if (cell.x === ROOM_DOOR.x && cell.y === ROOM_DOOR.y && !editing) exit()
    }
    return () => { engine.onArrive = null }
  }, [engine, me, exit, editing, applyPending])

  // ------------------------------------------------------------ düzenleme
  const owned = useCallback((key) => ownedCount(profile, key), [profile])
  const inventory = useMemo(() => {
    const placed = {}
    for (const it of draft) placed[it.itemKey] = (placed[it.itemKey] || 0) + 1
    if (ghost) placed[ghost.itemKey] = (placed[ghost.itemKey] || 0) + 1
    return catalog.furniture
      .map((f) => ({ ...f, owned: owned(f.key), free: owned(f.key) - (placed[f.key] || 0) }))
      .filter((f) => f.owned > 0)
  }, [catalog, draft, ghost, owned])

  const ghostCheck = ghost ? checkPlacement(draft, ghost, { owned: owned(ghost.itemKey) }) : null

  const commit = (next) => {
    setHistory((h) => [...h.slice(-30), draft])
    setDraft(next)
  }

  const startEdit = () => {
    pending.current = null
    setActivity(null)
    setMenu(null)
    engine.setPosture(me, { posture: 'stand', held: null })
    setDraft(room.items.map((i) => ({ itemKey: i.itemKey, x: i.x, y: i.y, rot: i.rot ? 1 : 0 })))
    setHistory([])
    setGhost(null)
    setSelected(-1)
    setSaveError(null)
    setEditing(true)
  }
  const cancelEdit = () => {
    setEditing(false)
    setGhost(null)
    setSelected(-1)
  }
  const undo = () => {
    if (!history.length) return
    setDraft(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
    setGhost(null)
    setSelected(-1)
  }
  const pick = (itemKey) => {
    setSelected(-1)
    setSaveError(null)
    setGhost(findFreeSpot(draft, itemKey, 0, owned(itemKey)))
  }
  const placeGhost = () => {
    if (!ghost || !ghostCheck?.ok) return
    commit([...draft, { itemKey: ghost.itemKey, x: ghost.x, y: ghost.y, rot: ghost.rot }])
    announce(`${catalog.furnitureByKey[ghost.itemKey]?.name || 'Eşya'} yerleştirildi`)
    setGhost(null)
  }
  const rotateGhost = () => ghost && setGhost({ ...ghost, rot: ghost.rot ? 0 : 1 })
  const rotateSelected = () => {
    const it = draft[selected]
    if (!it) return
    const cand = { ...it, rot: it.rot ? 0 : 1 }
    const ok = checkPlacement(draft, cand, { ignoreIndex: selected, owned: owned(it.itemKey) })
    if (!ok.ok) return setSaveError(`Döndürülemedi: ${ok.reason.toLocaleLowerCase('tr')}.`)
    setSaveError(null)
    commit(draft.map((x, i) => (i === selected ? cand : x)))
  }
  const moveSelected = () => {
    const it = draft[selected]
    if (!it) return
    commit(draft.filter((_, i) => i !== selected))
    setGhost({ ...it })
    setSelected(-1)
  }
  const storeSelected = () => {
    const it = draft[selected]
    if (!it) return
    commit(draft.filter((_, i) => i !== selected))
    setSelected(-1)
    announce(`${catalog.furnitureByKey[it.itemKey]?.name || 'Eşya'} kaldırıldı`)
  }
  const save = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const r = await api.saveMyRoom(token, draft)
      setRoom(r)
      setEditing(false)
      setGhost(null)
      setSelected(-1)
      showSuccess('Evin kaydedildi.')
    } catch (err) {
      setSaveError(err?.message || 'Kaydedilemedi, tekrar dene.')
    } finally {
      setSaving(false)
    }
  }

  // ------------------------------------------------------------ dokunma
  const walkMe = (x, y) => {
    const dest = engine.walkTo(me, x, y)
    if (dest) {
      if (!reduced) setMarker({ ...dest, k: Date.now() })
      live.sendMove(dest)
    }
    return dest
  }

  const onTap = ({ cell, actorId, objIndex }) => {
    if (actorId) {
      if (actorId !== me && !editing && live.players[actorId]) setSheet({ player: actorId })
      return
    }
    if (editing) {
      if (ghost) {
        const { w, d } = footprintOf(ghost)
        const nx = Math.max(0, Math.min(ROOM_SIZE - w, cell.x))
        const ny = Math.max(0, Math.min(ROOM_SIZE - d, cell.y))
        if (nx === ghost.x && ny === ghost.y) placeGhost()
        else setGhost({ ...ghost, x: nx, y: ny })
        return
      }
      if (objIndex != null) {
        const di = objIndex >= FLOOR_OFFSET ? objIndex - FLOOR_OFFSET : objects[objIndex]?.draftIndex
        setSelected(di ?? -1)
        setSaveError(null)
        return
      }
      setSelected(-1)
      return
    }
    // işlevli eşya: eylem menüsü
    if (objIndex != null) {
      const di = objIndex >= FLOOR_OFFSET ? objIndex - FLOOR_OFFSET : objects[objIndex]?.draftIndex
      const it = items[di]
      const acts = it ? roomActions(it.itemKey, { on: isOn(it), own: mine }) : []
      if (acts.length) {
        setMenu({ item: it, actions: acts })
        return
      }
    }
    // başka yere dokunmak etkinliği bitirir (kalkar, elindekini bırakır)
    pending.current = null
    setActivity(null)
    const hadHeld = !!engine.poseOf(me)?.held
    engine.setHeld(me, null)
    // kapıya (duvar tarafı) dokunuldu: çık
    if (cell.x < 0 && cell.y >= 6 && cell.y <= 7) {
      walkMe(ROOM_DOOR.x, ROOM_DOOR.y)
      return
    }
    if (cell.x < 0 || cell.y < 0 || cell.x >= ROOM_SIZE || cell.y >= ROOM_SIZE) return
    if (walkMe(cell.x, cell.y) && hadHeld) live.sendPose() // elindekini bıraktı
  }

  // Eylem seçildi: gerekiyorsa eşyaya yürü, varınca uygula.
  const runAction = (item, action) => {
    setMenu(null)
    setActivity(null)
    const obj = toObject(item, -1)
    // televizyon: kumandayla, olduğun yerden
    if (action.kind === 'toggle' && item.itemKey === 'tv') return flipToggle(item)
    const from = engine.cellOf(me)
    let plan = null
    if (action.kind === 'sit' || action.kind === 'lie') {
      const seats = seatsOf(obj, action.kind)
      for (const seat of seats) {
        const ap = seatApproach(grid, from, seat)
        if (ap && (!plan || (ap.d ?? 0) < plan.d)) plan = { type: 'seat', seat, cell: ap.cell, d: ap.d ?? 0 }
      }
    } else if (action.kind === 'read') {
      // yakında koltuk varsa oturup okur, yoksa kitaplığın önünde
      const near = items
        .filter((o) => SEAT_KEYS.includes(o.itemKey) && Math.abs(o.x - item.x) + Math.abs(o.y - item.y) <= 3)
        .flatMap((o) => seatsOf(toObject(o, -1), 'sit'))
      for (const seat of near) {
        const ap = seatApproach(grid, from, seat)
        if (ap && (!plan || (ap.d ?? 0) < plan.d)) plan = { type: 'seat', seat, cell: ap.cell, d: ap.d ?? 0 }
      }
    }
    if (!plan) {
      const ap = bestApproach(grid, from, cellsOf(item))
      if (!ap) return showInfo('Bu eşyanın yanına geçecek yer yok.')
      plan = { type: 'stand', cell: ap.cell, target: ap.target }
    }
    pending.current = { ...plan, item, action }
    const here = engine.cellOf(me)
    if (here.x === plan.cell.x && here.y === plan.cell.y) {
      engine.setPosture(me, { posture: 'stand' })
      applyPending(here)
      return
    }
    walkMe(plan.cell.x, plan.cell.y)
  }

  const onHover = (g) => {
    if (!ghost) return
    const { w, d } = footprintOf(ghost)
    const nx = Math.max(0, Math.min(ROOM_SIZE - w, Math.floor(g.x)))
    const ny = Math.max(0, Math.min(ROOM_SIZE - d, Math.floor(g.y)))
    if (nx !== ghost.x || ny !== ghost.y) setGhost({ ...ghost, x: nx, y: ny })
  }

  // ------------------------------------------------------------ çizim
  const objects = useMemo(
    () => items.map((it, i) => ({ it, i })).filter(({ it }) => !isFloorItem(it)).map(({ it, i }) => toObject(it, i, isOn(it))),
    [items, isOn],
  )
  const selectedObjIndex = editing && selected >= 0 ? objects.findIndex((o) => o.draftIndex === selected) : -1
  const rugs = items.map((it, i) => ({ it, i })).filter(({ it }) => isFloorItem(it))
  const tiles = useMemo(() => <TileLayer tiles={FLOOR_TILES} />, [])
  // Pencere önündeki saksılar: ev sahibinin iyilik bahçesi (sayı yok, yalnızca görüntü)
  const gFlowers = room?.garden?.flowers || 0
  const gLanterns = room?.garden?.lanterns || 0
  const background = useMemo(() => (
    <>
      <RoomWalls size={ROOM_SIZE} timeOfDay={atmo.timeOfDay} weather={atmo.weather} />
      <RoomPlanters size={ROOM_SIZE} flowers={gFlowers} lanterns={gLanterns} />
    </>
  ), [atmo.timeOfDay, atmo.weather, gFlowers, gLanterns])
  const tvsOn = editing ? [] : items.filter((it) => it.itemKey === 'tv' && isOn(it))
  // eşya üstü efektler: açık radyo notaları + şu anki etkinliğin efekti
  const itemFx = []
  if (!editing) {
    for (const it of items) if (it.itemKey === 'radio' && isOn(it)) itemFx.push({ k: `r${placeKey(it)}`, ...fxPointOf(toObject(it, -1)), fx: 'MusicNotes' })
    if (activity?.action.fx && activity.action.fxAt === 'item') {
      const pt = fxPointOf(toObject(activity.item, -1))
      if (pt) itemFx.push({ k: 'act', ...pt, fx: activity.action.fx })
    }
  }
  const myPose = engine.poseOf(me)
  // televizyon açıkken oturuyorsam "izliyor"
  const watching = tvsOn.length > 0 && myPose?.posture === 'sit' ? 'watching' : null
  const floor = (
    <>
      <RoomWindowLight timeOfDay={atmo.timeOfDay} weather={atmo.weather} size={ROOM_SIZE} />
      {tvsOn.map((it) => {
        const o = iso(it.x, it.y)
        return <g key={placeKey(it)} transform={`translate(${o.sx} ${o.sy})${it.rot ? ' scale(-1 1)' : ''}`}><TvGlow on /></g>
      })}
      {rugs.map(({ it, i }) => (
        <PlacedObject key={`r${i}`} obj={toObject(it, i)} index={FLOOR_OFFSET + i} selected={editing && selected === i} />
      ))}
      {editing && (
        <g pointerEvents="none" opacity="0.35">
          {Array.from({ length: ROOM_SIZE + 1 }, (_, k) => (
            <g key={k}>
              <line x1={(k - 0) * 32} y1={k * 16} x2={(k - ROOM_SIZE) * 32} y2={(k + ROOM_SIZE) * 16} stroke="#FFFDF8" strokeWidth="1" />
              <line x1={-k * 32} y1={k * 16} x2={(ROOM_SIZE - k) * 32} y2={(ROOM_SIZE + k) * 16} stroke="#FFFDF8" strokeWidth="1" />
            </g>
          ))}
        </g>
      )}
      {marker && <TapMarker key={marker.k} x={marker.x} y={marker.y} />}
    </>
  )
  // Yerleştirme izi: diğer eşyaların üstünde görünsün diye etiket katmanında;
  // yeşil = uygun, kırmızı = olmaz (renge ek olarak panelde metin var).
  const fxLayer = itemFx.map((f) => {
    const Comp = FX[f.fx]
    return Comp ? <g key={f.k} transform={`translate(${f.sx} ${f.sy})`}><Comp /></g> : null
  })
  const overlay = ghost ? (
    <g pointerEvents="none">
      <polygon
        points={toPoints(footprintPolygon(footprintOf(ghost).w, footprintOf(ghost).d, ghost.x, ghost.y))}
        fill={ghostCheck?.ok ? '#4CB89F' : '#E9606F'} fillOpacity="0.45"
        stroke={ghostCheck?.ok ? '#2F8F78' : '#B23A4C'} strokeWidth="2.5" strokeLinejoin="round"
      />
      <PlacedObject obj={toObject(ghost, -1)} index={-1} ghost />
    </g>
  ) : <g pointerEvents="none">{fxLayer}</g>
  const actors = (
    <>
      {liveList.map((p) => (
        <Actor
          key={p.publicId} engine={engine} id={p.publicId}
          x={live.posRef.current[p.publicId]?.x ?? p.x} y={live.posRef.current[p.publicId]?.y ?? p.y}
          appearance={p.appearance} petKey={p.petKey} nickname={p.nickname}
          bubble={live.bubbles[p.publicId]} hop={live.hops[p.publicId]} showLabel={!editing}
        />
      ))}
      <Actor
        engine={engine} id={me} x={ROOM_SPAWN.x} y={ROOM_SPAWN.y} me
        appearance={profile.appearance} petKey={profile.petKey} nickname={profile.nickname}
        showLabel={!editing} fx={watching} bubble={live.bubbles[me]} hop={live.hops[me]}
      />
    </>
  )

  if (loadError) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', bgcolor: ROOM_SKY, p: 3 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 800, mb: 1, color: HUD_INK }}>Kapı kapalı</Typography>
          <Typography sx={{ mb: 2, color: '#4A635D' }}>{loadError}</Typography>
          <Button variant="contained" startIcon={<ArrowBackRounded />} onClick={exit} sx={{ minHeight: 48, borderRadius: 999, fontWeight: 800 }}>Sokağa dön</Button>
        </Box>
      </Box>
    )
  }
  if (!room) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', bgcolor: ROOM_SKY }}>
        <SaglikLoader size="lg" caption="Kapı açılıyor…" />
      </Box>
    )
  }

  const owner = room.owner
  const ownerTitle = mine ? 'Evim' : (owner?.nickname || 'Komşu')

  return (
    <Box
      sx={{
        position: 'fixed', inset: 0, overflow: 'hidden', bgcolor: ROOM_BG[atmo.timeOfDay] || ROOM_SKY,
        // gece odanın arkası koyu; ortada hafif bir hale (gündüz beyaz, gece lacivert)
        backgroundImage: `radial-gradient(120% 80% at 50% 30%, ${atmo.timeOfDay === 'gece' ? '#45507A' : '#FFFFFF'} 0%, transparent 60%)`,
      }}
    >
      <Stage
        engine={engine}
        objects={objects}
        maxDepth={ROOM_SIZE * 2}
        background={background}
        tiles={tiles}
        floor={floor}
        overlay={overlay}
        actors={actors}
        onTap={onTap}
        onHover={editing ? onHover : undefined}
        sky={ROOM_BG[atmo.timeOfDay] || ROOM_SKY}
        transparent
        panEnabled={!editing}
        onPinchZoom={editing ? undefined : onPinchZoom}
        onWheelZoom={editing ? undefined : zoomBy}
        selectedIndex={selectedObjIndex}
        ariaLabel={`${mine ? 'Evin' : `${ownerTitle} adlı komşunun evi`}. Dokunduğun yere yürürsün; sol duvardaki kapı sokağa çıkar.`}
      />

      {!editing && (
        <TopHud
          profile={profile}
          zoneName={null}
          onProfile={() => setSheet('settings')}
          onSettings={() => setSheet('settings')}
          onExit={() => navigate('/home')}
          onDaily={null}
          rightExtra={<AtmoPill atmo={atmo} />}
          extraLeft={(
            // kapı tabelası
            <Box sx={{ ...pillSx, px: 1.75, py: 0.75, borderRadius: '14px', bgcolor: '#FFF4E0', border: '2px solid #D29B68' }}>
              {!mine && <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#A8744A', lineHeight: 1.1 }}>Komşunun evi</Typography>}
              <Typography component="h1" sx={{ fontWeight: 800, fontSize: '1rem', color: '#7C5538', lineHeight: 1.3 }}>{ownerTitle}</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#7C5538', lineHeight: 1.2 }} aria-label={`Evde ${liveList.length + 1} kişi var, en fazla ${live.capacity}`}>
                Evde: {liveList.length + 1} / {live.capacity}
              </Typography>
            </Box>
          )}
        />
      )}

      {!editing && (
        <BottomBar
          items={mine ? [
            { key: 'out', label: 'Sokağa çık', icon: <ExitToAppRounded />, onClick: exit },
            { key: 'say', label: 'Konuş', icon: <ForumRounded />, onClick: () => setSheet('speech') },
            { key: 'edit', label: 'Düzenle', icon: <EditRounded />, onClick: startEdit },
            { key: 'vis', label: 'Ziyaretçiler', icon: <PeopleAltRounded />, onClick: () => setSheet('visitors') },
            { key: 'gifts', label: 'Hediyeler', icon: <RedeemRounded />, onClick: () => setSheet('inbox'), badge: profile.unseenGifts },
          ] : [
            { key: 'out', label: 'Sokağa çık', icon: <ExitToAppRounded />, onClick: exit },
            { key: 'say', label: 'Konuş', icon: <ForumRounded />, onClick: () => setSheet('speech') },
            { key: 'gift', label: 'Hediye bırak', icon: <RedeemRounded />, onClick: () => setSheet('gift') },
          ]}
        />
      )}

      {!editing && (
        <Box sx={{ position: 'absolute', zIndex: 5, right: 'calc(env(safe-area-inset-right) + 0.6rem)', bottom: 'calc(env(safe-area-inset-bottom) + 5.4rem)', pointerEvents: 'none' }}>
          <ZoomControls
            onIn={() => zoomBy(1)} onOut={() => zoomBy(-1)}
            canIn={zoom < ROOM_ZOOMS[ROOM_ZOOMS.length - 1] - 0.01} canOut={zoom > ROOM_ZOOMS[0] + 0.01}
          />
        </Box>
      )}

      {editing && (
        <EditPanel
          inventory={inventory}
          ghost={ghost}
          ghostCheck={ghostCheck}
          selectedItem={selected >= 0 ? draft[selected] : null}
          catalog={catalog}
          onPick={pick}
          onPlace={placeGhost}
          onRotateGhost={rotateGhost}
          onCancelGhost={() => setGhost(null)}
          onRotate={rotateSelected}
          onMove={moveSelected}
          onStore={storeSelected}
          onDeselect={() => setSelected(-1)}
          onUndo={undo}
          canUndo={history.length > 0}
          onSave={save}
          onCancel={cancelEdit}
          saving={saving}
          error={saveError}
          height={panelH}
          side={side}
        />
      )}

      <ActionSheet
        open={!!menu} onClose={() => setMenu(null)}
        title={menu ? (catalog.furnitureByKey[menu.item.itemKey]?.name || 'Eşya') : ''}
        itemKey={menu?.item.itemKey} actions={menu?.actions}
        note={menu && !mine && FURNITURE[menu.item.itemKey]?.toggle ? 'Komşunun eşyalarını açıp kapatamazsın; oturup dinlenebilirsin.' : undefined}
        onPick={(a) => runAction(menu.item, a)}
      />
      <GiftSendSheet open={sheet === 'gift'} to={sheet === 'gift' ? owner : null} onClose={() => setSheet(null)} />
      <GiftInboxSheet open={sheet === 'inbox'} onClose={() => setSheet(null)} />
      <SettingsSheet open={sheet === 'settings'} onClose={() => setSheet(null)} />
      <VisitorsSheet open={sheet === 'visitors'} onClose={() => setSheet(null)} onGift={(p) => setSheet({ gift: p })} />
      {sheet?.gift && <GiftSendSheet open to={sheet.gift} onClose={() => setSheet(null)} />}
      <SpeechSheet
        open={sheet === 'speech'} onClose={() => setSheet(null)}
        onSay={(payload) => {
          setSheet(null)
          live.say(payload).catch((err) => showError(err?.status === 429 ? 'Biraz soluklanalım; birazdan yine konuşabilirsin.' : (err?.message || 'Söyleyemedik, tekrar dene.')))
        }}
      />
      <PlayerCardSheet
        open={!!sheet?.player && !!live.players[sheet.player]} player={sheet?.player ? live.players[sheet.player] : null}
        onClose={() => setSheet(null)} hideVisit
        onGift={(p) => setSheet({ gift: p })} onBlocked={live.onBlocked}
      />
      {/* katılım sürerken (ya da ev doluysa geri dönerken) kapıda bekle */}
      {live.session.status === 'joining' && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 9, display: 'grid', placeItems: 'center', bgcolor: ROOM_BG[atmo.timeOfDay] || ROOM_SKY }}>
          <SaglikLoader size="lg" caption="Kapı açılıyor…" />
        </Box>
      )}
      <ProfileSync setProfile={setProfile} />
    </Box>
  )
}

// Odaya girerken profil (sahip olunan eşya adetleri) tazelensin: başka
// sekmede/ cihazda alınan mobilyalar envanterde görünsün.
function ProfileSync({ setProfile }) {
  const { token } = useGame()
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    api.getMe(token).then((p) => p && setProfile(p)).catch(() => {}) // tazeleme ikincil: eldeki profil yeterli
  }, [token, setProfile])
  return null
}

const editBtn = { minHeight: 48, borderRadius: 999, fontWeight: 800, px: 2 }

function EditPanel({
  inventory, ghost, ghostCheck, selectedItem, catalog, onPick, onPlace, onRotateGhost, onCancelGhost,
  onRotate, onMove, onStore, onDeselect, onUndo, canUndo, onSave, onCancel, saving, error, height, side,
}) {
  const name = (k) => catalog.furnitureByKey[k]?.name || k
  return (
    <>
      {/* üst çubuk: vazgeç / geri al / kaydet */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, pt: 'calc(env(safe-area-inset-top) + 0.6rem)', px: '0.6rem', display: 'flex', gap: 0.75, alignItems: 'center' }}>
        <Button onClick={onCancel} startIcon={<CloseRounded />} sx={{ ...pillSx, ...editBtn, color: HUD_INK }}>Vazgeç</Button>
        <IconButton onClick={onUndo} disabled={!canUndo} aria-label="Geri al" sx={{ ...pillSx, width: 48, height: 48, color: HUD_INK, '&.Mui-focusVisible': focusRingSx }}>
          <UndoRounded />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onSave} disabled={saving || !!ghost} variant="contained" startIcon={saving ? null : <CheckRounded />} sx={{ ...editBtn, boxShadow: 2 }}>
          {saving ? <SaglikLoader size="sm" color="inherit" label="Kaydediliyor" /> : 'Kaydet'}
        </Button>
      </Box>

      <Box
        role="region" aria-label="Eşya yerleştirme"
        sx={{
          position: 'absolute', zIndex: 5, bgcolor: '#FFFDF8', color: HUD_INK, display: 'flex', flexDirection: 'column',
          ...(side
            ? { top: 76, right: 12, bottom: 12, width: SIDE_PANEL_W - 24, borderRadius: '24px', boxShadow: '0 6px 24px rgba(18,60,50,.18)', pb: 1 }
            : { left: 0, right: 0, bottom: 0, height, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: '0 -6px 20px rgba(18,60,50,.16)', pb: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }),
        }}
      >
        {error && <Alert severity="warning" sx={{ mx: 1.5, mt: 1.25 }}>{error}</Alert>}
        {ghost ? (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{name(ghost.itemKey)}</Typography>
            <Typography role="status" sx={{ color: ghostCheck?.ok ? '#2F8F78' : '#B23A4C', fontWeight: 700, mb: 1.5 }}>
              {ghostCheck?.ok ? 'Yeşil alan uygun. Aynı yere bir daha dokun ya da “Buraya koy”a bas.' : `${ghostCheck?.reason}. Başka bir yere dokun.`}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Button variant="contained" onClick={onPlace} disabled={!ghostCheck?.ok} startIcon={<CheckRounded />} sx={editBtn}>Buraya koy</Button>
              <Button variant="outlined" onClick={onRotateGhost} startIcon={<RotateRightRounded />} sx={editBtn}>Döndür</Button>
              <Button onClick={onCancelGhost} sx={{ ...editBtn, color: '#4A635D' }}>Vazgeç</Button>
            </Stack>
          </Box>
        ) : selectedItem ? (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 1.5 }}>{name(selectedItem.itemKey)}</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Button variant="outlined" onClick={onRotate} startIcon={<RotateRightRounded />} sx={editBtn}>Döndür</Button>
              <Button variant="outlined" onClick={onMove} startIcon={<OpenWithRounded />} sx={editBtn}>Taşı</Button>
              <Button variant="outlined" color="error" onClick={onStore} startIcon={<DeleteOutlineRounded />} sx={editBtn}>Kaldır</Button>
              <Button onClick={onDeselect} sx={{ ...editBtn, color: '#4A635D' }}>Tamam</Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontWeight: 800, px: 2, pt: 1.5, pb: 0.5 }}>
              Eşyaların <Box component="span" sx={{ fontWeight: 600, color: '#4A635D' }}>· yerleştirmek için birine, düzenlemek için odadakine dokun</Box>
            </Typography>
            <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 1 }}>
                {inventory.map((f) => (
                  <ButtonBase
                    key={f.key}
                    onClick={() => onPick(f.key)}
                    disabled={f.free <= 0}
                    aria-label={`${f.name}, ${f.free} tane yerleştirilebilir`}
                    sx={{ flexDirection: 'column', p: 0.75, borderRadius: '16px', border: '1px solid rgba(35,48,46,.12)', opacity: f.free > 0 ? 1 : 0.45, '&.Mui-focusVisible': focusRingSx, '&:hover': { bgcolor: 'rgba(76,184,159,.08)' } }}
                  >
                    <FurniturePreview itemKey={f.key} size={64} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2, textAlign: 'center' }}>{f.name}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#4A635D' }}>{f.free} / {f.owned}</Typography>
                  </ButtonBase>
                ))}
              </Box>
              {inventory.length === 0 && <Typography sx={{ color: '#4A635D', p: 1 }}>Henüz eşyan yok. Çarşı’daki mobilya tezgâhına uğra.</Typography>}
            </Box>
          </>
        )}
      </Box>
    </>
  )
}
