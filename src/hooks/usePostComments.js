import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { createComment, isAbortError, listComments, listCommentReplies } from '../services/api.js'
import { cleanText, commentError, fieldErrorsFrom } from '../utils/validation.js'

// Bir gönderinin yorum ağacı - YERİNDE AÇILAN thread modeli: yanıtlar
// ebeveynin altında TEK girintiyle açılır; daha derin yanıtlar da aynı
// girintili blokta "↳ Ad kişisine yanıt" başlığıyla düz listelenir. Böylece
// dar ekranda ikinci bir girinti seviyesi oluşmaz.
//
// Veri: backend her yorum için yalnızca doğrudan yanıt SAYISINI (replyCount)
// döner, yanıtlar tıklanınca sayfalı çekilir. `threads` sözlüğü yorum id ->
// { replies, loading, loadingMore, page, last, expanded } tutar; render
// tarafı bir kök yorumun altındaki bloğu flattenThread() ile düzleştirir.
//
// onCountChange(delta): yorum/yanıt eklenince (+1) ya da silinince (-1)
// gönderinin toplam yorum sayısını güncellemek için.
export function usePostComments(postId, { onCountChange } = {}) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  const [threads, setThreads] = useState({})

  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  // Sunucunun yorum alanına özel hatası (ör. uzunluk) - metin değişince kalkar.
  const [commentServerError, setCommentServerError] = useState(null)
  const postingRef = useRef(false)

  // Eski yanıt (yeniden yükleme ya da başka gönderi sonrası gelen) geçerli
  // listeyi ezmesin diye istek sıra numarası.
  const loadSeqRef = useRef(0)
  // Süren ilk-sayfa / daha-fazla isteklerinin kesilmesi için (unmount,
  // başka gönderiye geçiş).
  const controllerRef = useRef(null)
  const onCountChangeRef = useRef(onCountChange)
  useEffect(() => { onCountChangeRef.current = onCountChange }, [onCountChange])

  const loadComments = useCallback(() => {
    if (!token || !postId) return
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const seq = ++loadSeqRef.current
    setCommentsLoading(true)
    setPage(0)
    setThreads({})
    listComments(token, postId, { page: 0, signal: controller.signal })
      .then(res => {
        if (seq !== loadSeqRef.current) return
        setComments(Array.isArray(res?.content) ? res.content : [])
        setLast(res?.last ?? true)
      })
      .catch(err => { if (seq === loadSeqRef.current && !isAbortError(err)) showError(err.message || 'Yorumlar alınamadı.') })
      .finally(() => { if (seq === loadSeqRef.current) setCommentsLoading(false) })
  }, [token, postId, showError])

  const invalidatePending = useCallback(() => {
    loadSeqRef.current += 1
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  useEffect(() => {
    loadComments()
    return invalidatePending
  }, [loadComments, invalidatePending])

  const patchThread = useCallback((id, patch) => {
    setThreads(prev => ({ ...prev, [id]: { ...(prev[id] || { replies: [], page: 0, last: true, expanded: false, loading: false, loadingMore: false }), ...patch } }))
  }, [])

  // Bir yorumun yanıtlarını (ilk sayfa) çek ve bloğu aç. force=true ise
  // zaten yüklüyse de yeniden çeker (az önce yanıt eklendiğinde).
  const fetchReplies = useCallback(async (comment, { force = false } = {}) => {
    const existing = threads[comment.id]
    if (existing && existing.replies.length > 0 && !force) {
      patchThread(comment.id, { expanded: true })
      return
    }
    patchThread(comment.id, { expanded: true, loading: true })
    try {
      const res = await listCommentReplies(token, comment.id, { page: 0 })
      patchThread(comment.id, {
        replies: Array.isArray(res?.content) ? res.content : [],
        loading: false, page: 0, last: res?.last ?? true, expanded: true
      })
    } catch (err) {
      showError(err.message || 'Yanıtlar alınamadı.')
      patchThread(comment.id, { loading: false })
    }
  }, [threads, token, showError, patchThread])

  const toggleThread = useCallback((comment) => {
    const t = threads[comment.id]
    if (t?.expanded) { patchThread(comment.id, { expanded: false }); return }
    fetchReplies(comment)
  }, [threads, fetchReplies, patchThread])

  const loadMoreReplies = useCallback(async (comment) => {
    const t = threads[comment.id]
    if (!t || t.loadingMore) return
    const nextPage = t.page + 1
    patchThread(comment.id, { loadingMore: true })
    try {
      const res = await listCommentReplies(token, comment.id, { page: nextPage })
      setThreads(prev => {
        const cur = prev[comment.id]
        if (!cur) return prev
        const known = new Set(cur.replies.map(r => r.id))
        const added = (Array.isArray(res?.content) ? res.content : []).filter(r => !known.has(r.id))
        return { ...prev, [comment.id]: { ...cur, replies: [...cur.replies, ...added], last: res?.last ?? true, page: nextPage, loadingMore: false } }
      })
    } catch (err) {
      showError(err.message || 'Yanıtlar alınamadı.')
      patchThread(comment.id, { loadingMore: false })
    }
  }, [threads, token, showError, patchThread])

  const loadMoreComments = async () => {
    if (commentsLoadingMore) return
    const seq = loadSeqRef.current
    const nextPage = page + 1
    setCommentsLoadingMore(true)
    try {
      const res = await listComments(token, postId, { page: nextPage, signal: controllerRef.current?.signal })
      if (seq !== loadSeqRef.current) return
      setComments(prev => {
        const known = new Set(prev.map(c => c.id))
        return [...prev, ...(Array.isArray(res?.content) ? res.content : []).filter(c => !known.has(c.id))]
      })
      setLast(res?.last ?? true)
      setPage(nextPage)
    } catch (err) {
      if (!isAbortError(err)) showError(err.message || 'Yorumlar alınamadı.')
    } finally {
      setCommentsLoadingMore(false)
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    // Çift gönderim (Enter + düğme, art arda dokunma) aynı yorumu iki kez eklemesin.
    if (postingRef.current) return
    const problem = commentError(newComment)
    if (problem) { showError(problem); return }
    postingRef.current = true
    setPostingComment(true)
    setCommentServerError(null)
    try {
      await createComment(token, postId, cleanText(newComment))
      setNewComment('')
      showSuccess('Yorum eklendi.')
      onCountChangeRef.current?.(1)
      loadComments()
    } catch (err) {
      const fieldMsg = fieldErrorsFrom(err).content
      if (fieldMsg) setCommentServerError({ msg: fieldMsg, value: newComment })
      else showError(err.message || 'Yorum eklenemedi.')
    } finally {
      postingRef.current = false
      setPostingComment(false)
    }
  }

  // Bir alanı (content/deleted/replyCount) yorum nerede duruyorsa orada
  // güncelle: kök liste + tüm thread blokları.
  const patchEverywhere = useCallback((id, fn) => {
    setComments(prev => prev.map(c => (c.id === id ? fn(c) : c)))
    setThreads(prev => {
      let changed = false
      const next = {}
      for (const [k, t] of Object.entries(prev)) {
        const replies = t.replies.map(r => { if (r.id === id) { changed = true; return fn(r) } return r })
        next[k] = changed ? { ...t, replies } : t
      }
      return changed ? next : prev
    })
  }, [])

  const submitReply = async (parentComment, content) => {
    await createComment(token, postId, content, parentComment.id)
    patchEverywhere(parentComment.id, c => ({ ...c, replyCount: (c.replyCount ?? 0) + 1 }))
    onCountChangeRef.current?.(1)
    // Yeni yanıt hemen görünsün: ebeveynin bloğunu taze veriyle aç.
    await fetchReplies(parentComment, { force: true })
  }

  const saveCommentUpdate = (updated) => {
    // update() uç noktası replyCount'u bilmez (0 döner) - sadece değişen
    // alanları yazıyoruz.
    patchEverywhere(updated.id, c => ({ ...c, content: updated.content, deleted: updated.deleted }))
    if (updated.deleted) onCountChangeRef.current?.(-1)
  }

  return {
    comments, commentsLoading, commentsLoadingMore, last, threads,
    newComment, setNewComment, postingComment,
    commentError: commentServerError && commentServerError.value === newComment ? commentServerError.msg : null,
    loadMoreComments, submitComment, submitReply, saveCommentUpdate,
    toggleThread, loadMoreReplies
  }
}

// Bir kök yorumun altındaki açık yanıt bloğunu DÜZ bir listeye çevirir.
// Her öğe: { comment, replyingTo } - replyingTo, yanıtın doğrudan kök
// yoruma değil bir başka yanıta verildiğini gösterir (Instagram'daki
// "@ad" bağlamı). İç içe yanıtlar sırayla, ebeveyninden hemen sonra gelir;
// ekranda ek girinti oluşmaz.
export function flattenThread(rootComment, threads) {
  const out = []
  const walk = (parent, replyingTo) => {
    const t = threads[parent.id]
    if (!t?.expanded) return
    for (const r of t.replies) {
      out.push({ kind: 'reply', key: `r-${r.id}`, comment: r, replyingTo, parent })
      walk(r, r.authorName)
    }
    if (t.loading) out.push({ kind: 'loading', key: `l-${parent.id}`, parent })
    else if (!t.last) out.push({ kind: 'more', key: `m-${parent.id}`, parent, loadingMore: t.loadingMore })
  }
  walk(rootComment, null)
  return out
}
