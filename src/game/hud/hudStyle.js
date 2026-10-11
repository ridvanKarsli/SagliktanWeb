// HUD ortak renkleri ve hap (pill) yüzeyi. Dünya hep gündüz paletinde
// olduğundan HUD uygulama temasından bağımsız açık renktedir.
export const HUD_INK = '#23302E'
export const HUD_BG = 'rgba(255,253,248,0.94)'
const shadow = '0 4px 14px rgba(18,60,50,0.16), 0 1px 2px rgba(18,60,50,0.12)'

export const pillSx = {
  bgcolor: HUD_BG, color: HUD_INK, borderRadius: 999, boxShadow: shadow,
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
}
