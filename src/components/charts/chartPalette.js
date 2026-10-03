import { useTheme } from '@mui/material/styles'

// Grafik seri renkleri (kategorik). Marka token'larının ton aileleri korunur
// (şifa yeşili, gök mavisi, leylak, kayısı) ama açıklık/doygunluk, veri-görsel
// doğrulayıcısının (dataviz validate_palette.js) altı kontrolünden geçecek
// şekilde basamaklandı - marka token'ları olduğu gibi kullanıldığında gök
// mavisi ile leylak hem renk körlüğü simülasyonunda hem normal görüşte
// birbirine fazla yaklaşıyordu, karanlık temada da token'lar açıklık bandının
// üstünde kalıyordu.
//
// Doğrulama (sıra: aktif kişi, gönderi, yorum, yeni üye; --pairs all):
//   açık  (#FFFFFF ve #F2F7F4): bant/kroma/CVD (en kötü ΔE 8.7)/normal görüş
//         (en kötü ΔE 15.2) GEÇER. Kayısı 2.2-2.4:1 kontrastta (UYARI) - bu
//         yüzden her grafikte "Tablo olarak gör" görünümü ve tepe değer etiketi var.
//   koyu  (#162A26 ve #0F1F1C): altı kontrolün hepsi GEÇER (hepsi ≥3:1).
//
// Renk kimliği metriğe aittir: "gönderi" her grafikte aynı mavidir.
// Metin hiçbir zaman seri rengiyle yazılmaz - yalnızca işaret (çizgi, çubuk,
// nokta) seri rengini taşır, etiketler ink token'larındadır.
const SERIES = {
  light: {
    activeUsers: '#028871',
    posts: '#0067A8',
    comments: '#704BE1',
    newUsers: '#E6982B',
  },
  dark: {
    activeUsers: '#34A48B',
    posts: '#2D78A9',
    comments: '#937BE2',
    newUsers: '#BD8119',
  },
}

export const SERIES_LABELS = {
  activeUsers: 'Aktif kişi',
  posts: 'Gönderi',
  comments: 'Yorum',
  newUsers: 'Yeni üye',
}

/**
 * O anki temanın grafik renkleri: seri renkleri + grafik mobilyası
 * (ızgara, eksen, metin, yüzey). Bileşenler ham hex yerine bu rolleri kullanır.
 */
export function useChartColors() {
  const theme = useTheme()
  const b = theme.palette.brand
  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light'
  return {
    mode,
    series: SERIES[mode],
    surface: b.surface,
    grid: b.divider,          // kılcal, yüzeyden bir adım
    baseline: b.borderStrong, // taban çizgisi ızgaradan bir ton belirgin
    axisText: b.inkMuted,
    text: b.ink,
    textSoft: b.inkSoft,
    deemphasis: b.inkMuted,
    hoverWash: b.mode === 'dark' ? 'rgba(230, 242, 238, 0.06)' : 'rgba(23, 53, 48, 0.05)',
  }
}
