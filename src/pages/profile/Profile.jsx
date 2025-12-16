import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Stack, Typography, Divider, CircularProgress,
  Tabs, Tab, Container, useMediaQuery, Select, MenuItem, FormControl, InputLabel,
  Toolbar, IconButton, Paper
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
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
  likeChatReaction,
  dislikeChatReaction,
  cancelLikeChatReaction,
  cancelDislikeChatReaction,
  likeCommentReaction,
  dislikeCommentReaction,
  cancelLikeCommentReaction,
  cancelDislikeCommentReaction
} from '../../services/api.js'
import DoctorPart from './DoctorPart.jsx'
import UserPart from './UserPart.jsx'
import { Logout as LogoutIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}
function Row({ label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        mb: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.12)'
        }
      }}
    >
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
        gap: { xs: 1, sm: 2 },
        alignItems: 'start'
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word', color: 'text.primary' }}>{value || 'Belirtilmemiş'}</Typography>
      </Box>
    </Paper>
  )
}

const displayName = (u) =>
  [u?.name, u?.surname].filter(Boolean).join(' ') || `Kullanıcı #${u?.userID || ''}`

/** API -> UI (PostCard) dönüştürücü - Yeni post yapısı için güncellendi */
function mapChatToPost(post, meId, authorName, idToName) {
  const liked = Array.isArray(post.likedUser) ? post.likedUser : []
  const disliked = Array.isArray(post.dislikedUser) ? post.dislikedUser : []
  const myVote =
    liked.some(u => u.userID === meId) ? 1 :
    disliked.some(u => u.userID === meId) ? -1 : 0

  // Recursive function to convert nested comments
  const mapComment = (c) => {
    const cLiked = Array.isArray(c.likedUser) ? c.likedUser : []
    const cDisliked = Array.isArray(c.dislikedUser) ? c.dislikedUser : []
    const cVote =
      cLiked.some(u => u.userID === meId) ? 1 :
      cDisliked.some(u => u.userID === meId) ? -1 : 0

    const override = idToName?.get?.(c?.userID ?? c?.userId)
    const author = override || c.userName || `Kullanıcı #${c.userID}`
    const cidRaw = c.postID ?? c.commnetsID ?? c.commentID ?? c.id
    const cidNum = Number(cidRaw)
    const nestedComments = Array.isArray(c.comments) ? c.comments.map(mapComment) : []
    
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
      category: c.category || post.category || null
    }
  }
  
  const comments = Array.isArray(post.comments) ? post.comments.map(mapComment) : []

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
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))
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
  const [tab, setTab] = useState(0)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const handleMobileMenuOpen = (e) => setMobileMenuAnchor(e.currentTarget);
  const handleMenuClose = () => { setMobileMenuAnchor(null); };

  // Menü içeriği fonksiyonu: (kopya önle için)
  function ProfileMenu({ anchorEl, open, onClose }) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        getContentAnchorEl={null}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={() => { onClose(); navigate('/profile'); }}>
          <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} /> Profilim
        </MenuItem>
        <MenuItem onClick={() => { onClose(); logout(); navigate('/'); }}>
          <LogoutIcon sx={{ mr: 1, color: 'error.main' }} /> Çıkış Yap
        </MenuItem>
      </Menu>
    )
  }


  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) { setLoading(false); return }
      setError('')
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
            const mapped = posts.map(p => mapChatToPost(p, base.userID, base.name || 'Kullanıcı', idToName))
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
  }, [token, userIdParam])

  const isDoctor = profileData?.role === 'doctor'
  const isUser = profileData?.role === 'user'
  const isVisitor = !!userIdParam && (Number(userIdParam) !== (me?.userId ?? me?.userID))

  const tabs = useMemo(() => ([
    { key: 'info', label: 'Bilgiler' },
    ...(isDoctor ? [
      { key: 'spec', label: 'Uzmanlık' },
      { key: 'addr', label: 'Adresler' },
      { key: 'contact', label: 'İletişim' },
      { key: 'ann', label: 'Duyurular' },
    ] : []),
    ...(isUser ? [{ key: 'diseases', label: 'Hastalıklarım' }] : []),
    { key: 'posts', label: 'Gönderilerim' },
  ]), [isDoctor, isUser])

  const currentKey = tabs[tab]?.key || 'info'

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
      alert(err?.message || 'Silme işlemi başarısız.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleVote = async (postId, delta) => {
    const postID = Number(String(postId).replace(/^p_/, ''))
    const post = posts.find(p => p.id === postId)
    if (!post) {
      setError('Gönderi bulunamadı.')
      return
    }

    const currentUserId = me?.userId ?? me?.userID
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
      alert('Gönderi bulunamadı.')
      return
    }

    let parentsID, category
    
    if (commentId) {
      // Yoruma yorum ekleniyor
      const targetComment = findCommentInNested(post.comments, commentId)
      if (!targetComment || !targetComment.postID) {
        alert('Yorum bulunamadı.')
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
        alert(`Geçersiz post ID: ${postId}`)
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
      alert(err.message || 'Yorum eklenemedi.')
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
      alert(err.message || 'Yorum silinemedi.')
      // geri al
      setPosts(prevSnapshot)
    }
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
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 2, position: 'relative' }}>
        {/* Mobilde sağ üstte 3 nokta menü */}
        <IconButton
          onClick={handleMobileMenuOpen}
          sx={{ display: { xs: 'flex', sm: 'none' }, position: 'absolute', right: 0, top: 0, zIndex: 15 }}
          aria-label="Menü Aç"
        >
          <MoreVertIcon sx={{ fontSize: 30 }} />
        </IconButton>
        {/* Masaüstü için boşluk */}
      </Stack>

      {/* Avatar ve menus: avatar tıklandığında her zamanki gibi */}
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', position: 'relative', mb: 3 }}>
        <Avatar
          sx={{
            width: { xs: 72, md: 80 },
            height: { xs: 72, md: 80 },
            bgcolor: 'secondary.main',
            fontWeight: 800,
            fontSize: { xs: 24, md: 26 },
            cursor: 'pointer'
          }}
          aria-label="Kullanıcı avatarı"
        >
          {initialsFrom(profileData?.name, profileData?.email)}
        </Avatar>
        {/* Menüleri render et: avatar veya mobile butondan açılır */}
        <ProfileMenu anchorEl={null} open={Boolean(mobileMenuAnchor)} onClose={handleMenuClose} />
      </Stack>

      {/* Navigasyon - Mobilde Select, Desktop'ta Tabs */}
      <Box sx={{ mb: 3 }}>
        {isSmUp ? (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Profil sekmeleri"
            sx={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 56,
                fontSize: 15,
                px: 3,
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              }
            }}
          >
            {tabs.map(t => <Tab key={t.key} label={t.label} />)}
          </Tabs>
        ) : (
          <FormControl fullWidth>
            <Select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 2,
                color: 'text.primary',
                '& .MuiSelect-select': {
                  py: 1.5,
                  fontWeight: 600
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.12)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(7,20,28,0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    '& .MuiMenuItem-root': {
                      color: '#FAF9F6',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(52,195,161,0.18)',
                        color: 'primary.main'
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.08)'
                      }
                    }
                  }
                }
              }}
            >
              {tabs.map((t, index) => (
                <MenuItem key={t.key} value={index}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* İçerik */}
      <Box>
        {currentKey === 'info' && (
          <Stack spacing={0}>
            <Row label="İsim" value={profileData?.name} />
            <Row label="Soyisim" value={profileData?.surname} />
            <Row label="Doğum Tarihi" value={prettyDate(profileData?.dateOfBirth)} />
            <Row label="Rol" value={isDoctor ? 'Doktor' : 'Kullanıcı'} />
          </Stack>
        )}

          {/* Doktor sekmeleri */}
          {isDoctor && ['spec', 'addr', 'contact', 'ann'].includes(currentKey) && (
            <DoctorPart doctorData={doctorData} sectionKey={currentKey} canEdit={!isVisitor} />
          )}

          {/* Kullanıcı sekmeleri */}
          {isUser && currentKey === 'diseases' && (
            <UserPart publicUserData={publicUserData} sectionKey={currentKey} canEdit={!isVisitor} />
          )}

        {/* Gönderiler */}
        {currentKey === 'posts' && (
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
                />
              ))
            )}
          </Stack>
        )}
      </Box>
      <Toolbar sx={{ minHeight: 16 }} /> {/* alt boşluk */}
    </Container>
  )
}
