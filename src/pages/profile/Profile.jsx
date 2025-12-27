import { useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Stack, Typography, Divider, CircularProgress,
  Toolbar, Paper
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import PostCard from '../../components/PostCard.jsx'
import {
  getUserProfile,
  getDoctorProfile,
  getPublicUserProfile,
  getChatsByUserID,
  deleteChat,
  addComment as apiAddComment,
  deleteComment as apiDeleteComment,
  getUserByID
} from '../../services/api.js'
import { getLikedCommentPeople, getDislikedCommentPeople, getAllChats } from '../../services/api.js'
import {
  addPostReaction,
  cancelPostReaction,
} from '../../services/api.js'
import DoctorPart from './DoctorPart.jsx'
import UserPart from './UserPart.jsx'

/* ---------------- Helpers ---------------- */
function initialsFrom(name = '', fallback = '') {
  const src = name || fallback
  const parts = src.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}
function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : null
}

const displayName = (u) =>
  [u?.name, u?.surname].filter(Boolean).join(' ') || `Kullanıcı #${u?.userID || ''}`

/** API -> UI (PostCard) dönüştürücü - Yeni post yapısı için güncellendi */
function mapChatToPost(post, meId, authorName, idToName) {
  const liked = Array.isArray(post.likedUser) ? post.likedUser : []
  const disliked = Array.isArray(post.dislikedUser) ? post.dislikedUser : []
  // UserID karşılaştırması Number() ile yapılmalı (tip uyumsuzluğu sorunu)
  const meIdNum = Number(meId)
  const myVote =
    liked.some(u => Number(u?.userID ?? u?.userId) === meIdNum) ? 1 :
    disliked.some(u => Number(u?.userID ?? u?.userId) === meIdNum) ? -1 : 0

  // Recursive function to convert nested comments (ana sayfadaki mantıkla aynı)
  const mapComment = (c, includeNested = false) => {
    const cLiked = Array.isArray(c.likedUser) ? c.likedUser : []
    const cDisliked = Array.isArray(c.dislikedUser) ? c.dislikedUser : []
    // UserID karşılaştırması Number() ile yapılmalı (tip uyumsuzluğu sorunu)
    const cVote =
      cLiked.some(u => Number(u?.userID ?? u?.userId) === meIdNum) ? 1 :
      cDisliked.some(u => Number(u?.userID ?? u?.userId) === meIdNum) ? -1 : 0

    const override = idToName?.get?.(c?.userID ?? c?.userId)
    const author = override || c.userName || `Kullanıcı #${c.userID}`
    const cidRaw = c.postID ?? c.commnetsID ?? c.commentID ?? c.id
    const cidNum = Number(cidRaw)
    
    // Yeni mantık: includeNested false ise nested comments gösterme (sadece direkt alt yorumlar)
    const nestedComments = includeNested && Array.isArray(c.comments)
      ? c.comments.map(nc => mapComment(nc, includeNested))
      : []
    
    return {
      id: Number.isFinite(cidNum) ? `c_${cidNum}` : `c_tmp_${Math.random().toString(36).slice(2)}`,
      postID: cidNum, // Yorumun postID'sini sakla
      author,
      authorId: c.userID ?? c.userId,
      text: c.message,
      timestamp: c.uploadDate,
      likes: cLiked.length,
      dislikes: cDisliked.length,
      myVote: cVote,
      likedUsers: cLiked.map(u => ({ userID: u.userID, chatReactionsID: u.chatReactionsID ?? u.commentReactionsID ?? u.reactionID ?? u.id })),
      dislikedUsers: cDisliked.map(u => ({ userID: u.userID, chatReactionsID: u.chatReactionsID ?? u.commentReactionsID ?? u.reactionID ?? u.id })),
      comments: nestedComments,
      category: c.category || post.category || null,
      // Alt yorum sayısını sakla (nested comments gösterilmediğinde kullanılacak)
      childCommentCount: Array.isArray(c.comments) ? c.comments.length : 0
    }
  }
  
  // Profil sayfasında da sadece direkt alt yorumları göster (nested comments gösterme)
  const comments = Array.isArray(post.comments) ? post.comments.map(c => mapComment(c, false)) : []

  const isOwner = (post.userID === meId) || (post.userId === meId)
  const postID = post.postID ?? post.chatID
  const postIdNum = Number(postID)

  return {
    id: Number.isFinite(postIdNum) ? `p_${postIdNum}` : `p_${postID}`,
    postID: postIdNum, // Post ID'yi sakla (API çağrıları için gerekli)
    author: authorName,
    content: post.message,
    timestamp: post.uploadDate,
    likes: liked.length,
    dislikes: disliked.length,
    myVote,
    comments,
    isOwner,
    category: post.category || null,
    likedUsers: liked.map(u => ({
      userID: u?.userID ?? u?.userId,
      name: u?.name ?? null,
      surname: u?.surname ?? null,
      chatReactionsID: u?.chatReactionsID ?? u?.postReactionID ?? u?.reactionID ?? u?.id
    })),
    dislikedUsers: disliked.map(u => ({
      userID: u?.userID ?? u?.userId,
      name: u?.name ?? null,
      surname: u?.surname ?? null,
      chatReactionsID: u?.chatReactionsID ?? u?.postReactionID ?? u?.reactionID ?? u?.id
    }))
  }
}

/* ---------------- Page ---------------- */
export default function Profile() {
  const { token, user: me, logout } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const userIdParam = searchParams.get('userID')

  const [profileData, setProfileData] = useState(null)
  const [doctorData, setDoctorData] = useState(null)
  const [publicUserData, setPublicUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) { setLoading(false); return }
      
      // userIdParam değiştiğinde state'leri sıfırla
      setProfileData(null)
      setDoctorData(null)
      setPublicUserData(null)
      setPosts([])
      setError('')
      setLoading(true)
      
      try {
        let base
        const viewingOther = !!userIdParam
        if (viewingOther) {
          base = await getUserByID(token, userIdParam)
        } else {
          // Önce sunucudan giriş yapmış kişinin tam profilini al (doğum tarihi vb. için)
          try {
            base = await getUserProfile(token)
          } catch (_) {
            // Sunucu başarısızsa JWT'den (AuthContext) kimliği temel al (fallback)
            const myId = me?.userId ?? me?.userID
            base = {
              userID: myId,
              name: me?.name || '',
              surname: me?.surname || '',
              role: me?.role || 'user',
              email: me?.email || ''
            }
          }
        }
        if (!mounted) return
        setProfileData(base)

        if (base.userID) {
          if (base.role === 'doctor') {
            getDoctorProfile(token, base.userID)
              .then(d => { if (mounted) setDoctorData(d) })
              .catch(() => {})
          } else if (base.role === 'user') {
            getPublicUserProfile(token, base.userID)
              .then(u => { if (mounted) setPublicUserData(u) })
              .catch(() => {})
          }

          setPostsLoading(true)
          try {
            const allPosts = await getChatsByUserID(token, base.userID)
            if (!mounted) return
            
            // Sadece ana postları filtrele (parentsID === 0)
            const posts = Array.isArray(allPosts) ? allPosts.filter(p => p.parentsID === 0) : []
            
            // Debug: Profil akışında yorum reaction ID'leri
            try {
              console.groupCollapsed('[Profile] getUserPosts payload')
              console.debug('count:', posts.length)
              posts.slice(0, 10).forEach((p, idx) => {
                const comments = Array.isArray(p?.comments) ? p.comments : []
                console.debug(`#${idx} postID=${p?.postID} comments=${comments.length}`)
                comments.slice(0, 10).forEach((c, ci) => {
                  const liked = Array.isArray(c?.likedUser) ? c.likedUser : []
                  const disliked = Array.isArray(c?.dislikedUser) ? c.dislikedUser : []
                  console.debug(`  c#${ci} postID=${c?.postID} likedIDs=`, liked.map(u => u?.chatReactionsID), 'dislikedIDs=', disliked.map(u => u?.chatReactionsID))
                })
              })
              console.groupEnd()
            } catch {}
            
            // Yorum yazar adlarını da doldur (recursive)
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
            for (const post of posts) {
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
            // Reaction kontrolü için mevcut kullanıcının userID'sini kullan (me?.userID ?? me?.userId)
            const currentUserId = me?.userID ?? me?.userId
            const mapped = posts.map(p => mapChatToPost(p, currentUserId, base.name || 'Kullanıcı', idToName))
            setPosts(mapped)
          } finally {
            if (mounted) setPostsLoading(false)
          }
        }
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Profil bilgileri alınamadı.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token, userIdParam, me?.userId, me?.userID])

  const isDoctor = profileData?.role === 'doctor'
  const isUser = profileData?.role === 'user'
  const isVisitor = !!userIdParam && (Number(userIdParam) !== (me?.userId ?? me?.userID))

  // Tab/select yapısı kaldırıldı - tüm içerik alt alta gösterilecek

  // Post silme
  async function handleDeletePost(postId) {
    if (!token || !postId || isVisitor) return
    try {
      setDeletingId(postId)
      // postId formatı p_123 ise, 123'ü al
      const postID = typeof postId === 'string' && postId.startsWith('p_')
        ? Number(postId.replace(/^p_/, ''))
        : Number(postId)
      await deleteChat(token, postID)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (err) {
      showError(err?.message || 'Silme işlemi başarısız.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleVote = async (postId, delta) => {
    const post = posts.find(p => p.id === postId)
    if (!post) {
      setError('Gönderi bulunamadı.')
      return
    }

    // Post ID'yi post objesinden al (daha güvenli)
    const postID = post.postID || Number(String(postId).replace(/^p_/, ''))
    if (!postID) {
      setError('Post ID bulunamadı.')
      return
    }

    const currentUserId = me?.userId ?? me?.userID
    if (!currentUserId || !token) return

    // Reaction ID'leri state'teki likedUsers/dislikedUsers array'lerinden al
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
        // Aynı oya tekrar basıldı - İptal et (yeni iptal endpoint'i kullan)
        const reactionID = delta === 1 ? likeReactionID : dislikeReactionID
        if (!reactionID) {
          throw new Error('Reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        }
        await cancelPostReaction(token, reactionID)
      } else {
        // Yeni oy ver veya değiştir (addReaction API kullan)
        const isLike = delta === 1
        await addPostReaction(token, postID, isLike)
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
      console.error('[Profile/Post] handleVote error - ROLLBACK YAPILDI', { 
        postId, 
        delta, 
        prevVote,
        prevLikes,
        prevDislikes,
        error: e?.message 
      })
    }
  }

  // Recursive helper functions for nested comments
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

  function removeCommentFromNested(comments, tempId) {
    return comments.map(c => {
      if (c.comments && c.comments.length > 0) {
        return { ...c, comments: removeCommentFromNested(c.comments, tempId) }
      }
      return c
    }).filter(c => c.id !== tempId)
  }

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

  // Yorum ekleme (token'lı, optimistic update)
  const handleAddComment = async (postId, text, commentId = null) => {
    if (!token || isVisitor) return

    // Post objesini bul
    const post = posts.find(p => p.id === postId)
    if (!post) {
      showError('Gönderi bulunamadı.')
      return
    }

    let parentsID, category
    
    if (commentId) {
      // Yoruma yorum ekleniyor
      const targetComment = findCommentInNested(post.comments, commentId)
      if (!targetComment || !targetComment.postID) {
        showError('Yorum bulunamadı.')
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
        showError(`Geçersiz post ID: ${postId}`)
        return
      }
      parentsID = postIdNum
      category = post.category || null
    }

    const tempId = `tmp-${Date.now()}`
    const tempComment = {
      id: tempId,
      author: profileData?.name || 'Sen',
      text,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      myVote: 0
    }
    
    // Optimistic update
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p
        if (commentId) {
          return { ...p, comments: addCommentToNested(p.comments, commentId, tempComment) }
        } else {
          return { ...p, comments: [tempComment, ...p.comments] }
        }
      })
    )

    try {
      const res = await apiAddComment(token, parentsID, text, category, me?.userId ?? me?.userID ?? undefined)
      const realId = res?.postID || res?.commentID || res?.commnetsID || res?.id || tempId
      
      // Update comment ID
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== postId) return p
          if (commentId) {
            return { ...p, comments: updateCommentIdInNested(p.comments, tempId, realId) }
          } else {
          const comments = p.comments.map(c =>
            c.id === tempId ? { ...c, id: realId } : c
          )
          return { ...p, comments }
          }
        })
      )
    } catch (err) {
      showError(err.message || 'Yorum eklenemedi.')
      // Rollback
      setPosts(prev =>
        prev.map(p => {
          if (p.id !== postId) return p
          if (commentId) {
            return { ...p, comments: removeCommentFromNested(p.comments, tempId) }
          } else {
            return { ...p, comments: p.comments.filter(c => c.id !== tempId) }
          }
        })
      )
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

  const handleCommentVote = async (postId, commentId, delta) => {
    const meId = me?.userId ?? me?.userID
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

    // API çağrısı - Yorumlar için de aynı addPostReaction API'si kullanılıyor
    try {
      if (prevVote === delta) {
        // Aynı oya tekrar basıldı - İptal et (yeni iptal endpoint'i kullan)
        const reactionID = delta === 1 ? likeReactionId : dislikeReactionId
        if (!reactionID) {
          throw new Error('Reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        }
        await cancelPostReaction(token, reactionID)
      } else {
        // Yeni oy ver veya değiştir (addReaction API kullan)
        const isLike = delta === 1
        await addPostReaction(token, realCommentId, isLike)
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
      console.error('[Profile/Comments] voteComment error - ROLLBACK YAPILDI', { 
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

  // Yorum silme (token'lı, optimistic update)
  async function handleDeleteComment(postId, commentId) {
    if (!token || !postId || !commentId || isVisitor) return

    // optimistic: UI'dan kaldır
    const prevSnapshot = posts
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
          : p
      )
    )

    try {
      await apiDeleteComment(token, commentId) // endpoint paramı: commnetsID
    } catch (err) {
      showError(err.message || 'Yorum silinemedi.')
      // geri al
      setPosts(prevSnapshot)
    }
  }

  // Yorumların detay sayfasına git (ana sayfadaki mantıkla aynı)
  const handleViewComments = (commentPostID) => {
    navigate(`/post/${commentPostID}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }
  if (error) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', py: { xs: 1, md: 0 }, px: { xs: 0, sm: 0 } }}>
        {/* Profil Başlığı */}
      <Box sx={{ 
        mb: { xs: 3, md: 4 },
        px: { xs: 1.5, md: 3 }
      }}>
        {/* Profil içeriği */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ 
            alignItems: { xs: 'center', sm: 'flex-start' },
            textAlign: { xs: 'center', sm: 'left' },
            pt: { xs: 2, md: 3 }
          }}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              width: { xs: 100, md: 120 },
              height: { xs: 100, md: 120 },
              bgcolor: 'secondary.main',
              fontWeight: 800,
              fontSize: { xs: 32, md: 40 }
            }}
            aria-label="Kullanıcı avatarı"
          >
            {initialsFrom([profileData?.name, profileData?.surname].filter(Boolean).join(' ') || profileData?.email)}
          </Avatar>

          {/* İsim ve Bilgiler */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '24px', md: '32px' },
                color: 'text.primary',
                mb: 0.5,
                wordBreak: 'break-word'
              }}
            >
              {[profileData?.name, profileData?.surname].filter(Boolean).join(' ') || 'Kullanıcı'}
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 0.5, sm: 2 }}
              sx={{ 
                flexWrap: 'wrap',
                alignItems: { xs: 'center', sm: 'flex-start' },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              {profileData?.role && (
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: isDoctor ? 'rgba(52,195,161,0.15)' : 'rgba(14,165,233,0.15)',
                  border: `1px solid ${isDoctor ? 'rgba(52,195,161,0.3)' : 'rgba(14,165,233,0.3)'}`
                }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    color: isDoctor ? 'secondary.main' : 'primary.main',
                    fontSize: { xs: '13px', md: '14px' }
                  }}>
                    {isDoctor ? 'Doktor' : 'Kullanıcı'}
                  </Typography>
                </Box>
              )}
              
              {prettyDate(profileData?.dateOfBirth) && (
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '13px', md: '14px' }
                }}>
                  {prettyDate(profileData?.dateOfBirth)}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* İçerik - Tüm bölümler alt alta */}
      <Stack spacing={{ xs: 2.5, md: 4 }} sx={{ px: { xs: 1.5, md: 3 } }}>

        {/* Doktor Bölümleri */}
        {isDoctor && (
          <>
            <Box>
              <DoctorPart doctorData={doctorData} sectionKey="spec" canEdit={!isVisitor} />
            </Box>

            <Box>
              <DoctorPart doctorData={doctorData} sectionKey="addr" canEdit={!isVisitor} />
            </Box>

            <Box>
              <DoctorPart doctorData={doctorData} sectionKey="contact" canEdit={!isVisitor} />
            </Box>

            <Box>
              <DoctorPart doctorData={doctorData} sectionKey="ann" canEdit={!isVisitor} />
            </Box>
          </>
        )}

        {/* Kullanıcı Bölümleri */}
        {isUser && (
          <Box>
            <UserPart publicUserData={publicUserData} sectionKey="diseases" canEdit={!isVisitor} />
          </Box>
        )}

        {/* Gönderiler Bölümü */}
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 700, 
              fontSize: { xs: '18px', md: '20px' },
              color: 'text.primary'
            }}
          >
            Gönderilerim
          </Typography>
          <Stack spacing={0}>
              {postsLoading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : posts.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: { xs: 8, md: 10 },
                  px: 3,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)'
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
                <Typography variant="h5" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
                  Henüz gönderiniz yok
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                  İlk gönderinizi paylaşın
                </Typography>
              </Box>
              ) : (
                posts.map(p => (
                  <PostCard
                    key={p.id}
                    {...p}
                  token={token}
                  postID={p.postID}
                    deleting={deletingId === p.id}
                    {...(!isVisitor ? { onDelete: (postId) => handleDeletePost(postId) } : {})}
                    onVote={handleVote}
                    {...(!isVisitor ? { onAddComment: handleAddComment, onCommentVote: handleCommentVote, onCommentDelete: (postId, commentId) => handleDeleteComment(postId, commentId) } : {})}
                    onViewComments={handleViewComments}
                  />
                ))
              )}
            </Stack>
        </Box>
      </Stack>
      <Toolbar sx={{ minHeight: 16 }} /> {/* alt boşluk */}
    </Box>
  )
}
