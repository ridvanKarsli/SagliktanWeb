// Oyun dünyasının kendi gündüz paleti ("sabah bahçesi"nin dış mekân hali).
// Uygulama temasından (açık/koyu) bağımsızdır - dünya hep gündüz ışığında.

export const INK = '#23302E'
export const BLUSH = '#FF8FA3'

export const C = {
  ink: INK,
  blush: BLUSH,
  white: '#FFFDF8',
  cream: '#FFF4E0',
  creamDeep: '#F3E2C2',
  // zemin
  grass: '#AEDB8E',
  grassDeep: '#97CC78',
  grassLight: '#C6E9A6',
  soil: '#B98E64',
  soilDeep: '#94704E',
  stone: '#EBDDC4',
  stoneDeep: '#D8C4A2',
  stoneLight: '#F6ECDA',
  plaza: '#F2E6CF',
  sand: '#F4E0AE',
  sandDeep: '#E6CB8C',
  water: '#83CFE6',
  waterDeep: '#5FB6D6',
  waterLight: '#C4ECF6',
  // bitki
  leaf: '#62B784',
  leafDeep: '#3F9469',
  leafLight: '#8FD3A0',
  leafPale: '#B8E6B9',
  trunk: '#A07250',
  trunkDeep: '#7C5538',
  // ahşap
  wood: '#D29B68',
  woodDeep: '#A8744A',
  woodLight: '#E8BC8C',
  // vurgu
  mint: '#8FDCB8',
  healing: '#4CB89F',
  healingDeep: '#2F8F78',
  apricot: '#F2A33A',
  apricotSoft: '#F8C47C',
  apricotPale: '#FCE1B8',
  sky: '#8CC6EE',
  skyDeep: '#5E9FD0',
  skyPale: '#D5E9FA',
  rose: '#E9606F',
  rosePale: '#F9C6C8',
  lilac: '#B5A4E8',
  lilacPale: '#E2DCFB',
  sun: '#FFCD4D',
  terracotta: '#D9845A',
  teal: '#2E6F6A',
  tealDeep: '#245A56',
  metal: '#5D7A76',
  glass: '#CDEBF3',
}

// Basit hex renk karıştırıcı: amt>0 beyaza, amt<0 mürekkebe doğru.
export function shade(hex, amt) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const t = amt > 0 ? [255, 253, 248] : [35, 48, 46]
  const k = Math.min(1, Math.abs(amt))
  const mix = (c, tc) => Math.round(c + (tc - c) * k)
  return `#${[mix(r, t[0]), mix(g, t[1]), mix(b, t[2])].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
