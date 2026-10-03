import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { AVATAR_RECHECK_EVENT, checkAvatarUnlocks } from './avatarUnlocks.js'

function joinNames(names) {
  if (names.length <= 1) return names[0] || ''
  return `${names.slice(0, -1).join(', ')} ve ${names[names.length - 1]}`
}

/**
 * Yeni açılan yol arkadaşlarını yakalar: takıldığında seçenekleri (oturumda
 * bir kez, requestAvatarRecheck ile yeniden) çeker, cihazdaki "görüldü"
 * listesiyle karşılaştırır; yeni açılan varsa yaprak yağmuru + kısa bir
 * mesaj gösterir. İlk çalışmada (liste yokken) sessizce başlar.
 * Uygulama kabuğuna bir kez takılması yeterli; birden fazla yerde takılı
 * olsa da tek istek ve tek kutlama olur.
 */
export function useAvatarUnlocks() {
  const { token, user } = useAuth()
  const { showSuccess } = useNotification()
  const [burst, setBurst] = useState(0)
  const userId = user?.id

  useEffect(() => {
    if (!token || userId == null) return undefined
    let alive = true
    const run = (force = false) => {
      checkAvatarUnlocks(token, userId, { force }).then(({ newlyUnlocked, claim }) => {
        if (!alive || !claim()) return
        const names = newlyUnlocked.map(a => a.name)
        setBurst(Date.now())
        showSuccess(
          names.length > 1
            ? `Yeni yol arkadaşların açıldı: ${joinNames(names)}! Profilinden seçebilirsin.`
            : `Yeni yol arkadaşın açıldı: ${names[0]}! Profilinden seçebilirsin.`,
          6500
        )
      })
    }
    run()
    const onRecheck = () => run(true)
    window.addEventListener(AVATAR_RECHECK_EVENT, onRecheck)
    return () => {
      alive = false
      window.removeEventListener(AVATAR_RECHECK_EVENT, onRecheck)
    }
  }, [token, userId, showSuccess])

  return burst
}
