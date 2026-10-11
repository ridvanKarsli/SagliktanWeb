import { useAuth } from '../context/AuthContext.jsx'
import { useMyDiseaseGroups } from './useMyDiseaseGroups.js'
import { parseServerDate } from '../utils/format.js'

const MIN_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000

// Mahalle kısayolu (yüzen ev düğmesi) kimlere görünür: yöneticiler her zaman;
// diğerleri en az bir hastalık grubuna üye VE hesabı en az 3 günlük ise.
// Grup listesi paylaşımlı önbellekten gelir (çoğu zaman ek istek yok).
// Döner: true | false | null (henüz bilinmiyor - düğme gösterilmez, yanıp sönme olmaz).
export function useMahalleEligible() {
  const { user } = useAuth()
  const groups = useMyDiseaseGroups()
  if (!user) return false
  if (user.role === 'ADMIN') return true
  const created = parseServerDate(user.createdAt)
  if (!created || Date.now() - created.getTime() < MIN_ACCOUNT_AGE_MS) return false
  if (groups === null) return null
  return groups.length > 0
}
