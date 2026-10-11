// Mağaza kutucukları için giyim önizlemesi: o parçayı giyen karakter.
// <ClothingSwatch slot="top"|"bottom"|"accessory"|"hair"|"hairColor"|"skin" keyName="..." size={72} base={appearance?} />
// base verilirse (ör. oyuncunun kendi görünümü) parça onun üstünde denenir.
import { memo } from 'react'
import { Character, CharacterBust, DEFAULT_APPEARANCE } from './character.jsx'

const NEUTRAL = { ...DEFAULT_APPEARANCE, top: 'sweater_cream', bottom: 'chinos' }

export const ClothingSwatch = memo(function ClothingSwatch({ slot, keyName, size = 72, base, title }) {
  const a = { ...(base || NEUTRAL), [slot]: keyName }
  const headOnly = slot === 'skin' || slot === 'hair' || slot === 'hairColor' || (slot === 'accessory' && keyName !== 'backpack')
  if (headOnly) return <CharacterBust appearance={a} size={size} bg={false} title={title} />
  const back = slot === 'accessory' && keyName === 'backpack'
  // alt giyimde bacaklar, üstte gövde öne çıksın diye kadraj kaydırılır
  const vb = slot === 'bottom' ? '-22 -36 44 40' : slot === 'top' ? '-26 -76 52 60' : '-30 -84 60 88'
  return (
    <svg width={size} height={size} viewBox={vb} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <Character appearance={a} facing={back ? 'back' : 'front'} />
    </svg>
  )
})
