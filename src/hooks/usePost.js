import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useConfirm } from '../context/ConfirmContext.jsx'
import { deletePost, getPost, pinPost, unpinPost, updatePost } from '../services/api.js'

// Bir gönderinin kendisini (yorumlar hariç) yükleme + düzenleme + silme
// state/handler'larını sarmalar - PostDetail.jsx'ten taşındı (bkz.
// clean-code audit, "god component" bölünmesi).
export function usePost(postId) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [savingPost, setSavingPost] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)
  const [togglingPin, setTogglingPin] = useState(false)

  const loadPost = useCallback(() => {
    if (!token || !postId) return
    setLoading(true)
    setError('')
    getPost(token, postId)
      .then(data => {
        setPost(data)
        setEditTitle(data.title)
        setEditContent(data.content)
      })
      .catch(err => setError(err.message || 'Gönderi yüklenemedi.'))
      .finally(() => setLoading(false))
  }, [token, postId])

  useEffect(() => { loadPost() }, [loadPost])

  const startEditing = () => {
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditingPost(true)
  }

  const savePostEdit = async () => {
    if (!editTitle.trim()) { showError('Başlık zorunludur.'); return }
    if (!editContent.trim()) { showError('İçerik zorunludur.'); return }
    setSavingPost(true)
    try {
      const updated = await updatePost(token, post.id, { title: editTitle.trim(), content: editContent.trim() })
      setPost(updated || { ...post, title: editTitle.trim(), content: editContent.trim() })
      setEditingPost(false)
      showSuccess('Gönderi güncellendi.')
    } catch (err) {
      showError(err.message || 'Gönderi güncellenemedi.')
    } finally {
      setSavingPost(false)
    }
  }

  // onDeleted(post) - silme başarılı olunca çağrılır (ör. navigate ile
  // alt gruba dönmek için) - navigate PostDetail'de kaldığından buradan
  // enjekte ediliyor.
  const removePost = async (onDeleted) => {
    if (!(await confirm('Bu gönderiyi silmek istiyor musun?', { title: 'Gönderiyi sil' }))) return
    setDeletingPost(true)
    try {
      await deletePost(token, post.id)
      showSuccess('Gönderi silindi.')
      onDeleted?.(post)
    } catch (err) {
      showError(err.message || 'Gönderi silinemedi.')
      setDeletingPost(false)
    }
  }

  // Faz6: sabitlenmiş gönderi - X'teki "hakkımda" niteliğindeki bir
  // gönderiyi profilde öne çıkarma. save/unsave (SaveButton) ile aynı
  // optimistic-olmayan desen: API yanıtını (zenginleştirilmiş PostResponse)
  // doğrudan post state'ine yazıyoruz - backend zaten önceki sabitlenmiş
  // postu otomatik kaldırdığı için burada ekstra bir senkronizasyona
  // gerek yok (PostDetail sadece TEK bir postu gösteriyor, kullanıcının
  // önceden sabitlediği BAŞKA bir post varsa onun pinned=false olduğunu
  // profil listesi bir sonraki yüklemede zaten backend'den doğru alacak).
  const togglePin = async () => {
    if (!post) return
    setTogglingPin(true)
    try {
      const updated = post.pinned ? await unpinPost(token, post.id) : await pinPost(token, post.id)
      setPost(updated || { ...post, pinned: !post.pinned })
      showSuccess(post.pinned ? 'Gönderinin sabiti kaldırıldı.' : 'Gönderi profiline sabitlendi.')
    } catch (err) {
      showError(err.message || 'İşlem gerçekleştirilemedi.')
    } finally {
      setTogglingPin(false)
    }
  }

  return {
    post, loading, error,
    editingPost, setEditingPost, editTitle, setEditTitle, editContent, setEditContent,
    savingPost, deletingPost, togglingPin,
    startEditing, savePostEdit, removePost, togglePin
  }
}
