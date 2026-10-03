import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { acceptAnswer, unacceptAnswer } from '../services/api.js'

// Soru gönderisinde "en iyi cevap" seçimi/kaldırılması. Sunucunun döndürdüğü
// güncel gönderi alanları setPost ile mevcut gönderiye yazılır.
// celebration: seçim başarıyla yapılınca { commentId, at } - sayfa bununla
// yaprak kutlamasını (LeafBurst) oynatır ve seçilen yorumu bir kez parlatır.
export function useAcceptedAnswer(post, setPost) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [pending, setPending] = useState(false)
  const [celebration, setCelebration] = useState(null)

  const run = async (request, { successMessage, errorMessage, onDone }) => {
    setPending(true)
    try {
      const updated = await request()
      setPost(p => ({ ...p, ...updated }))
      onDone?.()
      if (successMessage) showSuccess(successMessage)
    } catch (err) {
      showError(err.message || errorMessage)
    } finally {
      setPending(false)
    }
  }

  const accept = (commentId) => run(
    () => acceptAnswer(token, post.id, commentId),
    {
      successMessage: 'En iyi cevap seçildi. Yazan kişiye teşekkürünü ilettik.',
      errorMessage: 'En iyi cevap seçilemedi. Bağlantını kontrol edip yeniden dene.',
      onDone: () => setCelebration({ commentId, at: Date.now() })
    }
  )

  const clear = () => run(
    () => unacceptAnswer(token, post.id),
    { errorMessage: 'Seçim kaldırılamadı. Biraz sonra yeniden dene.' }
  )

  return { accept, clear, pending, celebration }
}
