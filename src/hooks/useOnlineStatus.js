import { useEffect, useState } from 'react'

// Tarayıcının çevrimiçi/çevrimdışı durumu. navigator.onLine "kesin bağlı"
// demek değildir (yalnızca ağ arayüzü var/yok), ama "kesin kopuk" için
// güvenilirdir - uçak modu, Wi-Fi düşmesi gibi durumlarda kullanıcıya
// nazikçe haber vermek için yeterli (bkz. ResponsiveShell'deki şerit).
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
