import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Stack, Typography, CircularProgress, Alert, IconButton,
  useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ArrowBack } from '@mui/icons-material'
import PostCard from '../components/PostCard.jsx'

import { useAuth } from '../context/AuthContext.jsx'
import { getPostWithId, getUserByID, addComment } from '../services/api.js'
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
  const liked = likedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId)
  const disliked = dislikedUsers.some(u => (u?.userID ?? u?.userId) === currentUserId)
  if (liked) return 1
  if (disliked) return -1
  return 0
}

function toCommentModel(comment, currentUserId, idToName) {
  const cLiked = dedupUsers(comment.likedUser || [])
  const cDisliked = dedupUsers(comment.dislikedUser || [])
  const cidRaw = comment.postID ?? comment.commnetsID ?? comment.commentsID ?? comment.id
  const cidNum = Number(cidRaw)
  const safeId = Number.isFinite(cidNum) ? `c_${cidNum}` : `c_tmp_${Math.random().toString(36).slice(2)}`
  const authorId = comment.userID ?? comment.userId
  const authorOverride = idToName?.get?.(authorId)
  
  const nestedComments = Array.isArray(comment.comments)
    ? comment.comments.map(c => toCommentModel(c, currentUserId, idToName))
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
    category: comment.category || null
  }
}

function toPostModel(post, currentUserId, idToName) {
  const liked = dedupUsers(post.likedUser || [])
  const disliked = dedupUsers(post.dislikedUser || [])

  const comments = Array.isArray(post.comments)
    ? post.comments.map(c => toCommentModel(c, currentUserId, idToName))
    : []

  const authorFull = idToName?.get?.(post.userID)
    || [post.name, post.surname].filter(Boolean).join(' ')
    || post.userName
    || `Kullanıcı #${post.userID ?? '???'}`

  return {
    id: `p_${post.postID}`,
    postID: post.postID,
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
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [idToName, setIdToName] = useState(new Map())

  // Load post data
  useEffect(() => {
    if (!postID || !token) return
    
    let mounted = true
    setLoading(true)
    setError('')
    
    getPostWithId(token, Number(postID))
      .then(async (data) => {
        if (!mounted) return
        
        // Build author name map
        const userIds = new Set()
        if (data?.userID) userIds.add(data.userID)
        
        const extractUserIds = (comments) => {
          if (!Array.isArray(comments)) return
          comments.forEach(comment => {
            if (comment?.userID) userIds.add(comment.userID)
            if (Array.isArray(comment.comments)) extractUserIds(comment.comments)
          })
        }
        if (Array.isArray(data.comments)) extractUserIds(data.comments)
        
        // Fetch user names
        const nameMap = new Map()
        await Promise.all(
          Array.from(userIds).map(async (uid) => {
            try {
              const userData = await getUserByID(token, uid)
              if (userData?.name || userData?.surname) {
                nameMap.set(uid, [userData.name, userData.surname].filter(Boolean).join(' '))
              }
            } catch (e) {
              console.error(`Failed to fetch user ${uid}:`, e)
            }
          })
        )
        
        setIdToName(nameMap)
        const postModel = toPostModel(data, user?.userID, nameMap)
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
    const prevVote = post.myVote
    const prevLikes = post.likes
    const prevDislikes = post.dislikes

    // Optimistic update
    setPost(p => ({
      ...p,
      myVote: delta === 1 ? 1 : -1,
      likes: delta === 1 ? p.likes + (prevVote === 1 ? 0 : 1) - (prevVote === -1 ? 1 : 0) : p.likes - (prevVote === 1 ? 1 : 0),
      dislikes: delta === -1 ? p.dislikes + (prevVote === -1 ? 0 : 1) - (prevVote === 1 ? 1 : 0) : p.dislikes - (prevVote === -1 ? 1 : 0)
    }))

    try {
      if (prevVote === delta) {
        // Cancel
        if (delta === 1) await cancelLikeChatReaction(token, numericId)
        else await cancelDislikeChatReaction(token, numericId)
      } else {
        // Switch or new
        if (prevVote === -1) await cancelDislikeChatReaction(token, numericId)
        if (prevVote === 1) await cancelLikeChatReaction(token, numericId)
        if (delta === 1) await likeChatReaction(token, numericId)
        else await dislikeChatReaction(token, numericId)
      }
      
      // Reload post to get accurate state
      const updated = await getPostWithId(token, numericId)
      const updatedModel = toPostModel(updated, user?.userID, idToName)
      setPost(updatedModel)
    } catch (err) {
      // Rollback
      setPost(p => ({
        ...p,
        myVote: prevVote,
        likes: prevLikes,
        dislikes: prevDislikes
      }))
      alert(err?.message || 'İşlem başarısız oldu.')
    }
  }

  const handleCommentVote = async (postId, commentId, delta) => {
    if (!token || !post) return
    
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
    
    const numericCommentId = comment.postID
    const prevVote = comment.myVote
    const prevLikes = comment.likes
    const prevDislikes = comment.dislikes

    // Optimistic update
    const updateComment = (comments) => {
      return comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            myVote: delta === 1 ? 1 : -1,
            likes: delta === 1 ? c.likes + (prevVote === 1 ? 0 : 1) - (prevVote === -1 ? 1 : 0) : c.likes - (prevVote === 1 ? 1 : 0),
            dislikes: delta === -1 ? c.dislikes + (prevVote === -1 ? 0 : 1) - (prevVote === 1 ? 1 : 0) : c.dislikes - (prevVote === -1 ? 1 : 0)
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
        if (delta === 1) await cancelLikeCommentReaction(token, numericCommentId)
        else await cancelDislikeCommentReaction(token, numericCommentId)
      } else {
        if (prevVote === -1) await cancelDislikeCommentReaction(token, numericCommentId)
        if (prevVote === 1) await cancelLikeCommentReaction(token, numericCommentId)
        if (delta === 1) await likeCommentReaction(token, numericCommentId)
        else await dislikeCommentReaction(token, numericCommentId)
      }
      
      // Reload post
      const updated = await getPostWithId(token, post.postID)
      const updatedModel = toPostModel(updated, user?.userID, idToName)
      setPost(updatedModel)
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
      alert(err?.message || 'İşlem başarısız oldu.')
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
      const updated = await getPostWithId(token, post.postID)
      const updatedModel = toPostModel(updated, user?.userID, idToName)
      setPost(updatedModel)
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
      const updated = await getPostWithId(token, post.postID)
      const updatedModel = toPostModel(updated, user?.userID, idToName)
      setPost(updatedModel)
    } catch (err) {
      console.error('Failed to reload post:', err)
    }
  }

  const handleAuthorClick = (authorId) => {
    navigate(`/profile?userID=${authorId}`)
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <Stack spacing={2}>
          <IconButton onClick={() => navigate('/posts')} sx={{ alignSelf: 'flex-start' }}>
            <ArrowBack />
          </IconButton>
          <Alert severity="error">{error}</Alert>
        </Stack>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <Stack spacing={2}>
          <IconButton onClick={() => navigate('/posts')} sx={{ alignSelf: 'flex-start' }}>
            <ArrowBack />
          </IconButton>
          <Alert severity="info">Post bulunamadı.</Alert>
        </Stack>
      </Container>
    )
  }

  const isOwner = user?.userID === post.authorId

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 1.5, md: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Back button - only on mobile */}
      {isMobile && (
        <IconButton 
          onClick={() => navigate('/posts')} 
          sx={{ 
            mb: 2,
            width: { xs: 44, md: 40 },
            height: { xs: 44, md: 40 }
          }}
        >
          <ArrowBack />
        </IconButton>
      )}
      
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
      />
    </Container>
  )
}


