import { Badge } from '@mui/material'
import { useMessaging } from '../../context/MessagingContext.jsx'

// Sekme ikonu: aktifken dolu, değilken outline; Mesajlar sekmesinde bekleyen
// istek + okunmamış mesaj rozeti.
export default function NavIcon({ item, active }) {
  const { pendingRequestCount, unreadMessageCount } = useMessaging()
  const badgeCount = item.to === '/messages' ? pendingRequestCount + unreadMessageCount : 0
  const icon = active ? item.icon : item.iconOutline
  if (badgeCount <= 0) return icon
  return <Badge badgeContent={badgeCount} color="error" max={99}>{icon}</Badge>
}

