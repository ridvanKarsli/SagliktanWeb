import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { createComment, listComments, listCommentReplies } from '../services/api.js'
import { bumpReplyCount, updateCommentEverywhere } from '../utils/commentTree.js'

// Bir gönderinin yorum ağacı: kök liste + X/Twitter tarzı thread-drill
// navigasyonu (threadStack) - PostDetail.jsx'ten taşındı (bkz. clean-code
// audit, "god component" bölünmesi). Yorum yazma (newComment/submitComment)
// de burada, çünkü başarılı gönderim doğrudan bu hook'un state'ini (comments
// listesini) etkiliyor.
//
// threadStack: her frame { comment, replies, repliesLoading,
// repliesLoadingMore, page, last }. Yalnızca en üstteki (son) frame ekrana
// basılır; geri gitmek sadece stack'ten pop eder (yeniden fetch gerekmez).
export function usePostComments(postId) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [threadStack, setThreadStack] = useState([])

  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const loadComments = useCallback(() => {
    if (!token || !postId) return
    setCommentsLoading(true)
    setPage(0)
    setThreadStack([])
    listComments(token, postId, { page: 0 })
      .then(res => {
        setComments(Array.isArray(res?.content) ? res.content : [])
        setLast(res?.last ?? true)
      })
      .catch(err => showError(err.message || 'Yorumlar alınamadı.'))
      .finally(() => setCommentsLoading(false))
  }, [token, postId, showError])

  useEffect(() => { loadComments() }, [loadComments])

  // Bir yorumun thread'ini aç: o yorum "odak" olur, doğrudan yanıtları
  // backend'den (ilk sayfa) çekilir. Zaten açık olan bir thread'i tekrar
  // açmak (ör. az önce ona bir yanıt eklendiğinde) yeni bir seviye
  // EKLEMEZ, ama yanıtları YENİDEN çeker ki yeni eklenen yanıt görünsün.
  const openThread = useCallback(async (comment) => {
    setThreadStack(prev => {
      if (prev.length > 0 && prev[prev.length - 1].comment.id === comment.id) return prev
      return [...prev, { comment, replies: [], repliesLoading: true, repliesLoadingMore: false, page: 0, last: true }]
    })
    try {
      const res = await listCommentReplies(token, comment.id, { page: 0 })
      setThreadStack(prev => {
        const idx = prev.findIndex(f => f.comment.id === comment.id)
        if (idx === -1) return prev
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          replies: Array.isArray(res?.content) ? res.content : [],
          repliesLoading: false,
          page: 0,
          last: res?.last ?? true
        }
        return next
      })
    } catch (err) {
      showError(err.message || 'Yanıtlar alınamadı.')
      setThreadStack(prev => prev.map(f => (f.comment.id === comment.id ? { ...f, repliesLoading: false } : f)))
    }
  }, [token, showError])

  const goBackThread = () => setThreadStack(prev => prev.slice(0, -1))

  // Açık olan thread seviyesinde "Daha Fazla Yükle" - o yorumun bir sonraki
  // yanıt sayfasını mevcut listeye ekler.
  const loadMoreThreadReplies = async () => {
    const frame = threadStack[threadStack.length - 1]
    if (!frame) return
    const nextPage = frame.page + 1
    setThreadStack(prev => prev.map((f, i) => (i === prev.length - 1 ? { ...f, repliesLoadingMore: true } : f)))
    try {
      const res = await listCommentReplies(token, frame.comment.id, { page: nextPage })
      setThreadStack(prev => prev.map((f, i) => (i === prev.length - 1 ? {
        ...f,
        replies: [...f.replies, ...(Array.isArray(res?.content) ? res.content : [])],
        last: res?.last ?? true,
        page: nextPage,
        repliesLoadingMore: false
      } : f)))
    } catch (err) {
      showError(err.message || 'Yanıtlar alınamadı.')
      setThreadStack(prev => prev.map((f, i) => (i === prev.length - 1 ? { ...f, repliesLoadingMore: false } : f)))
    }
  }

  // Sayfa numaralı gezinme yerine mevcut listeye ekleyen "Daha Fazla Yükle".
  const loadMoreComments = async () => {
    const nextPage = page + 1
    setCommentsLoadingMore(true)
    try {
      const res = await listComments(token, postId, { page: nextPage })
      setComments(prev => [...prev, ...(Array.isArray(res?.content) ? res.content : [])])
      setLast(res?.last ?? true)
      setPage(nextPage)
    } catch (err) {
      showError(err.message || 'Yorumlar alınamadı.')
    } finally {
      setCommentsLoadingMore(false)
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) { showError('Yorum boş olamaz.'); return }
    setPostingComment(true)
    try {
      await createComment(token, postId, newComment.trim())
      setNewComment('')
      showSuccess('Yorum eklendi.')
      loadComments()
    } catch (err) {
      showError(err.message || 'Yorum eklenemedi.')
    } finally {
      setPostingComment(false)
    }
  }

  const submitReply = async (parentCommentId, content) => {
    await createComment(token, postId, content, parentCommentId)
    // Yanıtın kendisi CommentRow.submitReply'de ardından onOpenThread(comment)
    // çağrılarak (o dalın taze verisiyle) gösterilecek - burada sadece
    // ebeveynin "N yanıtı görüntüle" sayacını, nerede gösteriliyorsa orada
    // bir artırıyoruz.
    const { comments: nextComments, threadStack: nextStack } = bumpReplyCount(comments, threadStack, parentCommentId, 1)
    setComments(nextComments)
    setThreadStack(nextStack)
  }

  const saveCommentUpdate = (updated) => {
    const { comments: nextComments, threadStack: nextStack } = updateCommentEverywhere(comments, threadStack, updated)
    setComments(nextComments)
    setThreadStack(nextStack)
  }

  const currentThread = threadStack.length > 0 ? threadStack[threadStack.length - 1] : null
  const focusedComment = currentThread?.comment ?? null

  return {
    comments, commentsLoading, commentsLoadingMore, last,
    currentThread, focusedComment,
    newComment, setNewComment, postingComment,
    loadMoreComments, submitComment, submitReply, saveCommentUpdate,
    openThread, goBackThread, loadMoreThreadReplies
  }
}
