import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useConfirm } from '../context/ConfirmContext.jsx'
import { joinDiseaseGroup, leaveDiseaseGroup } from '../services/api.js'

// Katıl/ayrıl akışı üç ekranda (grup listesi, grup detayı, profil > Gruplarım)
// aynı olmalı: aynı onay metni, aynı bildirim, aynı "istek sürerken buton
// kilitli" davranışı. Her ekran kendi kopyasını tutunca metinler ve hata
// davranışı birbirinden ayrışıyordu - tek kaynak burası.
//
// join/leave başarıda true, iptal ya da hatada false döner; çağıran taraf
// kendi listesini/sayaçlarını buna göre günceller.
export function useGroupMembership() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()
  const [pendingId, setPendingId] = useState(null)

  const join = useCallback(async (group) => {
    if (!token || !group) return false
    setPendingId(group.id)
    try {
      await joinDiseaseGroup(token, group.id)
      showSuccess(`"${group.name}" grubuna katıldın.`)
      return true
    } catch (err) {
      showError(err.message || 'Gruba katılınamadı.')
      return false
    } finally {
      setPendingId(null)
    }
  }, [token, showError, showSuccess])

  const leave = useCallback(async (group) => {
    if (!token || !group) return false
    const ok = await confirm(
      `"${group.name}" grubundan ayrılmak istiyor musun? Gönderilerin silinmez; istediğin zaman yeniden katılabilirsin.`,
      { title: 'Gruptan ayrıl', confirmLabel: 'Ayrıl' }
    )
    if (!ok) return false
    setPendingId(group.id)
    try {
      await leaveDiseaseGroup(token, group.id)
      showSuccess(`"${group.name}" grubundan ayrıldın.`)
      return true
    } catch (err) {
      showError(err.message || 'Gruptan ayrılınamadı.')
      return false
    } finally {
      setPendingId(null)
    }
  }, [token, confirm, showError, showSuccess])

  return { join, leave, pendingId }
}
