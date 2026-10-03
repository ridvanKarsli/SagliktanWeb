import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useConfirm } from '../context/ConfirmContext.jsx'
import { deletePost, getPost, pinPost, unpinPost, updatePost } from '../services/api.js'
import { cleanLine, cleanText, fieldErrorsFrom, postContentError, postTitleError } from '../utils/validation.js'

// Bir gönderinin kendisini (yorumlar hariç) yükleme + düzenleme + silme +
// sabitleme durumunu sarmalar (bkz. PostDetail).
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

  // Yalnızca en son isteğin yanıtı uygulanır (gönderi değişimi / unmount).
  const loadSeqRef = useRef(0)

  const loadPost = useCallback(() => {
    if (!token || !postId) return
    const seq = ++loadSeqRef.current
    const isCurrent = () => seq === loadSeqRef.current
    setLoading(true)
    setError('')
    getPost(token, postId)
      .then(data => {
        if (!isCurrent()) return
        setPost(data)
        setEditTitle(data.title)
        setEditContent(data.content)
      })
      .catch(err => { if (isCurrent()) setError(err.message || 'Gönderi yüklenemedi.') })
      .finally(() => { if (isCurrent()) setLoading(false) })
  }, [token, postId])

  const invalidatePending = useCallback(() => { loadSeqRef.current += 1 }, [])

  useEffect(() => {
    loadPost()
    return invalidatePending
  }, [loadPost, invalidatePending])

  const startEditing = () => {
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditingPost(true)
  }

  // onFieldErrors(fieldErrors) => true: sunucu hataları forma (alanların
  // altına) yerleştirildi; aksi halde genel bildirim gösterilir. Alan
  // kontrolleri form tarafında (PostEditForm) yapılır; burada son güvence.
  const savePostEdit = async (onFieldErrors) => {
    if (savingPost) return
    const title = cleanLine(editTitle)
    const content = cleanText(editContent)
    const problem = postTitleError(title) || postContentError(content)
    if (problem) { showError(problem); return }
    if (title === post.title && content === post.content) { setEditingPost(false); return }
    setSavingPost(true)
    try {
      const updated = await updatePost(token, post.id, { title, content })
      setPost(updated || { ...post, title, content })
      setEditingPost(false)
      showSuccess('Gönderi güncellendi.')
    } catch (err) {
      const handled = typeof onFieldErrors === 'function' && onFieldErrors(fieldErrorsFrom(err))
      if (!handled) showError(err.message || 'Gönderi güncellenemedi.')
    } finally {
      setSavingPost(false)
    }
  }

  // onDeleted(post): silme başarılı olunca çağrılır (ör. alt gruba dönmek için).
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

  // Profile sabitleme: API yanıtı (güncel PostResponse) doğrudan yazılır.
  // Backend önceki sabitlenmiş gönderiyi kendisi kaldırır; profil listesi
  // bunu bir sonraki yüklemede zaten doğru alır.
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

  const cancelEditing = () => setEditingPost(false)

  // Yorum/yanıt eklenip silindikçe gönderideki yorum sayısını güncel tut
  // (soru gönderisindeki "en iyi cevabı seç" ipucu bu sayıya bakıyor).
  const adjustCommentCount = useCallback((delta) => {
    setPost(p => (p ? { ...p, commentCount: Math.max(0, (p.commentCount ?? 0) + delta) } : p))
  }, [])

  return {
    post, setPost, loading, error,
    editingPost, editTitle, setEditTitle, editContent, setEditContent,
    savingPost, deletingPost, togglingPin,
    startEditing, cancelEditing, savePostEdit, removePost, togglePin, adjustCommentCount
  }
}
