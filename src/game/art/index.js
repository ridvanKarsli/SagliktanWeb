// Sağlıktan Mahalle çizim seti - tek giriş noktası.
// Tüm bileşenler saf (props dışında girdi yok); animasyon sınıfları styles.js
// içe aktarılınca <head>'e bir kez eklenir ve prefers-reduced-motion'a uyar.
export { TILE_W, TILE_H, HALF_W, HALF_H, iso, isoCenter, footprintPolygon, toPoints, screenToGrid, depthCompare } from './iso.js'
export { C as ART_COLORS, INK, BLUSH, shade } from './palette.js'
export { ART_CSS, injectArtStyles } from './styles.js'
export { TILE_LEGEND, BLOCKED_TILES } from './legend.js'
export { IsoTile, TILE_KINDS, TILE_BASE_COLOR, ZoneEdge, RoomWalls } from './tiles.jsx'
export { PROPS, PROP_KEYS } from './props.jsx'
export { PROP_META, propFootprint } from './propMeta.js'
export { FURNITURE, FURNITURE_KEYS } from './furniture.jsx'
export {
  Character,
  CharacterBust,
  SKINS,
  HAIR_COLORS,
  HAIR_STYLES,
  TOPS,
  BOTTOMS,
  ACCESSORIES,
  DEFAULT_APPEARANCE,
} from './character.jsx'
export { GIFT_ICONS, GIFT_KEYS, GiftIcon } from './gifts.jsx'
export { EMOTE_ICONS, EMOTE_KEYS, EmoteIcon } from './emotes.jsx'
export { ClothingSwatch, ClothingSwatch as CLOTHING_PREVIEW } from './swatch.jsx'
