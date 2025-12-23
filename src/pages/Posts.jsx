import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Box, Button, Stack, TextField, Typography, Divider,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, Alert, Snackbar, CircularProgress,
  Autocomplete, Avatar, IconButton
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Add, Close } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'

import PostCard from '../components/PostCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllPosts, getChatsWithFilter, getDiseaseNames, getUserByID } from '../services/api.js'
import { addComment as apiAddComment } from '../services/api.js'
import {
  likeChatReaction,
  dislikeChatReaction,
  cancelLikeChatReaction,
  cancelDislikeChatReaction,
  likeCommentReaction,
  dislikeCommentReaction,
  cancelLikeCommentReaction,
  cancelDislikeCommentReaction
} from '../services/api.js'
import { getLikedCommentPeople, getDislikedCommentPeople } from '../services/api.js'
import { addChat } from '../services/api.js'

/* ---------------- Utils ---------------- */
function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

function parseYMD(ymd) {
  // "YYYY-MM-DD" -> local timestamp
  if (!ymd) return Date.now()
  const [y, m, d] = String(ymd).split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1).getTime()
}

function dedupUsers(arr) {
  if (!Array.isArray(arr)) return []
  const map = new Map()
  for (const u of arr) {
    const id = u?.userID ?? u?.userId
    if (id == null) continue
    if (!map.has(id)) map.set(id, u)
  }
  return Array.from(map.values())
}

function myVoteFor(currentUserId, likedUsers, dislikedUsers) {
  if (!currentUserId) return 0
  const liked = likedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId)
  const disliked = dislikedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId)
  if (liked) return 1
  if (disliked) return -1
  return 0
}

// Recursive function to convert nested comments
function toCommentModel(comment, currentUserId, idToName, includeNested = true) {
  const cLiked = dedupUsers(comment.likedUser || [])
  const cDisliked = dedupUsers(comment.dislikedUser || [])
  const cidRaw = comment.postID ?? comment.commnetsID ?? comment.commentsID ?? comment.id
  const cidNum = Number(cidRaw)
  const safeId = Number.isFinite(cidNum) ? `c_${cidNum}` : `c_tmp_${Math.random().toString(36).slice(2)}`
  const authorId = comment.userID ?? comment.userId
  const authorOverride = idToName?.get?.(authorId)
  
  // Recursively process nested comments (sadece includeNested true ise)
  const nestedComments = includeNested && Array.isArray(comment.comments)
    ? comment.comments.map(c => toCommentModel(c, currentUserId, idToName, includeNested))
    : []

  return {
    id: safeId,
    postID: cidNum, // Yorumun postID'sini sakla (yoruma yorum eklemek için gerekli)
    author: authorOverride || `Kullanıcı #${comment.userID ?? '???'}`,
    authorId: authorId,
    text: comment.message ?? '',
    timestamp: parseYMD(comment.uploadDate),
    likes: cLiked.length,
    dislikes: cDisliked.length,
    myVote: myVoteFor(currentUserId, cLiked, cDisliked),
    likedUsers: (Array.isArray(comment.likedUser) ? comment.likedUser : []).map(u => ({
      userID: u?.userID ?? u?.userId,
      name: u?.name ?? null,
      surname: u?.surname ?? null,
      chatReactionsID: u?.chatReactionsID ?? u?.commentReactionsID ?? u?.reactionID ?? u?.id
    })),
    dislikedUsers: (Array.isArray(comment.dislikedUser) ? comment.dislikedUser : []).map(u => ({
      userID: u?.userID ?? u?.userId,
      name: u?.name ?? null,
      surname: u?.surname ?? null,
      chatReactionsID: u?.chatReactionsID ?? u?.commentReactionsID ?? u?.reactionID ?? u?.id
    })),
    comments: nestedComments,
    category: comment.category || null, // Category'yi de sakla
    // Alt yorum sayısını sakla (nested comments gösterilmediğinde kullanılacak)
    childCommentCount: Array.isArray(comment.comments) ? comment.comments.length : 0
  }
}

function toPostModel(post, currentUserId, authorNameOverride, idToName) {
  const liked = dedupUsers(post.likedUser || [])
  const disliked = dedupUsers(post.dislikedUser || [])

  // Process comments (only top-level comments, nested ones are handled recursively)
  const comments = Array.isArray(post.comments)
    ? post.comments.map(c => toCommentModel(c, currentUserId, idToName))
    : []

  const authorFull = authorNameOverride
    || [post.name, post.surname].filter(Boolean).join(' ')
    || post.userName
    || `Kullanıcı #${post.userID ?? '???'}`

  return {
    id: `p_${post.postID}`,
    author: authorFull,
    authorId: post.userID ?? post.userId,
    content: post.message ?? '',
    timestamp: parseYMD(post.uploadDate),
    likes: liked.length,
    dislikes: disliked.length,
    myVote: myVoteFor(currentUserId, liked, disliked),
    comments,
    category: post.category || null,
    likedUsers: (Array.isArray(post.likedUser) ? post.likedUser : []).map(u => ({
      userID: u?.userID ?? u?.userId,
      name: u?.name ?? null,
      surname: u?.surname ?? null,
      chatReactionsID: u?.chatReactionsID ?? u?.postReactionID ?? u?.reactionID ?? u?.id
    })),
    dislikedUsers: (Array.isArray(post.dislikedUser) ? post.dislikedUser : []).map(u => ({
      userID: u?.userID ?? u?.userId,
      name: u?.name ?? null,
      surname: u?.surname ?? null,
      chatReactionsID: u?.chatReactionsID ?? u?.postReactionID ?? u?.reactionID ?? u?.id
    }))
  }
}

/* ---------------- Page ---------------- */
export default function Posts() {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { user, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [allPosts, setAllPosts] = useState([]) // Tüm postları sakla (client-side filtreleme için)
  const [msg, setMsg] = useState('')

  const [category, setCategory] = useState(null) // null olarak başlat (Autocomplete ile uyumlu)
  const [categories, setCategories] = useState([])
  const [catsLoading, setCatsLoading] = useState(false)
  const [catsError, setCatsError] = useState('')
  const catsLoadedRef = useRef(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false) // Filtreleme için ayrı loading state

  const params = new URLSearchParams(location.search)
  const dialogOpen = params.get('new') === '1'

  useEffect(() => {
    // /posts#compose desteği
    if (location.hash === '#compose') navigate('/posts?new=1', { replace: true })
  }, [location.hash, navigate])

  async function loadChats(useFilter = false) {
    const isLoadingInitial = !useFilter
    if (isLoadingInitial) {
      setLoading(true)
    } else {
      setFilterLoading(true)
    }
    setError('')
    
    try {
      let fetchedPosts = []
      
      // Server-side filtreleme dene
      if (category && category.trim()) {
        try {
          fetchedPosts = await getChatsWithFilter(token, category.trim())
          // Eğer server-side filtreleme başarısız olduysa (boş döndü ama hata yok), 
          // client-side filtreleme için tüm postları yükle
          if (Array.isArray(fetchedPosts) && fetchedPosts.length === 0 && allPosts.length > 0) {
            // Client-side filtreleme yap
            fetchedPosts = allPosts.filter(p => {
              const postCategory = p?.category || ''
              return String(postCategory).toLowerCase().trim() === String(category).toLowerCase().trim()
            })
          }
        } catch (filterError) {
          console.warn('[Posts] Server-side filter failed, using client-side fallback:', filterError)
          // Server-side filtreleme başarısız oldu, client-side filtreleme yap
          if (allPosts.length > 0) {
            fetchedPosts = allPosts.filter(p => {
              const postCategory = p?.category || ''
              return String(postCategory).toLowerCase().trim() === String(category).toLowerCase().trim()
            })
          } else {
            // Tüm postları yükle ve sonra filtrele
            const all = await getAllPosts(token)
            fetchedPosts = all.filter(p => {
              const postCategory = p?.category || ''
              return String(postCategory).toLowerCase().trim() === String(category).toLowerCase().trim()
            })
          }
        }
      } else {
        // Kategori yok, tüm postları yükle
        fetchedPosts = await getAllPosts(token)
      }
      
      // Filter only top-level posts (parentsID === 0)
      const data = Array.isArray(fetchedPosts) 
        ? fetchedPosts.filter(p => p.parentsID === 0)
        : []
      
      // Debug: Ham payload ve yorumlardaki reaction ID'ler
      try {
        console.groupCollapsed(`[Feed] ${category ? 'Filtered' : 'All'} posts payload`)
        console.debug('count:', data.length, 'category:', category || 'none')
        ;(data || []).slice(0, 10).forEach((p, idx) => {
          const comments = Array.isArray(p?.comments) ? p.comments : []
          console.debug(`#${idx} postID=${p?.postID} category=${p?.category} comments=${comments.length}`)
        })
        console.groupEnd()
      } catch {}
      
      // Yazar ve yorum yazarlarını userID -> full name ile zenginleştir (recursive)
      const ids = new Set()
      function collectUserIDs(item) {
        const uid = item?.userID ?? item?.userId
        if (uid != null) ids.add(uid)
        if (Array.isArray(item?.comments)) {
          for (const c of item.comments) {
            collectUserIDs(c) // Recursive
          }
        }
      }
      for (const post of data) {
        collectUserIDs(post)
      }
      
      const idToName = new Map()
      await Promise.all(Array.from(ids).map(async (id) => {
        try {
          const person = await getUserByID(token, id)
          const full = [person?.name, person?.surname].filter(Boolean).join(' ')
          if (full) idToName.set(id, full)
        } catch {}
      }))

      const meId = user?.userId ?? user?.userID ?? null
      const mapped = data.map(post => {
        const authorId = post.userID ?? post.userId
        const authorName = authorId != null ? idToName.get(authorId) : undefined
        return toPostModel(post, meId, authorName, idToName)
      })
      mapped.sort((a, b) => b.timestamp - a.timestamp) // yeni → eski
      
      // Eğer kategori yoksa, tüm postları hem posts hem allPosts'a kaydet
      if (!category || !category.trim()) {
        setAllPosts(mapped)
        setPosts(mapped)
      } else {
        // Kategori varsa, sadece filtrelenmiş postları göster
        setPosts(mapped)
        // allPosts'u güncelleme (client-side filtreleme için eski verileri kullan)
      }
    } catch (e) {
      setError(e.message || 'Gönderiler alınamadı.')
      // Hata durumunda client-side filtreleme dene
      if (category && category.trim() && allPosts.length > 0) {
        const filtered = allPosts.filter(p => {
          const postCategory = p?.category || ''
          return String(postCategory).toLowerCase().trim() === String(category).toLowerCase().trim()
        })
        setPosts(filtered)
      }
    } finally {
      if (isLoadingInitial) {
        setLoading(false)
      } else {
        setFilterLoading(false)
      }
    }
  }

  // İlk yükleme ve token değişikliği
  useEffect(() => {
    if (!token) { setLoading(false); return }
    loadChats(false) // İlk yükleme
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Kategori değişikliği için ayrı effect (debounce ile)
  useEffect(() => {
    if (!token) return
    
    const timeoutId = setTimeout(() => {
      loadChats(true) // Filtreleme
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  // Kategori listesi: sayfa ilk açıldığında yükle
  useEffect(() => {
    if (!token) { setCategories([]); return }
    (async () => {
      setCatsLoading(true); setCatsError('')
      try {
        const list = await getDiseaseNames(token)
        const arr = Array.isArray(list) ? list : (Array.isArray(list?.data) ? list.data : [])
        const clean = arr.map(String).filter(Boolean)
        setCategories(clean)
      } catch (e) {
        setCatsError(e.message || 'Kategoriler alınamadı.')
      } finally {
        setCatsLoading(false)
      }
    })()
  }, [token])

  const closeDialog = () => {
    setMsg('')
    setCategory(null) // null olarak sıfırla
    params.delete('new')
    navigate(`/posts${params.toString() ? `?${params.toString()}` : ''}`, { replace: true })
  }
  const openDialog = () => {
    params.set('new', '1')
    navigate(`/posts?${params.toString()}`)
  }

  const votePost = async (postId, delta) => {
    const postID = Number(String(postId).replace(/^p_/, ''))
    const post = posts.find(p => p.id === postId)
    if (!post) {
      setError('Gönderi bulunamadı.')
      return
    }

    const currentUserId = user?.userId ?? user?.userID
    if (!currentUserId || !token) return

    // Reaction ID'leri zaten state'te var, direkt kullan (API çağrısı yok!)
    const likedEntry = post.likedUsers?.find(u => Number(u.userID) === Number(currentUserId))
    const dislikedEntry = post.dislikedUsers?.find(u => Number(u.userID) === Number(currentUserId))
    const likeReactionID = likedEntry?.chatReactionsID ?? likedEntry?.postReactionID ?? likedEntry?.reactionID ?? likedEntry?.id
    const dislikeReactionID = dislikedEntry?.chatReactionsID ?? dislikedEntry?.postReactionID ?? dislikedEntry?.reactionID ?? dislikedEntry?.id

    // Önceki state değerlerini sakla (rollback için)
    const prevVote = post.myVote || 0
    const prevLikes = post.likes || 0
    const prevDislikes = post.dislikes || 0

    // Optimistic update
    setPosts(prev => {
      return prev.map(p => {
        if (p.id !== postId) return p
        const { myVote, likes, dislikes } = p
        let newVote = myVote || 0
        let newLikes = likes || 0
        let newDislikes = dislikes || 0

        if (myVote === delta) {
          // İptal et
          if (delta === 1) newLikes -= 1
          if (delta === -1) newDislikes -= 1
          newVote = 0
        } else {
          // Yeni oy ver veya değiştir
          if (delta === 1) {
            newLikes += 1
            if (myVote === -1) newDislikes -= 1
          } else {
            newDislikes += 1
            if (myVote === 1) newLikes -= 1
          }
          newVote = delta
        }

        return { ...p, myVote: newVote, likes: newLikes, dislikes: newDislikes }
      })
    })

    // API çağrısı
    try {
      if (prevVote === delta) {
        // Aynı oya tekrar basıldı - İptal et
        if (delta === 1) {
          if (!likeReactionID) {
            throw new Error('Like reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
          }
          await cancelLikeChatReaction(token, postID, currentUserId, likeReactionID)
        } else {
          if (!dislikeReactionID) {
            throw new Error('Dislike reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
          }
          await cancelDislikeChatReaction(token, postID, currentUserId, dislikeReactionID)
        }
      } else if (prevVote === 1 && delta === -1) {
        // Like varken dislike basıldı - Önce like'ı iptal et, sonra dislike ekle
        if (!likeReactionID) {
          throw new Error('Like reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        }
        await cancelLikeChatReaction(token, postID, currentUserId, likeReactionID)
        await dislikeChatReaction(token, postID)
      } else if (prevVote === -1 && delta === 1) {
        // Dislike varken like basıldı - Önce dislike'ı iptal et, sonra like ekle
        if (!dislikeReactionID) {
          throw new Error('Dislike reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        }
        await cancelDislikeChatReaction(token, postID, currentUserId, dislikeReactionID)
        await likeChatReaction(token, postID)
      } else {
        // Yeni oy ver (prevVote === 0)
        if (delta === 1) {
          await likeChatReaction(token, postID)
        } else if (delta === -1) {
          await dislikeChatReaction(token, postID)
        }
      }
      // API başarılı - UI zaten güncellendi, hiçbir şey yapma
    } catch (e) {
      // Rollback
      setPosts(prev => {
        return prev.map(p => {
          if (p.id !== postId) return p
          return {
            ...p,
            myVote: prevVote,
            likes: prevLikes,
            dislikes: prevDislikes
          }
        })
      })
      setError(e?.message || 'Oy işlemi başarısız.')
      console.error('[Post] votePost error - ROLLBACK YAPILDI', { 
        postId, 
        delta, 
        prevVote,
        prevLikes,
        prevDislikes,
        error: e?.message 
      })
    }
  }

  // Recursive function to add comment to nested structure
  function addCommentToNested(comments, targetCommentId, newComment) {
    return comments.map(c => {
      if (c.id === targetCommentId) {
        return { ...c, comments: [newComment, ...(c.comments || [])] }
      }
      if (c.comments && c.comments.length > 0) {
        return { ...c, comments: addCommentToNested(c.comments, targetCommentId, newComment) }
      }
      return c
    })
  }

  // Recursive function to update comment ID in nested structure
  function updateCommentIdInNested(comments, tempId, realId) {
    return comments.map(c => {
      if (c.id === tempId) {
        return { ...c, id: realId }
      }
      if (c.comments && c.comments.length > 0) {
        return { ...c, comments: updateCommentIdInNested(c.comments, tempId, realId) }
      }
      return c
    })
  }

  // Recursive function to remove comment from nested structure
  function removeCommentFromNested(comments, tempId) {
    return comments.map(c => {
      if (c.comments && c.comments.length > 0) {
        return { ...c, comments: removeCommentFromNested(c.comments, tempId) }
      }
      return c
    }).filter(c => c.id !== tempId)
  }

  // Recursive function to find comment in nested structure
  function findCommentInNested(comments, commentId) {
    for (const c of comments) {
      if (c.id === commentId) return c
      if (c.comments && c.comments.length > 0) {
        const found = findCommentInNested(c.comments, commentId)
        if (found) return found
      }
    }
    return null
  }

  const handleAddComment = async (postId, text, commentId = null) => {
    if (!token) return
    
    // Post objesini bul
    const post = posts.find(p => p.id === postId)
    if (!post) {
      setError('Gönderi bulunamadı.')
      return
    }
    
    let parentsID, category
    
    if (commentId) {
      // Yoruma yorum ekleniyor - commentId'den yorumu bul
      const targetComment = findCommentInNested(post.comments, commentId)
      if (!targetComment || !targetComment.postID) {
        setError('Yorum bulunamadı.')
        return
      }
      parentsID = targetComment.postID
      category = targetComment.category || post.category || null
    } else {
      // Ana posta yorum ekleniyor
      const postIdNum = typeof postId === 'string' && postId.startsWith('p_')
        ? Number(postId.replace(/^p_/, ''))
        : Number(postId)
      
      if (!Number.isFinite(postIdNum) || postIdNum <= 0) {
        setError(`Geçersiz post ID: ${postId}`)
        return
      }
      parentsID = postIdNum
      category = post.category || null
    }
    
    const authorName = user?.name || user?.username || `Kullanıcı #${user?.userId ?? ''}`
    const tempId = `tmp-${Date.now()}`
    const tempComment = {
      id: tempId,
      author: authorName,
      text,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      myVote: 0
    }
    
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      if (commentId) {
        return { ...p, comments: addCommentToNested(p.comments, commentId, tempComment) }
      } else {
        return { ...p, comments: [tempComment, ...p.comments] }
      }
    }))

    try {
      // parentsID olarak post'un veya yorumun postID'sini gönder, category'yi de geç
      const real = await apiAddComment(token, parentsID, text, category, user?.userId ?? user?.userID ?? undefined)
      const realId = real?.postID || real?.commentID || real?.commnetsID || real?.id || tempId
      
      // Update comment ID
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        if (commentId) {
          return { ...p, comments: updateCommentIdInNested(p.comments, tempId, realId) }
        } else {
          const comments = p.comments.map(c => c.id === tempId ? { ...c, id: realId } : c)
          return { ...p, comments }
        }
      }))
    } catch (err) {
      setError(err?.message || 'Yorum eklenemedi.')
      // Rollback
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        if (commentId) {
          return { ...p, comments: removeCommentFromNested(p.comments, tempId) }
        } else {
          return { ...p, comments: p.comments.filter(c => c.id !== tempId) }
        }
      }))
    }
  }

  // Recursive helper: Nested comments içinde yorumu bul
  function findCommentRecursive(comments, targetCommentId) {
    for (const comment of comments) {
      if (comment.id === targetCommentId) return comment
      if (Array.isArray(comment.comments) && comment.comments.length > 0) {
        const found = findCommentRecursive(comment.comments, targetCommentId)
        if (found) return found
      }
    }
    return null
  }

  // Recursive helper: Nested comments içinde yorumu güncelle
  function updateCommentInNested(comments, targetCommentId, updater) {
    return comments.map(comment => {
      if (comment.id === targetCommentId) {
        return updater(comment)
      }
      if (Array.isArray(comment.comments) && comment.comments.length > 0) {
        return { ...comment, comments: updateCommentInNested(comment.comments, targetCommentId, updater) }
      }
      return comment
    })
  }

  const voteComment = async (postId, commentId, delta) => {
    const meId = user?.userId ?? user?.userID
    if (!meId || !token) return

    // Nested comments dahil yorumu bul
    const currentPost = posts.find(p => p.id === postId)
    if (!currentPost) {
      setError('Gönderi bulunamadı.')
      return
    }

    const currentComment = findCommentRecursive(currentPost.comments || [], commentId)
    if (!currentComment) {
      setError('Yorum bulunamadı.')
      return
    }

    // Reaction ID'leri zaten state'te var, direkt kullan (API çağrısı yok!)
    const likedEntry = currentComment.likedUsers?.find(u => Number(u.userID) === Number(meId))
    const dislikedEntry = currentComment.dislikedUsers?.find(u => Number(u.userID) === Number(meId))
    const likeReactionId = likedEntry?.chatReactionsID ?? likedEntry?.postReactionID ?? likedEntry?.reactionID ?? likedEntry?.id
    const dislikeReactionId = dislikedEntry?.chatReactionsID ?? dislikedEntry?.postReactionID ?? dislikedEntry?.reactionID ?? dislikedEntry?.id
    const realCommentId = currentComment.postID || Number(String(commentId).replace(/^c_/, ''))

    if (!realCommentId) {
      setError('Geçersiz yorum ID.')
      return
    }

    // ÖNCE API'yi kontrol et, başarısızsa UI'ı hiç güncelleme
    // İptal işlemleri için reaction ID kontrolü
    if (currentComment.myVote === delta) {
      // İptal edilecek
      if (delta === 1 && !likeReactionId) {
        setError('Like reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        return
      }
      if (delta === -1 && !dislikeReactionId) {
        setError('Dislike reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        return
      }
    }

    // Önceki state değerlerini sakla (rollback için)
    const prevVote = currentComment.myVote || 0
    const prevLikes = currentComment.likes || 0
    const prevDislikes = currentComment.dislikes || 0

    // Optimistic update (nested comments dahil) - SADECE UI'DA
    setPosts(prev => {
      return prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          comments: updateCommentInNested(p.comments || [], commentId, (c) => {
            const { myVote, likes, dislikes } = c
            let newVote = myVote || 0
            let newLikes = likes || 0
            let newDislikes = dislikes || 0

            if (myVote === delta) {
              // İptal et
              if (delta === 1) newLikes -= 1
              if (delta === -1) newDislikes -= 1
              newVote = 0
            } else {
              // Yeni oy ver veya değiştir
              if (delta === 1) {
                newLikes += 1
                if (myVote === -1) newDislikes -= 1
              } else {
                newDislikes += 1
                if (myVote === 1) newLikes -= 1
              }
              newVote = delta
            }

            return { ...c, myVote: newVote, likes: newLikes, dislikes: newDislikes }
          })
        }
      })
    })

    // API çağrısı - BAŞARISIZ OLURSA KESINLIKLE ROLLBACK YAP
    try {
      if (prevVote === delta) {
        // Aynı oya tekrar basıldı - İptal et
        if (delta === 1) {
          await cancelLikeCommentReaction(token, likeReactionId)
        } else {
          await cancelDislikeCommentReaction(token, dislikeReactionId)
        }
      } else if (prevVote === 1 && delta === -1) {
        // Like varken dislike basıldı - Önce like'ı iptal et, sonra dislike ekle
        if (!likeReactionId) {
          throw new Error('Like reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        }
        await cancelLikeCommentReaction(token, likeReactionId)
        await dislikeCommentReaction(token, realCommentId)
      } else if (prevVote === -1 && delta === 1) {
        // Dislike varken like basıldı - Önce dislike'ı iptal et, sonra like ekle
        if (!dislikeReactionId) {
          throw new Error('Dislike reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        }
        await cancelDislikeCommentReaction(token, dislikeReactionId)
        await likeCommentReaction(token, realCommentId)
      } else {
        // Yeni oy ver (prevVote === 0)
        if (delta === 1) {
          await likeCommentReaction(token, realCommentId)
        } else if (delta === -1) {
          await dislikeCommentReaction(token, realCommentId)
        }
      }
      // API başarılı - UI zaten güncellendi, hiçbir şey yapma
    } catch (e) {
      // API BAŞARISIZ - KESINLIKLE ROLLBACK YAP (nested comments dahil)
      setPosts(prev => {
        return prev.map(p => {
          if (p.id !== postId) return p
          return {
            ...p,
            comments: updateCommentInNested(p.comments || [], commentId, (c) => {
              // Önceki değerlere geri dön
              return {
                ...c,
                myVote: prevVote,
                likes: prevLikes,
                dislikes: prevDislikes
              }
            })
          }
        })
      })
      setError(e?.message || 'Yorum oylama işlemi başarısız. Lütfen tekrar deneyin.')
      console.error('[Comments] voteComment error - ROLLBACK YAPILDI', { 
        postId, 
        commentId, 
        delta, 
        prevVote,
        prevLikes,
        prevDislikes,
        error: e?.message 
      })
    }
  }

  const openAuthorProfile = (authorId) => {
    if (!authorId) return
    navigate(`/profile?userID=${encodeURIComponent(authorId)}`)
  }

  const handleViewComments = (commentPostID) => {
    // Yorumun detay sayfasına git
    navigate(`/post/${commentPostID}`)
  }

  // Yeni gönderi gönder (gerçek API çağrısı)
  const onSubmitNewPost = async (e) => {
    e.preventDefault()
    if (!msg.trim()) { setError('Mesaj boş olamaz.'); return }
    if (!category || !category.trim()) { setError('Lütfen bir kategori seçiniz.'); return }

    setSubmitting(true)
    try {
      await addChat(token, { message: msg.trim(), category: category.trim() })
      setSuccess('Gönderi oluşturuldu.')
      closeDialog()
      await loadChats(false) // sunucudaki kanonik veriyi göster
    } catch (err) {
      setError(err.message || 'Gönderi oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  const sorted = useMemo(() => [...posts].sort((a, b) => b.timestamp - a.timestamp), [posts])

  return (
    <Box sx={{ width: '100%' }}>
      {/* Kategori filtresi - Twitter tarzı, mobilde daha kompakt */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 1.5 }} sx={{ mb: { xs: 0, md: 0 }, px: { xs: 1.5, sm: 3 }, py: { xs: 1, md: 1.5 }, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Autocomplete
          key={`category-filter-${category || 'none'}`}
          fullWidth
          options={categories}
          loading={catsLoading || filterLoading}
          value={category}
          onChange={(_, v) => {
            setCategory(v || null)
          }}
          disablePortal
          blurOnSelect
          clearOnBlur={false}
          clearOnEscape
          isOptionEqualToValue={(opt, val) => {
            if (!opt && !val) return true
            if (!opt || !val) return false
            return String(opt).trim().toLowerCase() === String(val).trim().toLowerCase()
          }}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Kategoriye göre filtrele"
              size="small"
              helperText={catsError ? `Liste alınamadı: ${catsError}` : (filterLoading ? 'Filtreleniyor...' : 'Boş bırakılırsa tüm gönderiler gösterilir.')}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '16px', sm: '15px' }
                }
              }}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'rgba(7,20,28,0.98)',
                color: '#FAF9F6',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)'
              }
            },
            clearIndicator: {
              sx: {
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary'
                }
              }
            }
          }}
        />
        {category && (
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setCategory(null)} 
            disabled={filterLoading}
            sx={{ 
              whiteSpace: 'nowrap',
              minHeight: { xs: 44, sm: 40 },
              fontSize: { xs: '14px', sm: '14px' }
            }}
          >
            Filtreyi Temizle
          </Button>
        )}
      </Stack>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240, py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : filterLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 120, py: 2 }}>
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Filtreleniyor...</Typography>
          </Stack>
        </Box>
      ) : error && !dialogOpen ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
          <Stack spacing={1.5} alignItems="center">
            <Alert severity="error" variant="filled">{error}</Alert>
            <Button onClick={loadChats} size="small" variant="contained">Tekrar Dene</Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {sorted.map(p => (
            <PostCard
              key={p.id}
              {...p}
              token={token}
              postID={p.postID}
              onVote={votePost}
              onAddComment={handleAddComment}
              onCommentVote={voteComment}
              onAuthorClick={openAuthorProfile}
              onViewComments={handleViewComments}
            />
          ))}
          {sorted.length === 0 && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: { xs: 8, md: 10 },
                px: { xs: 2, sm: 3 }
              }}
            >
              <Box
                component="img"
                src="/Lumo.png"
                alt="Lumo"
                sx={{ 
                  width: { xs: 160, md: 220 }, 
                  height: 'auto', 
                  mb: 3, 
                  mx: 'auto',
                  display: 'block',
                  maxWidth: '100%',
                  filter: 'drop-shadow(0 8px 24px rgba(52,195,161,0.25))'
                }}
              />
              <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, fontWeight: 700, fontSize: { xs: '20px', md: '24px' } }}>
                Henüz mesaj yok
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.9, fontSize: { xs: '14px', md: '16px' } }}>
                İlk gönderiyi sen yap ve topluluğa katıl!
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Composer FAB */}
      <Fab
        color="primary"
        aria-label="Yeni gönderi"
        onClick={openDialog}
        sx={{ 
          position: 'fixed', 
          right: { xs: 16, md: 24 }, 
          bottom: { xs: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 }, 
          zIndex: (t) => t.zIndex.appBar + 3,
          width: { xs: 56, md: 56 },
          height: { xs: 56, md: 56 }
        }}
      >
        <Add />
      </Fab>

      {/* Yeni Gönderi Dialog - Twitter/X tarzı */}
      <Dialog
        open={dialogOpen}
        onClose={submitting ? undefined : closeDialog}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.85)',
            border: 'none',
            backdropFilter: 'blur(12px)',
            borderRadius: { xs: 0, sm: 2 },
            color: 'text.primary',
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        {/* Header - Twitter/X tarzı */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <IconButton
            onClick={closeDialog}
            disabled={submitting}
            sx={{
              color: 'text.secondary',
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'text.primary'
              }
            }}
          >
            <Close sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '18px', sm: '20px' },
              flex: 1,
              textAlign: 'center',
              pr: { xs: 36, sm: 40 } // X butonunun genişliği kadar sağdan boşluk
            }}
          >
            Gönderi oluştur
          </Typography>
        </Box>

        <DialogContent sx={{ 
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.5, sm: 2 },
          '&.MuiDialogContent-root': {
            paddingTop: { xs: 1.5, sm: 2 }
          }
        }}>
          <Box component="form" id="compose-form" onSubmit={onSubmitNewPost}>
            <Stack spacing={2}>
              {/* Kategori - İLK SIRADA, mobil uyumlu */}
              <Autocomplete
                fullWidth
                options={categories}
                loading={catsLoading}
                value={category}
                onChange={(_, v) => setCategory(v)}
                disablePortal
                blurOnSelect
                disableClearable
                isOptionEqualToValue={(opt, val) => String(opt) === String(val)}
                getOptionLabel={(opt) => (typeof opt === 'string' ? opt : '')}
                autoFocus={!fullScreen}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Kategori seçin (zorunlu)"
                    variant="outlined"
                    size={fullScreen ? 'medium' : 'small'}
                    required
                    error={!category && msg.trim().length > 0}
                    helperText={catsError ? `Liste alınamadı: ${catsError}` : (!category && msg.trim().length > 0 ? 'Kategori seçmeniz gerekiyor' : '')}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: { xs: '16px', sm: '15px' },
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 2,
                        minHeight: { xs: 56, sm: 48 },
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255,255,255,0.05)'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: { xs: '2px', sm: '1px' }
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.15)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: { xs: '2px', sm: '2px' }
                      }
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'rgba(0,0,0,0.95)',
                      color: '#FAF9F6',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 2,
                      mt: 0.5,
                      '& .MuiAutocomplete-option': {
                        color: '#FAF9F6',
                        minHeight: { xs: 56, md: 44 },
                        fontSize: { xs: '16px', md: '15px' },
                        py: { xs: 1.5, md: 1 },
                        '&[aria-selected="true"]': { bgcolor: 'rgba(52,195,161,0.22)' },
                        '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.08)' }
                      }
                    }
                  }
                }}
              />

              {/* Avatar ve Textarea - Yan yana */}
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                {/* Avatar */}
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    fontWeight: 800, 
                    width: { xs: 40, sm: 44 }, 
                    height: { xs: 40, sm: 44 },
                    fontSize: { xs: 16, sm: 18 },
                    flexShrink: 0
                  }}
                >
                  {initialsFrom([user?.name, user?.surname].filter(Boolean).join(' ') || 'Kullanıcı')}
                </Avatar>

                {/* Textarea - Twitter/X tarzı */}
                <TextField
                  placeholder="Ne paylaşmak istersin?"
                  multiline
                  minRows={fullScreen ? 8 : 6}
                  maxRows={12}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true
                  }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '18px', sm: '20px' },
                      lineHeight: 1.5,
                      color: 'text.primary',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7
                      }
                    },
                    '& .MuiInputBase-input': {
                      py: { xs: 1, sm: 1.25 },
                      minHeight: { xs: '140px', sm: '140px' }
                    }
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </DialogContent>

        {/* Footer - Twitter/X tarzı */}
        <Box sx={{ 
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.5, sm: 2 },
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5
        }}>
          <Button 
            onClick={closeDialog} 
            variant="outlined"
            disabled={submitting}
            sx={{
              minHeight: { xs: 40, sm: 36 },
              minWidth: { xs: 80, sm: 90 },
              fontSize: { xs: '15px', sm: '15px' },
              fontWeight: 600,
              borderRadius: 2,
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }
            }}
          >
            İptal
          </Button>
          <Button 
            type="submit" 
            form="compose-form" 
            variant="contained"
            disabled={submitting || !msg.trim() || !category || !category.trim()}
            sx={{
              minHeight: { xs: 40, sm: 36 },
              minWidth: { xs: 100, sm: 110 },
              fontSize: { xs: '15px', sm: '15px' },
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: '#fff',
              '&:hover': {
                backgroundColor: 'primary.dark'
              },
              '&:disabled': {
                backgroundColor: 'rgba(52,195,161,0.3)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
                <span>Paylaşılıyor…</span>
              </Box>
            ) : (
              'Paylaş'
            )}
          </Button>
        </Box>
      </Dialog>

      {/* Bildirimler */}
      <Snackbar open={!!error && !loading} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" variant="filled" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={2500} onClose={() => setSuccess('')}>
        <Alert severity="success" variant="filled" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  )
}

