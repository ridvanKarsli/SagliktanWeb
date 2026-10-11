// Sahnedeki bir oyuncu: gövdesi motorun yönettiği "host" <g>'ye portal ile
// çizilir (derinlik yuvaları arasında taşınabilsin diye), ad etiketi ve
// konuşma balonu ise her şeyin üstündeki etiket katmanında kalır.
import { memo, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Character, EmoteIcon, SeatStool, FX, CHAR_ANCHORS, MALE_LIFT } from '../art/index.js'
import { AVATAR_ART, hasAvatarArt } from '../../components/avatars/avatarArt.jsx'
import { createHost } from '../engine/StageEngine.js'

const INK = '#23302E'

// Yaklaşık metin genişliği (Nunito 11px kalın); ölçüm için DOM'a gitmeyiz.
function textWidth(text, size) {
  let w = 0
  for (const ch of text) w += /[mwMWğĞ]/.test(ch) ? 0.82 : /[il.,'!ıİ:;|]/.test(ch) ? 0.32 : ch === ' ' ? 0.3 : /[A-ZÇŞÖÜ]/.test(ch) ? 0.66 : 0.56
  return w * size
}

function wrapText(text, maxChars = 18) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 3)
}

const TAG_SIZE = 11
const tagWidth = (name) => Math.max(28, textWidth(name || '', TAG_SIZE) + 16)

export const NameTag = memo(function NameTag({ name, me }) {
  const size = TAG_SIZE
  const w = tagWidth(name)
  return (
    <g transform="translate(0 -94)" pointerEvents="all">
      <rect x={-w / 2} y={-9} width={w} height={18} rx={9} fill={me ? '#2F8F78' : '#FFFDF8'} opacity={me ? 0.95 : 0.9} stroke={INK} strokeOpacity="0.18" />
      <text
        x={0} y={4} textAnchor="middle" fontSize={size} fontWeight="800"
        fontFamily='"Nunito Variable", Nunito, sans-serif' fill={me ? '#FFFFFF' : INK}
      >
        {name}
      </text>
    </g>
  )
})

// Konuşma balonu (hazır cümle ya da ifade). Ad etiketinin üstünde.
export const SpeechBubble = memo(function SpeechBubble({ text, emoteKey }) {
  if (emoteKey) {
    return (
      <g transform="translate(0 -110)" pointerEvents="none">
        <g className="smg-bubble">
          <path d="M-24 -48 h48 a8 8 0 0 1 8 8 v32 a8 8 0 0 1 -8 8 h-18 l-6 7 l-6 -7 h-18 a8 8 0 0 1 -8 -8 v-32 a8 8 0 0 1 8 -8z" fill="#FFFDF8" stroke={INK} strokeOpacity="0.2" />
          <g transform="translate(-20 -44)"><EmoteIcon emoteKey={emoteKey} size={40} /></g>
        </g>
      </g>
    )
  }
  const size = 12.5
  const lines = wrapText(text)
  const w = Math.max(...lines.map((l) => textWidth(l, size))) + 22
  const h = lines.length * 16 + 12
  return (
    <g transform="translate(0 -110)" pointerEvents="none">
      <g className="smg-bubble">
        <path
          d={`M${-w / 2 + 9} ${-h} h${w - 18} a9 9 0 0 1 9 9 v${h - 18} a9 9 0 0 1 -9 9 h${-(w / 2 - 15)} l-6 7 l-6 -7 h${-(w / 2 - 15)} a9 9 0 0 1 -9 -9 v${-(h - 18)} a9 9 0 0 1 9 -9z`}
          fill="#FFFDF8" stroke={INK} strokeOpacity="0.2"
        />
        {lines.map((l, i) => (
          <text key={i} x={0} y={-h + 18 + i * 16} textAnchor="middle" fontSize={size} fontWeight="700" fontFamily='"Nunito Variable", Nunito, sans-serif' fill={INK}>
            {l}
          </text>
        ))}
      </g>
    </g>
  )
})

// Yol arkadaşı (evcil dost): Sağlıktan avatar çizimi, küçük ve gölgeli.
export const PetSprite = memo(function PetSprite({ petKey }) {
  if (!hasAvatarArt(petKey)) return null
  const { art, bg } = AVATAR_ART[petKey]
  return (
    <g pointerEvents="none">
      <ellipse cx={0} cy={0} rx={11} ry={4.5} fill={bg} opacity="0.9" />
      <ellipse cx={0} cy={0} rx={11} ry={4.5} fill={INK} opacity="0.12" />
      <svg x={-16} y={-30} width={32} height={32} viewBox="0 0 64 64" overflow="visible">
        <g className="sm-bob">{art}</g>
      </svg>
    </g>
  )
})

// Not: x,y yalnızca İLK konumdur; sonraki hareketleri motor yönetir. Bu yüzden
// memo karşılaştırması x,y'yi yok sayar (konum değişince yeniden çizim yok).
const sameActorProps = (a, b) => {
  for (const k of Object.keys(b)) if (k !== 'x' && k !== 'y' && a[k] !== b[k]) return false
  return Object.keys(a).length === Object.keys(b).length
}

// Karakterin baş üstü efekti ("izliyor" küçük etiket ya da FX kaydından biri).
function CharFx({ fx, posture, male, flip }) {
  const a = CHAR_ANCHORS[posture]?.head || CHAR_ANCHORS.stand.head
  let x = flip ? -a.x : a.x
  let y = a.y
  if (male) {
    if (posture === 'lie') x += flip ? -3 : 3
    else y -= MALE_LIFT
  }
  if (fx === 'watching') {
    return (
      // ad etiketinin altında kalmasın: başın yanında, ekranın içine doğru
      <g transform={`translate(${x + (flip ? -34 : 34)} ${y + 14})`} pointerEvents="none" aria-hidden="true">
        <rect x={-24} y={-9} width={48} height={16} rx={8} fill="#2E6F6A" opacity="0.92" />
        <text x={0} y={3} textAnchor="middle" fontSize="10" fontWeight="800" fontFamily='"Nunito Variable", Nunito, sans-serif' fill="#fff">izliyor</text>
      </g>
    )
  }
  const Comp = FX[fx]
  return Comp ? <g transform={`translate(${x} ${y})`}><Comp /></g> : null
}

export const Actor = memo(function Actor({ engine, id, x, y, appearance, petKey, nickname, me = false, bubble, hop, showLabel = true, fx = null }) {
  const [host] = useState(createHost)
  const [petHost] = useState(createHost)
  const labelRef = useRef(null)
  const initial = useRef({ x, y, nickname })
  const [pose, setPose] = useState({ facing: 'front', flip: false, walking: false, posture: 'stand', held: null, seatHeight: 22, stool: false })
  const posture = pose.posture || 'stand'
  // uzanan karakterde kendiliğinden "zzz"
  const charFx = fx || (posture === 'lie' ? 'Zzz' : null)
  const hasPet = hasAvatarArt(petKey)

  useLayoutEffect(() => {
    engine.attach(id, { ...initial.current, host, petHost: hasPet ? petHost : null, label: labelRef.current, labelWidth: tagWidth(initial.current.nickname), onPose: setPose })
    return () => engine.detach(id)
  }, [engine, id, host, petHost, hasPet])

  // takma ad değişince (LOOK) çakışma hesabı yeni genişliği kullansın
  useLayoutEffect(() => { engine.setLabelWidth(id, showLabel && nickname ? tagWidth(nickname) : 0) }, [engine, id, nickname, showLabel])

  if (!host) return null
  return (
    <>
      {createPortal(
        <g data-actor={id} style={{ cursor: me ? undefined : 'pointer' }}>
          <g key={hop || 0} className={hop ? 'smg-hop' : undefined}>
            {pose.stool && <SeatStool height={pose.seatHeight} />}
            <Character
              appearance={appearance} facing={pose.facing} flip={pose.flip} walking={pose.walking}
              pose={posture} held={pose.held} seatHeight={pose.seatHeight}
            />
            {charFx && <CharFx fx={charFx} posture={posture} male={appearance?.body === 'male'} flip={pose.flip} />}
          </g>
          {/* geniş dokunma alanı: küçük ekranda karakteri seçmek kolay olsun */}
          <rect x={-18} y={-80} width={36} height={84} fill="transparent" />
        </g>,
        host,
      )}
      {hasPet && createPortal(<PetSprite petKey={petKey} />, petHost)}
      <g ref={labelRef} data-actor={id} style={{ cursor: me ? undefined : 'pointer' }}>
        {showLabel && nickname && <NameTag name={nickname} me={me} />}
        {bubble && <SpeechBubble key={bubble.id} text={bubble.text} emoteKey={bubble.emoteKey} />}
      </g>
    </>
  )
}, sameActorProps)
