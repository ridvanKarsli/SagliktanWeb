// Sağlıktan tasarım token'ları - renk, yazı, köşe, hareket. Tema (theme.js)
// ve tema dışında renk gereken yerler (SVG avatarlar, grafikler) buradan okur.
//
// Yön: "sabah bahçesi". Nane tonlu açık zemin, derin çam yeşili mürekkep,
// logodan gelen şifa yeşili ana renk ve sıcak kayısı vurgu (faydalı oylar,
// açılan avatarlar, kutlamalar). Sorular gök mavisi, anketler leylak - türler
// renkle ayırt edilir ama renk tek başına anlam taşımaz (her zaman ikon+metin).
// Tüm metin renkleri zeminle WCAG AA (≥4.5:1) sağlar.

export const fonts = {
  // Yuvarlak, sıcak ve Türkçe karakterleri tam destekleyen gövde yazısı.
  body: '"Nunito Variable", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  // Başlıklar ve marka anları: tombul, samimi.
  display: '"Baloo 2 Variable", "Baloo 2", "Nunito Variable", -apple-system, sans-serif',
}

const light = {
  mode: 'light',
  background: '#F2F7F4',     // nane sütü
  surface: '#FFFFFF',
  surfaceAlt: '#E6F1EC',     // su yeşili - giriş alanları, ikincil yüzey
  surfaceRaised: '#FFFFFF',
  ink: '#173530',            // çam mürekkebi
  inkSoft: '#4A635D',
  inkMuted: '#6E837D',
  primary: '#157461',        // şifa yeşili (beyaz metinle 5.7:1)
  primaryBright: '#4CB89F',  // logo yeşili - dolgu/ikon vurgusu
  primaryDeep: '#0E5244',
  primarySoft: 'rgba(76, 184, 159, 0.14)',
  apricot: '#F2A33A',        // kayısı - faydalı, avatar, kutlama
  apricotInk: '#8A5300',
  apricotSoft: 'rgba(242, 163, 58, 0.16)',
  sky: '#2A6FA6',            // soru
  skySoft: 'rgba(42, 111, 166, 0.10)',
  lilac: '#6A52C8',          // anket
  lilacSoft: 'rgba(106, 82, 200, 0.10)',
  rose: '#C2385A',           // hata / dikkat
  roseSoft: 'rgba(194, 56, 90, 0.10)',
  amber: '#9A6200',
  amberSoft: 'rgba(242, 163, 58, 0.14)',
  border: 'rgba(23, 53, 48, 0.10)',
  borderStrong: 'rgba(23, 53, 48, 0.20)',
  divider: 'rgba(23, 53, 48, 0.08)',
  overlayRgb: '23, 53, 48',
  shadowRgb: '18, 60, 50',
  themeColor: '#F2F7F4',
}

const dark = {
  mode: 'dark',
  background: '#0F1F1C',     // gece çamı
  surface: '#162A26',
  surfaceAlt: '#1D3530',
  surfaceRaised: '#1F3833',
  ink: '#E6F2EE',
  inkSoft: '#A3BDB6',
  inkMuted: '#7F9993',
  primary: '#5CC7AD',
  primaryBright: '#7AD8C0',
  primaryDeep: '#3FA88F',
  primarySoft: 'rgba(92, 199, 173, 0.16)',
  apricot: '#F5B65A',
  apricotInk: '#F5B65A',
  apricotSoft: 'rgba(245, 182, 90, 0.16)',
  sky: '#6FB3E3',
  skySoft: 'rgba(111, 179, 227, 0.14)',
  lilac: '#A895F0',
  lilacSoft: 'rgba(168, 149, 240, 0.14)',
  rose: '#F07D96',
  roseSoft: 'rgba(240, 125, 150, 0.14)',
  amber: '#F5B65A',
  amberSoft: 'rgba(245, 182, 90, 0.14)',
  border: 'rgba(230, 242, 238, 0.10)',
  borderStrong: 'rgba(230, 242, 238, 0.20)',
  divider: 'rgba(230, 242, 238, 0.08)',
  overlayRgb: '230, 242, 238',
  shadowRgb: '0, 0, 0',
  themeColor: '#0F1F1C',
}

export const palettes = { light, dark }

// Köşe hiyerarşisi: küçük öğeler daha keskin, yükselen yüzeyler daha yumuşak.
export const radius = {
  sm: 10,     // giriş alanı, küçük buton
  md: 16,     // kart, liste öğesi
  lg: 22,     // öne çıkan kart, sohbet balonu
  xl: 28,     // alt sayfa (sheet), dialog
  pill: 999,
}

// Hareket: yumuşak ve kısa. "Yay" eğrisi cevap veren hareketlerde (basma,
// açılma), "akış" eğrisi sayfa/öğe girişlerinde.
export const motion = {
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  flow: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  fast: 160,
  base: 240,
  slow: 420,
}

// Tema dışı bileşenler (SVG, grafik) için o anki paleti döndürür.
export function paletteFor(mode) {
  return mode === 'dark' ? dark : light
}
