import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { acceptAnswer, unacceptAnswer } from '../services/api.js'

// Soru gönderisinde "en iyi cevap" seçimi/kaldırılması. Sunucunun döndürdüğü
// güncel gönderi alanları setPost ile mevcut gönderiye yazılır.
export function useAcceptedAnswer(post, setPost) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [pending, setPending] = useState(false)

  const run = async (request, { successMessage, errorMessage }) => {
    setPending(true)
    try {
      const updated = await request()
      setPost(p => ({ ...p, ...updated }))
      if (successMessage) showSuccess(successMessage)
    } catch (err) {
      showError(err.message || errorMessage)
    } finally {
      setPending(false)
    }
  }

  const accept = (commentId) => run(
    () => acceptAnswer(token, post.id, commentId),
    { successMessage: 'En iyi cevap seçildi. Yazan kişiye haber verdik.', errorMessage: 'En iyi cevap seçilemedi.' }
  )

  const clear = () => run(
    () => unacceptAnswer(token, post.id),
    { errorMessage: 'Seçim kaldırılamadı.' }
  )

  return { accept, clear, pending }
}
