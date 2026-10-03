import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getMyDiseaseGroups } from '../services/api.js'

// Kullanıcının üye olduğu hastalık grupları. null = henüz bilinmiyor.
// İkincil veri: istek başarısız olursa boş liste kabul edilir - çağıran
// ekran güvenli tarafta kalır (ör. yorum kutusunu gizler; backend zaten
// üye olmayanın yorumunu reddederdi).
export function useMyDiseaseGroups() {
  const { token } = useAuth()
  const [groups, setGroups] = useState(null)

  useEffect(() => {
    if (!token) return undefined
    let alive = true
    getMyDiseaseGroups(token)
      .then(list => { if (alive) setGroups(Array.isArray(list) ? list : []) })
      .catch(() => { if (alive) setGroups([]) })
    return () => { alive = false }
  }, [token])

  return groups
}
