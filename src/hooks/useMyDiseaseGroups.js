import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchMyGroups, peekMyGroups, subscribeMyGroups } from '../services/myGroups.js'

// Kullanıcının üye olduğu hastalık grupları. null = henüz bilinmiyor.
// Veri services/myGroups.js'teki paylaşımlı önbellekten gelir: ilk render'da
// taze bir kopya varsa null hiç görünmez; katıl/ayrıl sonrası
// (invalidateMyGroups) otomatik yeniden çekilir.
//
// İkincil veri: istek başarısız olursa boş liste kabul edilir - çağıran
// ekran güvenli tarafta kalır (ör. yorum kutusunu gizler; backend zaten
// üye olmayanın yorumunu reddederdi).
export function useMyDiseaseGroups() {
  const { token } = useAuth()
  const [groups, setGroups] = useState(() => peekMyGroups(token))

  const load = useCallback((signal) => {
    if (!token) return
    fetchMyGroups(token)
      .then(list => { if (!signal?.aborted) setGroups(list) })
      .catch(() => { if (!signal?.aborted) setGroups([]) })
  }, [token])

  useEffect(() => {
    if (!token) { setGroups(null); return undefined }
    const controller = new AbortController()
    load(controller.signal)
    // Üyelik değişince (ya da çıkışta) önbellek boşalır -> yeniden çek.
    const unsubscribe = subscribeMyGroups((data) => {
      if (data) setGroups(data)
      else load(controller.signal)
    })
    return () => { controller.abort(); unsubscribe() }
  }, [token, load])

  return groups
}
