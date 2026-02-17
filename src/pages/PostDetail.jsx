import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Stack, Typography, CircularProgress, Alert, IconButton,
  useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ArrowBack } from '@mui/icons-material'
import PostCard from '../components/PostCard.jsx'

import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getPostWithId, getUserByID, addComment } from '../services/api.js'
import {
  addPostReaction,
  cancelPostReaction
} from '../services/api.js'

/* ---------------- Utils ---------------- */
function parseYMD(ymd) {
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
  const currentIdNum = Number(currentUserId)
  const liked = likedUsers.some(u => Number(u?.userID ?? u?.userId) === currentIdNum)
  const disliked = dislikedUsers.some(u => Number(u?.userID ?? u?.userId) === currentIdNum)
  if (liked) return 1
  if (disliked) return -1
  return 0
}

function toCommentModel(comment, currentUserId, idToName, includeNested = false) {
  const cLiked = dedupUsers(comment.likedUser || [])
  const cDisliked = dedupUsers(comment.dislikedUser || [])
  const cidRaw = comment.postID ?? comment.commnetsID ?? comment.commentsID ?? comment.id
  const cidNum = Number(cidRaw)
  const safeId = Number.isFinite(cidNum) ? `c_${cidNum}` : `c_tmp_${Math.random().toString(36).slice(2)}`
  const authorId = comment.userID ?? comment.userId
  const authorOverride = idToName?.get?.(authorId)
  
  // Yeni mantık: includeNested false ise nested comments gösterme (sadece direkt alt yorumlar)
  const nestedComments = includeNested && Array.isArray(comment.comments)
    ? comment.comments.map(c => toCommentModel(c, currentUserId, idToName, includeNested))
    : []

  return {
    id: safeId,
    postID: cidNum,
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
    category: comment.category || null,
    // Alt yorum sayısını sakla (nested comments gösterilmediğinde kullanılacak)
    childCommentCount: Array.isArray(comment.comments) ? comment.comments.length : 0
  }
}

function toPostModel(post, currentUserId, idToName, includeNestedComments = false) {
  const liked = dedupUsers(post.likedUser || [])
  const disliked = dedupUsers(post.dislikedUser || [])

  // Yeni mantık: PostDetail'de sadece direkt alt yorumları göster (nested comments gösterme)
  const comments = Array.isArray(post.comments)
    ? post.comments.map(c => toCommentModel(c, currentUserId, idToName, includeNestedComments))
    : []

  const authorFull = idToName?.get?.(post.userID)
    || [post.name, post.surname].filter(Boolean).join(' ')
    || post.userName
    || `Kullanıcı #${post.userID ?? '???'}`

  return {
    id: `p_${post.postID}`,
    postID: post.postID,
    parentsID: post.parentsID ?? 0, // Üst seviyeye dönüş için gerekli
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

export default function PostDetail() {
  const { postID } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { user, token } = useAuth()
  const { showError } = useNotification()
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [idToName, setIdToName] = useState(new Map())

  // Helper function: Extract all user IDs from post data (including liked/disliked users)
  const extractAllUserIds = (postData) => {
    const userIds = new Set()
    if (postData?.userID) userIds.add(postData.userID)
    
    // Post'un liked/disliked users
    if (Array.isArray(postData.likedUser)) {
      postData.likedUser.forEach(u => {
        if (u?.userID) userIds.add(u.userID)
      })
    }
    if (Array.isArray(postData.dislikedUser)) {
      postData.dislikedUser.forEach(u => {
        if (u?.userID) userIds.add(u.userID)
      })
    }
    
    const extractFromComments = (comments) => {
      if (!Array.isArray(comments)) return
      comments.forEach(comment => {
        if (comment?.userID) userIds.add(comment.userID)
        if (Array.isArray(comment.likedUser)) {
          comment.likedUser.forEach(u => {
            if (u?.userID) userIds.add(u.userID)
          })
        }
        if (Array.isArray(comment.dislikedUser)) {
          comment.dislikedUser.forEach(u => {
            if (u?.userID) userIds.add(u.userID)
          })
        }
        if (Array.isArray(comment.comments)) extractFromComments(comment.comments)
      })
    }
    if (Array.isArray(postData.comments)) extractFromComments(postData.comments)
    
    return userIds
  }

  // Helper function: Load user names for user IDs and update idToName map
  const loadUserNames = async (userIds, currentNameMap) => {
    const updatedNameMap = new Map(currentNameMap)
    await Promise.all(
      Array.from(userIds).map(async (uid) => {
        if (!updatedNameMap.has(uid)) {
          try {
            const userData = await getUserByID(token, uid)
            if (userData?.name || userData?.surname) {
              updatedNameMap.set(uid, [userData.name, userData.surname].filter(Boolean).join(' '))
            }
          } catch (e) {
            console.error(`Failed to fetch user ${uid}:`, e)
          }
        }
      })
    )
    return updatedNameMap
  }

  // Helper function: Reload post with updated user names
  const reloadPostWithUserNames = async (postId) => {
    const updated = await getPostWithId(token, postId)
    const userIds = extractAllUserIds(updated)
    const updatedNameMap = await loadUserNames(userIds, idToName)
    setIdToName(updatedNameMap)
    // PostDetail'de sadece direkt alt yorumları göster (nested comments gösterme)
    // currentUserId'yi doğru geç (user?.userID ?? user?.userId)
    const currentUserId = user?.userID ?? user?.userId
    const updatedModel = toPostModel(updated, currentUserId, updatedNameMap, false)
    setPost(updatedModel)
    return updatedModel
  }

  // Load post data
  useEffect(() => {
    if (!postID || !token) return
    
    let mounted = true
    setLoading(true)
    setError('')
    
    getPostWithId(token, Number(postID))
      .then(async (data) => {
        if (!mounted) return
        
        // Build author name map - liked/disliked users dahil
        const userIds = extractAllUserIds(data)
        const nameMap = await loadUserNames(userIds, new Map())
        setIdToName(nameMap)
        // PostDetail'de sadece direkt alt yorumları göster (nested comments gösterme)
        // currentUserId'yi doğru geç (user?.userID ?? user?.userId)
        const currentUserId = user?.userID ?? user?.userId
        const postModel = toPostModel(data, currentUserId, nameMap, false)
        setPost(postModel)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.message || 'Post yüklenirken bir hata oluştu.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    
    return () => { mounted = false }
  }, [postID, token, user])

  // Vote handlers
  const handleVote = async (postId, delta) => {
    if (!token || !post) return
    
    const numericId = post.postID
    const currentUserId = user?.userID ?? user?.userId
    if (!currentUserId) return

    // Reaction ID'leri state'teki likedUsers/dislikedUsers array'lerinden al
    const likedEntry = post.likedUsers?.find(u => Number(u.userID) === Number(currentUserId))
    const dislikedEntry = post.dislikedUsers?.find(u => Number(u.userID) === Number(currentUserId))
    const likeReactionID = likedEntry?.chatReactionsID ?? likedEntry?.postReactionID ?? likedEntry?.reactionID ?? likedEntry?.id
    const dislikeReactionID = dislikedEntry?.chatReactionsID ?? dislikedEntry?.postReactionID ?? dislikedEntry?.reactionID ?? dislikedEntry?.id

    const prevVote = post.myVote || 0
    const prevLikes = post.likes || 0
    const prevDislikes = post.dislikes || 0

    // Optimistic update
    let newVote = prevVote
    let newLikes = prevLikes
    let newDislikes = prevDislikes

    if (prevVote === delta) {
      // İptal et
      if (delta === 1) newLikes -= 1
      if (delta === -1) newDislikes -= 1
      newVote = 0
    } else {
      // Yeni oy ver veya değiştir
      if (delta === 1) {
        newLikes += 1
        if (prevVote === -1) newDislikes -= 1
      } else {
        newDislikes += 1
        if (prevVote === 1) newLikes -= 1
      }
      newVote = delta
    }

    setPost(p => ({
      ...p,
      myVote: newVote,
      likes: newLikes,
      dislikes: newDislikes
    }))

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
        await addPostReaction(token, numericId, isLike)
      }
      
      // API başarılı - Reload post to get accurate state
      await reloadPostWithUserNames(numericId)
    } catch (err) {
      // Rollback
      setPost(p => ({
        ...p,
        myVote: prevVote,
        likes: prevLikes,
        dislikes: prevDislikes
      }))
      showError(err?.message || 'İşlem başarısız oldu.')
    }
  }

  const handleCommentVote = async (postId, commentId, delta) => {
    if (!token || !post) return
    
    const currentUserId = user?.userID ?? user?.userId
    if (!currentUserId) return
    
    const findComment = (comments, targetId) => {
      for (const comment of comments) {
        if (comment.id === targetId) return comment
        if (comment.comments?.length) {
          const found = findComment(comment.comments, targetId)
          if (found) return found
        }
      }
      return null
    }
    
    const comment = findComment(post.comments, commentId)
    if (!comment) return
    
    // Reaction ID'leri state'teki likedUsers/dislikedUsers array'lerinden al
    const likedEntry = comment.likedUsers?.find(u => Number(u.userID) === Number(currentUserId))
    const dislikedEntry = comment.dislikedUsers?.find(u => Number(u.userID) === Number(currentUserId))
    const likeReactionId = likedEntry?.chatReactionsID ?? likedEntry?.postReactionID ?? likedEntry?.reactionID ?? likedEntry?.id
    const dislikeReactionId = dislikedEntry?.chatReactionsID ?? dislikedEntry?.postReactionID ?? dislikedEntry?.reactionID ?? dislikedEntry?.id
    
    const numericCommentId = comment.postID
    const prevVote = comment.myVote || 0
    const prevLikes = comment.likes || 0
    const prevDislikes = comment.dislikes || 0

    // İptal işlemleri için reaction ID kontrolü
    if (prevVote === delta) {
      if (delta === 1 && !likeReactionId) {
        showError('Like reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        return
      }
      if (delta === -1 && !dislikeReactionId) {
        showError('Dislike reaction ID bulunamadı. Lütfen sayfayı yenileyin.')
        return
      }
    }

    // Optimistic update
    const updateComment = (comments) => {
      return comments.map(c => {
        if (c.id === commentId) {
          let newVote = prevVote
          let newLikes = prevLikes
          let newDislikes = prevDislikes

          if (prevVote === delta) {
            // İptal et
            if (delta === 1) newLikes -= 1
            if (delta === -1) newDislikes -= 1
            newVote = 0
          } else {
            // Yeni oy ver veya değiştir
            if (delta === 1) {
              newLikes += 1
              if (prevVote === -1) newDislikes -= 1
            } else {
              newDislikes += 1
              if (prevVote === 1) newLikes -= 1
            }
            newVote = delta
          }
          
          return {
            ...c,
            myVote: newVote,
            likes: newLikes,
            dislikes: newDislikes
          }
        }
        if (c.comments?.length) {
          return { ...c, comments: updateComment(c.comments) }
        }
        return c
      })
    }
    
    setPost(p => ({ ...p, comments: updateComment(p.comments) }))

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
        await addPostReaction(token, numericCommentId, isLike)
      }
      
      // Reload post
      await reloadPostWithUserNames(post.postID)
    } catch (err) {
      // Rollback - restore original state
      const rollbackComment = (comments) => {
        return comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              myVote: prevVote,
              likes: prevLikes,
              dislikes: prevDislikes
            }
          }
          if (c.comments?.length) {
            return { ...c, comments: rollbackComment(c.comments) }
          }
          return c
        })
      }
      setPost(p => ({ ...p, comments: rollbackComment(p.comments) }))
      showError(err?.message || 'İşlem başarısız oldu.')
    }
  }

  const handleAddComment = async (postId, text, commentId) => {
    if (!token || !post) return
    
    try {
      // commentId varsa yoruma yorum, yoksa posta yorum
      // commentId formatı: "c_123" -> 123
      const parentID = commentId ? Number(commentId.replace('c_', '')) : post.postID
      await addComment(token, parentID, text, post.category || null, user?.userID)
      
      // Reload post after adding comment
      await reloadPostWithUserNames(post.postID)
    } catch (err) {
      alert(err?.message || 'Yorum eklenirken bir hata oluştu.')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!token) return
    // Navigate back after deletion
    navigate('/posts')
  }

  const handleDeleteComment = async (postId, commentId) => {
    if (!token || !post) return
    // Reload post after deleting comment
    try {
      await reloadPostWithUserNames(post.postID)
    } catch (err) {
      console.error('Failed to reload post:', err)
    }
  }

  const handleAuthorClick = (authorId) => {
    navigate(`/profile?userID=${authorId}`)
  }

  const handleViewComments = (commentPostID) => {
    // Yorumun detay sayfasına git
    navigate(`/post/${commentPostID}`)
  }

  if (loading) {
    return (
      <Box sx={{ py: { xs: 2, md: 0 }, px: { xs: 0, sm: 0 } }}>
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ py: { xs: 2, md: 0 }, px: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <IconButton onClick={() => navigate('/posts')} sx={{ alignSelf: 'flex-start' }}>
            <ArrowBack />
          </IconButton>
          <Alert severity="error">{error}</Alert>
        </Stack>
      </Box>
    )
  }

  if (!post) {
    return (
      <Box sx={{ py: { xs: 2, md: 0 }, px: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <IconButton onClick={() => navigate('/posts')} sx={{ alignSelf: 'flex-start' }}>
            <ArrowBack />
          </IconButton>
          <Alert severity="info">Post bulunamadı.</Alert>
        </Stack>
      </Box>
    )
  }

  const isOwner = user?.userID === post.authorId

  return (
    <Box sx={{ py: { xs: 1.5, md: 0 }, px: { xs: 0, sm: 0 } }}>
      {/* Back button - Breadcrumb navigation */}
      <Box sx={{ 
        px: { xs: 1.5, md: 3 }, 
        py: { xs: 1, md: 1.5 },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, md: 1.5 }
      }}>
        <IconButton 
          onClick={() => {
            // Eğer parentsID varsa ve 0 değilse, üst seviyeye git
            if (post?.parentsID && post.parentsID !== 0) {
              navigate(`/post/${post.parentsID}`)
            } else {
              // Ana post sayfasına git
              navigate('/posts')
            }
          }} 
          sx={{ 
            width: { xs: 48, md: 40 }, // Mobilde daha büyük touch target
            height: { xs: 48, md: 40 },
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: 'rgba(255,255,255,0.08)'
            },
            '&:active': {
              transform: { xs: 'scale(0.95)', md: 'none' } // Mobilde basma efekti
            }
          }}
        >
          <ArrowBack sx={{ fontSize: { xs: '24px', md: '20px' } }} />
        </IconButton>
        {post?.parentsID && post.parentsID !== 0 && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '13px', md: '13px' },
              fontWeight: 500
            }}
          >
            Yorum detayı
          </Typography>
        )}
      </Box>
      
      <PostCard
        key={post.id}
        {...post}
        token={token}
        postID={post.postID}
        isOwner={isOwner}
        currentUserId={user?.userID}
        onVote={handleVote}
        onAddComment={handleAddComment}
        onCommentVote={handleCommentVote}
        onDelete={handleDeletePost}
        onCommentDelete={handleDeleteComment}
        onAuthorClick={handleAuthorClick}
        forceOpenComments={true}
        onViewComments={handleViewComments}
      />
    </Box>
  )
}


