// Dünya nesnelerinin ayak izi ve engel bilgisi (saf JS - Node betikleri ve
// zones.js de kullanır). Çizimler props.jsx'te; PROPS bu tabloyla birleşir.
// blocks: true -> ayak izi hücreleri yürünemez.

export const PROP_META = {
  cinar: { w: 2, d: 2, blocks: true },
  tree_round: { w: 1, d: 1, blocks: true },
  pine: { w: 1, d: 1, blocks: true },
  bush: { w: 1, d: 1, blocks: true },
  flowerbed: { w: 1, d: 1, blocks: true },
  bench: { w: 2, d: 1, blocks: true },
  lamp_post: { w: 1, d: 1, blocks: true },
  fountain: { w: 3, d: 3, blocks: true },
  pond: { w: 3, d: 2, blocks: true },
  market_stall_fabric: { w: 2, d: 1, blocks: true },
  market_stall_furniture: { w: 2, d: 1, blocks: true },
  market_stall_produce: { w: 2, d: 1, blocks: true },
  market_stall_spice: { w: 2, d: 1, blocks: true },
  simit_cart: { w: 1, d: 1, blocks: true },
  tea_kiosk: { w: 2, d: 2, blocks: true },
  tea_table: { w: 1, d: 1, blocks: true },
  umbrella_beach: { w: 1, d: 1, blocks: false },
  sun_lounger: { w: 1, d: 2, blocks: true },
  pier_post: { w: 1, d: 1, blocks: true },
  ferry: { w: 4, d: 2, blocks: true },
  rowboat: { w: 2, d: 1, blocks: true },
  house_a: { w: 3, d: 3, blocks: true },
  house_b: { w: 3, d: 3, blocks: true },
  house_c: { w: 3, d: 3, blocks: true },
  house_d: { w: 3, d: 3, blocks: true },
  signpost: { w: 1, d: 1, blocks: true },
  fence: { w: 1, d: 1, blocks: true },
  mailbox: { w: 1, d: 1, blocks: true },
  bicycle: { w: 1, d: 1, blocks: true },
  cat_sleeping: { w: 1, d: 1, blocks: true },
  rock: { w: 1, d: 1, blocks: true },
  gate_arch: { w: 2, d: 1, blocks: false },
  lighthouse_small: { w: 1, d: 1, blocks: true },
}

// rot=1 iken ayak izi d×w olur.
export function propFootprint(key, rot = 0) {
  const m = PROP_META[key]
  if (!m) return null
  return rot ? { w: m.d, d: m.w } : { w: m.w, d: m.d }
}
