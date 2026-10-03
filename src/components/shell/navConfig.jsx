import { useMemo } from 'react'
import {
  HomeRounded, HomeOutlined, GroupsRounded, GroupsOutlined, SearchRounded, SearchOutlined,
  ChatBubbleRounded, ChatBubbleOutlineRounded,
  PersonRounded, PersonOutlineRounded, AdminPanelSettingsRounded, AdminPanelSettingsOutlined
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

// Kullanıcının rolüne göre gezinme sekmeleri.
export function useNavItems() {
  const { user } = useAuth()
  return useMemo(
    () => (user?.role === 'ADMIN' ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS),
    [user?.role]
  )
}

export const isNavItemActive = (item, pathname) => pathname.startsWith(item.to)
