import { useMemo } from 'react'
import {
  HomeRounded, HomeOutlined, GroupsRounded, GroupsOutlined, SearchRounded, SearchOutlined,
  ChatBubbleRounded, ChatBubbleOutlineRounded,
  PersonRounded, PersonOutlineRounded, AdminPanelSettingsRounded, AdminPanelSettingsOutlined,
  CottageRounded, CottageOutlined
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'

// Instagram deseni: sekme aktifken outline ikon yerine dolu (filled)
// versiyonu gösterilir - salt renk değişiminden daha güçlü, alışılmış bir
// "buradasın" sinyali. iconOutline pasifken, icon aktifken kullanılıyor.
// Mesajlar sekmesinin rozeti canlı sayaçtan gelir (bkz. NavIcon).
const BASE_NAV_ITEMS = [
  // "Anasayfa" tek kelime: 5-6 sekmeli mobil alt navda iki kelime dar
  // ekranda ikinci satıra taşıp hizayı bozuyor.
  { label: 'Anasayfa', icon: <HomeRounded />, iconOutline: <HomeOutlined />, to: '/home' },
  { label: 'Gruplar', icon: <GroupsRounded />, iconOutline: <GroupsOutlined />, to: '/groups' },
  { label: 'Ara', icon: <SearchRounded />, iconOutline: <SearchOutlined />, to: '/search' },
  { label: 'Mesajlar', icon: <ChatBubbleRounded />, iconOutline: <ChatBubbleOutlineRounded />, to: '/messages' },
  { label: 'Profil', icon: <PersonRounded />, iconOutline: <PersonOutlineRounded />, to: '/profile' }
]

const ADMIN_NAV_ITEM = {
  label: 'Admin', icon: <AdminPanelSettingsRounded />, iconOutline: <AdminPanelSettingsOutlined />, to: '/admin'
}

// Sağlıktan Mahalle (oyun): yalnızca masaüstü kenar çubuğunda. Mobil alt
// menü 5 sekmeyle dolu; mobilde giriş Anasayfa kartı ve Profil'deki
// "Evimi gör" düğmesinden.
const GAME_NAV_ITEM = {
  label: 'Mahalle', icon: <CottageRounded />, iconOutline: <CottageOutlined />, to: '/mahalle'
}

// Kullanıcının rolüne göre gezinme sekmeleri. desktop: kenar çubuğuna özel
// sekmeler (Mahalle) de eklenir.
export function useNavItems({ desktop = false } = {}) {
  const { user } = useAuth()
  return useMemo(() => {
    const base = desktop ? [...BASE_NAV_ITEMS.slice(0, 4), GAME_NAV_ITEM, BASE_NAV_ITEMS[4]] : BASE_NAV_ITEMS
    return user?.role === 'ADMIN' ? [...base, ADMIN_NAV_ITEM] : base
  }, [user?.role, desktop])
}

export const isNavItemActive = (item, pathname) => pathname.startsWith(item.to)
