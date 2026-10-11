// Canlı ev (EK v1.2 §E): odaya katıl, içerideki herkesi aynı karakter
// hattıyla çiz (yürüme, konuşma balonu, ifade, duruş). Katılım hatası (409
// dolu / 404 kapalı) ve KICK çağırana bildirilir; çağıran sokağa döner.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import { useWorldSession } from './useWorldSession.js'
import { seatsOf } from '../engine/interactions.js'

const BUBBLE_MS = 5000
const omit = (obj, key) => {
  const next = { ...obj }
  delete next[key]
  return next
}

// ownerId: ev sahibinin publicId'si (null => henüz bilinmiyor, katılma)
// seatObjects(): odadaki oturulabilir eşyalar (uzaktakilerin duruşu için)
export function useRoomLive({ engine, ownerId, spawn, seatObjects, onJoinError, onKick, reduced }) {
  const { token, profile, catalog, onGameEvent, announce } = useGame()
  const me = profile.publicId
  const [players, setPlayers] = useState({})
  const [bubbles, setBubbles] = useState({})
  const [hops, setHops] = useState({})
  const [capacity, setCapacity] = useState(8)
  const posRef = useRef({})
  const timers = useRef(new Set())
  const seq = useRef(0)
  const seatsRef = useRef(seatObjects)
  useEffect(() => { seatsRef.current = seatObjects }, [seatObjects])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const showBubble = useCallback((id, { phraseKey, emoteKey }) => {
    const text = phraseKey ? catalog.phrasesByKey[phraseKey]?.text : null
    if (!text && !emoteKey) return
    const n = ++seq.current
    setBubbles((b) => ({ ...b, [id]: { id: n, text, emoteKey } }))
    if (emoteKey && !reduced) setHops((h) => ({ ...h, [id]: n }))
    const t = setTimeout(() => {
      timers.current.delete(t)
      setBubbles((b) => (b[id]?.id === n ? omit(b, id) : b))
    }, BUBBLE_MS)
    timers.current.add(t)
  }, [catalog, reduced])

  // Uzaktaki kişinin duruşu: bir oturma/uzanma yerinin karesindeyse oraya yerleştir
  const applyRemotePose = useCallback((id, p, cell) => {
    if (!p) return
    const posture = p.pose === 'sit' || p.pose === 'lie' ? p.pose : 'stand'
    let seat = null
    if (posture !== 'stand' && cell) {
      for (const o of seatsRef.current?.() || []) {
        const c = seatsOf(o, posture).filter((st) => st.cell.x === cell.x && st.cell.y === cell.y)
        if (c.length) { seat = c.find((st) => st.facing === p.facing) || c[0]; break }
      }
    }
    engine.ensure(id, cell?.x ?? 0, cell?.y ?? 0)
    engine.setPosture(id, seat
      ? { posture, facing: seat.facing, flip: seat.flip, held: p.held || null, seat }
      : { posture: 'stand', facing: p.facing, flip: !!p.flip, held: p.held || null })
  }, [engine])

  const onSnapshot = useCallback((r) => {
    const list = (r.players || []).filter((p) => p.publicId !== me)
    const pos = {}
    for (const p of list) pos[p.publicId] = { x: p.x, y: p.y }
    for (const id of [...engine.actors.keys()]) {
      if (id !== me && !pos[id]) engine.remove(id)
      else if (id !== me) engine.place(id, pos[id].x, pos[id].y)
    }
    posRef.current = pos
    for (const p of list) if (p.pose && (p.pose !== 'stand' || p.held)) applyRemotePose(p.publicId, p, { x: p.x, y: p.y })
    setPlayers(Object.fromEntries(list.map((p) => [p.publicId, p])))
    setCapacity(r.capacity || 8)
  }, [engine, me, applyRemotePose])

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
        if (p.nickname) announce(`${p.nickname} eve girdi`)
        break
      }
      case 'MOVE':
        if (ev.x == null || ev.y == null) break
        posRef.current[id] = { x: ev.x, y: ev.y }
        if (engine.has(id)) engine.walkTo(id, ev.x, ev.y)
        setPlayers((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], pose: 'stand' } } : cur))
        break
      case 'POSE': {
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
        engine.remove(id)
        setPlayers((cur) => omit(cur, id))
        break
      case 'LOOK':
        setPlayers((cur) => (cur[id] ? { ...cur, [id]: { ...cur[id], ...(ev.player || {}), publicId: id } } : cur))
        break
      default:
    }
  }, [engine, me, applyRemotePose, showBubble, announce])

  const joinFn = useCallback((area, o) => api.joinRoom(token, ownerId, o), [token, ownerId])
  const getSpawn = useCallback((reason) => (reason === 'enter' ? spawn : (engine.destinationOf(me) || spawn)), [engine, me, spawn])
  const session = useWorldSession({
    zoneKey: ownerId ? `room:${ownerId}` : null, getSpawn, onSnapshot, onEvent, joinFn, onJoinError,
  })

  // KICK yalnızca çıkarılana gelir (publicId = kendisi); oturum filtresinden önce dinle
  const kickRef = useRef(onKick)
  useEffect(() => { kickRef.current = onKick }, [onKick])
  useEffect(() => onGameEvent((ev) => {
    if (ev.type !== 'KICK') return
    if (ev.zone && ownerId && ev.zone !== `room:${ownerId}`) return
    kickRef.current?.(ev.reason)
  }), [onGameEvent, ownerId])

  const say = useCallback((payload) => {
    showBubble(me, payload)
    return session.call(() => api.say(token, payload))
  }, [me, showBubble, session, token])

  const sendMove = useCallback((cell) => (
    session.call(() => api.moveTo(token, cell.x, cell.y)).catch(() => {}) // konum bir sonraki adımda yine gider
  ), [session, token])

  const sendPose = useCallback(() => {
    const p = engine.poseOf(me)
    if (!p) return
    session.call(() => api.setPose(token, { pose: p.posture, facing: p.facing, flip: p.flip, held: p.held }))
      .catch(() => {}) // duruş paylaşımı ikincil
  }, [engine, me, session, token])

  const onBlocked = useCallback((id) => {
    delete posRef.current[id]
    engine.remove(id)
    setPlayers((cur) => omit(cur, id))
  }, [engine])

  return { players, bubbles, hops, capacity, posRef, session, say, sendMove, sendPose, onBlocked }
}
