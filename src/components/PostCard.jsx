import { useState, useEffect } from 'react'
import {
  Box, Avatar, Typography, Stack, IconButton, Tooltip, Divider,
  TextField, Button, Chip, List, ListItem, ListItemText, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { getLikedPostPeople, getDislikedPostPeople, getUserByID } from '../services/api.js'
import {
  ChatBubbleOutline,
  ThumbUpOffAlt,
  ThumbDownOffAlt,
  DeleteOutline,
  Close,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

/**
 * PostCard:
 * - Like/Dislike (post seviyesi)
 * - Yorum paneli: yorum ekleme + yorumlarda like/dislike + (opsiyonel) silme
 * - Kategori rozeti
 * - Beğenen/Beğenmeyen kullanıcı listeleri
 * - Sahip ise post sil (onaylı)
 */
export default function PostCard({
  id,
  author,
  authorId,
  content,
  timestamp,
  likes = 0,
  dislikes = 0,
  myVote = 0,          // -1: dislike, 0: none, +1: like
  comments = [],
  // Yeni props
  category = null,
  likedUsers = [],     // [{ userID, name, surname }]
  dislikedUsers = [],  // [{ userID, name, surname }]
  isOwner = false,     // post sahibi misin?
  deleting = false,
  currentUserId = null, // 🔹 oturumdaki kullanıcının ID'si (yorum sil için)
  token = null,        // 🔹 API çağrıları için token
  postID = null,       // 🔹 Post ID (API çağrıları için)

  // Callbacks
  onVote,               // (postId, delta) => void  delta: +1 | -1
  onAddComment,         // (postId, text, commentId?) => void  commentId varsa yoruma yorum, yoksa posta yorum
  onCommentVote,        // (postId, commentId, delta) => void
  onDelete,             // (postId) => void
  onCommentDelete,      // 🔹 (postId, commentId) => void
  onAuthorClick,        // 🔹 (authorId) => void
  forceOpenComments     // 🔹 Detay sayfasında yorumları zorla açık tut
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  // Yorumlar varsayılan olarak kapalı (sadece detay sayfasında forceOpenComments true ise açık)
  const [openComments, setOpenComments] = useState(forceOpenComments ? true : false)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null) // Hangi yoruma yanıt veriliyor
  const [showLikedDialog, setShowLikedDialog] = useState(false)
  const [showDislikedDialog, setShowDislikedDialog] = useState(false)
  const [loadedLikedUsers, setLoadedLikedUsers] = useState(null)
  const [loadedDislikedUsers, setLoadedDislikedUsers] = useState(null)
  const [loadingLikedUsers, setLoadingLikedUsers] = useState(false)
  const [loadingDislikedUsers, setLoadingDislikedUsers] = useState(false)
  // openDetails, toggleDetails, handleDetails kaldırıldı

  const dt = new Date(timestamp)
  
  // Extract numeric postID from id string (e.g., "p_123" -> 123)
  const numericPostID = postID ?? (typeof id === 'string' && id.startsWith('p_') ? Number(id.replace('p_', '')) : Number(id))
  
  // Mobilde post container'a tıklayınca detay sayfasına git (detay sayfasında değilse)
  const handlePostClick = (e) => {
    // Eğer detay sayfasındaysak (forceOpenComments varsa), navigate yapma
    if (forceOpenComments) return
    
    // Eğer tıklama bir buton, link veya interactive element üzerindeyse, navigate yapma
    const target = e.target
    const isInteractive = target.closest('button, a, [role="button"], input, textarea, [role="dialog"], [role="menu"]') !== null
    if (isMobile && !isInteractive && numericPostID) {
      navigate(`/post/${numericPostID}`)
    }
  }
  
  // Load liked users when dialog opens
  useEffect(() => {
    if (showLikedDialog && token && numericPostID && (!loadedLikedUsers || loadedLikedUsers.length === 0)) {
      const hasNames = likedUsers.some(u => u?.name || u?.surname)
      if (!hasNames) {
        setLoadingLikedUsers(true)
        getLikedPostPeople(token, numericPostID)
          .then(async (data) => {
            const users = Array.isArray(data) ? data : []
            // Eğer API'den gelen verilerde name ve surname yoksa, her kullanıcı için getUserByID ile çek
            const enrichedUsers = await Promise.all(
              users.map(async (user) => {
                if (user?.name && user?.surname) {
                  return user
                }
                if (user?.userID) {
                  try {
                    const userDetails = await getUserByID(token, user.userID)
                    return {
                      ...user,
                      name: userDetails?.name || user?.name || null,
                      surname: userDetails?.surname || user?.surname || null
                    }
                  } catch (err) {
                    console.error(`[PostCard] Failed to load user ${user.userID}:`, err)
                    return user
                  }
                }
                return user
              })
            )
            setLoadedLikedUsers(enrichedUsers)
            setLoadingLikedUsers(false)
          })
          .catch(err => {
            console.error('[PostCard] Failed to load liked users:', err)
            setLoadingLikedUsers(false)
          })
      } else {
        // Eğer likedUsers'da name ve surname varsa, onları kullan
        setLoadedLikedUsers(likedUsers)
      }
    }
  }, [showLikedDialog, token, numericPostID, likedUsers, loadedLikedUsers])
  
  // Load disliked users when dialog opens
  useEffect(() => {
    if (showDislikedDialog && token && numericPostID && (!loadedDislikedUsers || loadedDislikedUsers.length === 0)) {
      const hasNames = dislikedUsers.some(u => u?.name || u?.surname)
      if (!hasNames) {
        setLoadingDislikedUsers(true)
        getDislikedPostPeople(token, numericPostID)
          .then(async (data) => {
            const users = Array.isArray(data) ? data : []
            // Eğer API'den gelen verilerde name ve surname yoksa, her kullanıcı için getUserByID ile çek
            const enrichedUsers = await Promise.all(
              users.map(async (user) => {
                if (user?.name && user?.surname) {
                  return user
                }
                if (user?.userID) {
                  try {
                    const userDetails = await getUserByID(token, user.userID)
                    return {
                      ...user,
                      name: userDetails?.name || user?.name || null,
                      surname: userDetails?.surname || user?.surname || null
                    }
                  } catch (err) {
                    console.error(`[PostCard] Failed to load user ${user.userID}:`, err)
                    return user
                  }
                }
                return user
              })
            )
            setLoadedDislikedUsers(enrichedUsers)
            setLoadingDislikedUsers(false)
          })
          .catch(err => {
            console.error('[PostCard] Failed to load disliked users:', err)
            setLoadingDislikedUsers(false)
          })
      } else {
        // Eğer dislikedUsers'da name ve surname varsa, onları kullan
        setLoadedDislikedUsers(dislikedUsers)
      }
    }
  }, [showDislikedDialog, token, numericPostID, dislikedUsers, loadedDislikedUsers])
  const toggleComments = (e) => {
    // Mobilde yorum butonuna tıklayınca detay sayfasına git
    if (isMobile && numericPostID) {
      e?.stopPropagation?.()
      navigate(`/post/${numericPostID}`)
      return
    }
    // Desktop'ta mevcut davranış
    setOpenComments(v => !v)
  }
  // toggleDetails kaldırıldı

  const handleVote = (delta, e) => {
    // Eğer detay sayfasındaysak (forceOpenComments varsa), direkt vote yap
    if (forceOpenComments) {
      e?.stopPropagation?.()
      onVote?.(id, delta)
      return
    }
    
    // Mobilde vote butonuna tıklayınca detay sayfasına git (detay sayfası değilse)
    if (isMobile && numericPostID) {
      e?.stopPropagation?.()
      navigate(`/post/${numericPostID}`)
      return
    }
    
    // Desktop'ta veya detay sayfasında direkt vote yap
    onVote?.(id, delta)
  }

  const handleAdd = (e, commentId = null) => {
    e.preventDefault()
    const t = commentText.trim()
    if (!t) return
    onAddComment?.(id, t, commentId)
    setCommentText('')
    setReplyingTo(null)
    if (!openComments) setOpenComments(true)
  }
  
  // Recursive component for nested comments - Twitter tarzı
  // Maksimum depth: 6 seviye (çok derinleşmesini önlemek için)
  const MAX_COMMENT_DEPTH = 6
  const CommentItem = ({ comment, postId, depth = 0 }) => {
    const [replyText, setReplyText] = useState('')
    const [showReply, setShowReply] = useState(false)
    const canDeleteComment = !!onCommentDelete && (isOwner || (currentUserId && comment.authorId && comment.authorId === currentUserId))
    
    // Depth limit kontrolü - çok derinleşirse daha fazla indent yapma
    const effectiveDepth = Math.min(depth, MAX_COMMENT_DEPTH)
    
    return (
      <Box 
        sx={{ 
          ml: effectiveDepth > 0 ? { xs: Math.min(effectiveDepth * 1.5, 4), md: Math.min(effectiveDepth * 2, 6) } : 0, 
          mt: effectiveDepth > 0 ? 1.5 : 0,
          pl: effectiveDepth > 0 ? { xs: Math.min(effectiveDepth * 1.5, 3), md: Math.min(effectiveDepth * 2, 4) } : 0,
          borderLeft: effectiveDepth > 0 ? '2px solid rgba(255,255,255,0.08)' : 'none',
          py: 1.5,
          borderBottom: depth === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          '&:hover': {
            backgroundColor: depth === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
          },
          transition: 'background-color 0.2s ease',
          // Mobilde çok geniş olmasını önle
          maxWidth: '100%',
          overflow: 'visible'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 40, height: 40, fontSize: 14 }}>
            {initialsFrom(comment.author)}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    fontSize: { xs: '14px', md: '15px' }
                  }}
                >
                  {comment.author}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '13px', md: '13px' }
                  }}
                >
                  · {new Date(comment.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </Typography>
              </Stack>
              
              {canDeleteComment && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onCommentDelete?.(postId, comment.id)}
                  startIcon={<DeleteOutline fontSize="small" />}
                  sx={{
                    minWidth: { xs: 60, md: 70 },
                    height: { xs: 28, md: 28 },
                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                    fontWeight: 600,
                    borderColor: 'rgba(244,67,54,0.5)',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.main',
                      backgroundColor: 'rgba(244,67,54,0.1)'
                    }
                  }}
                >
                  Sil
                </Button>
              )}
            </Stack>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary', 
                mb: 0.75,
                fontSize: { xs: '14px', md: '15px' },
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}
            >
              {comment.text}
            </Typography>
            
            {/* Aksiyonlar - Twitter tarzı */}
            <Stack 
              direction="row" 
              spacing={0} 
              sx={{ 
                mt: 0.75,
                maxWidth: { xs: '100%', md: '400px' },
                justifyContent: 'space-between'
              }} 
              alignItems="center"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(52,195,161,0.1)'
                  }
                }}
                onClick={() => setShowReply(!showReply)}
              >
                <IconButton
                  size="small"
                  sx={{ 
                    color: 'inherit',
                    width: 32, 
                    height: 32,
                    minWidth: 32,
                    minHeight: 32,
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <ChatBubbleOutline sx={{ fontSize: '16px' }} />
                </IconButton>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: comment.myVote === 1 ? 'primary.main' : 'text.secondary',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(52,195,161,0.1)'
                  }
                }}
                onClick={() => onCommentVote?.(postId, comment.id, +1)}
              >
                <IconButton
                  size="small"
                  sx={{ 
                    color: 'inherit',
                    width: 32, 
                    height: 32,
                    minWidth: 32,
                    minHeight: 32,
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <ThumbUpOffAlt sx={{ fontSize: '16px' }} />
                </IconButton>
                {comment.likes > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'inherit',
                      fontSize: '13px'
                    }}
                  >
                    {comment.likes}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: comment.myVote === -1 ? 'error.main' : 'text.secondary',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: 'rgba(244,67,54,0.1)'
                  }
                }}
                onClick={() => onCommentVote?.(postId, comment.id, -1)}
              >
                <IconButton
                  size="small"
                  sx={{ 
                    color: 'inherit',
                    width: 32, 
                    height: 32,
                    minWidth: 32,
                    minHeight: 32,
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <ThumbDownOffAlt sx={{ fontSize: '16px' }} />
                </IconButton>
                {comment.dislikes > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'inherit',
                      fontSize: '13px'
                    }}
                  >
                    {comment.dislikes}
                  </Typography>
                )}
              </Box>
            </Stack>
            
            {/* Reply form - Twitter tarzı */}
            {showReply && (
              <Box 
                component="form" 
                onSubmit={(e) => {
                  e.preventDefault()
                  const t = replyText.trim()
                  if (!t) return
                  onAddComment?.(postId, t, comment.id)
                  setReplyText('')
                  setShowReply(false)
                }} 
                sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 1, 
                  mt: 1.5, 
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  pt: 1.5,
                  borderTop: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Yanıt yaz…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '15px', md: '15px' },
                      minHeight: { xs: 40, md: 40 },
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.15)'
                      },
                      '&.Mui-focused': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained"
                  size="small"
                  sx={{
                    minHeight: { xs: 40, md: 40 },
                    minWidth: { xs: 80, sm: 90 },
                    fontSize: { xs: '14px', md: '14px' },
                    px: { xs: 2, md: 2.5 },
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Gönder
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => { setShowReply(false); setReplyText('') }}
                  sx={{
                    minHeight: { xs: 40, md: 40 },
                    minWidth: { xs: 70, sm: 80 },
                    fontSize: { xs: '14px', md: '14px' },
                    px: { xs: 2, md: 2 },
                    borderRadius: 2
                  }}
                >
                  İptal
                </Button>
              </Box>
            )}
            
            {/* Nested comments */}
            {comment.comments && comment.comments.length > 0 && depth < MAX_COMMENT_DEPTH && (
              <Box sx={{ mt: 1.5, overflow: 'visible' }}>
                {comment.comments.map((nestedComment) => (
                  <CommentItem
                    key={nestedComment.id}
                    comment={nestedComment}
                    postId={postId}
                    depth={depth + 1}
                  />
                ))}
              </Box>
            )}
            {/* Depth limit'e ulaşıldığında bilgi mesajı */}
            {comment.comments && comment.comments.length > 0 && depth >= MAX_COMMENT_DEPTH && (
              <Box sx={{ mt: 1, pl: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px', fontStyle: 'italic' }}>
                  Daha fazla yanıt görmek için üst seviyedeki yorumu genişletin
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    )
  }

  const handleDeletePost = async () => {
    if (!isOwner || !onDelete) return
    const ok = window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')
    if (!ok) return
    await onDelete(id)
  }

  const handleDeleteComment = async (commentId) => {
    if (!onCommentDelete) return
    const ok = window.confirm('Bu yorumu silmek istediğinize emin misiniz?')
    if (!ok) return
    await onCommentDelete(id, commentId)
  }

  const userFullName = (u) => [u?.name, u?.surname].filter(Boolean).join(' ') || `Kullanıcı #${u?.userID || ''}`

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        px: { xs: 2, sm: 3 },
        borderRadius: 0,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'transparent',
        cursor: (isMobile && !forceOpenComments) ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.03)'
        }
      }}
      onClick={handlePostClick}
    >
      <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="flex-start">
        <Avatar 
          aria-hidden 
          sx={{ 
            bgcolor: 'secondary.main', 
            fontWeight: 800, 
            width: 48, 
            height: 48, 
            fontSize: 18,
            cursor: onAuthorClick && authorId ? 'pointer' : 'default',
            '&:hover': onAuthorClick && authorId ? { opacity: 0.8 } : {}
          }}
          onClick={(e) => {
            if (authorId && onAuthorClick) {
              e.stopPropagation()
              onAuthorClick(authorId)
            }
          }}
        >
          {initialsFrom(author)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Üst bilgi satırı - Twitter tarzı */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, minWidth: 0, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle2"
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary', 
                cursor: onAuthorClick && authorId ? 'pointer' : 'default',
                fontSize: { xs: '15px', md: '15px' },
                '&:hover': onAuthorClick && authorId ? { textDecoration: 'underline' } : {}
              }}
              onClick={(e) => {
                if (authorId && onAuthorClick) {
                  e.stopPropagation()
                  onAuthorClick(authorId)
                }
              }}
              title={author}
            >
              {author}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '13px', md: '15px' }
              }}
            >
              · {dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {isOwner && !!onDelete && (
              <Button
                    size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeletePost()
                }}
                    disabled={deleting}
                startIcon={deleting ? <CircularProgress size={14} /> : <DeleteOutline />}
                sx={{
                  minWidth: { xs: 70, md: 90 },
                  minHeight: { xs: 32, md: 32 },
                  height: { xs: 32, md: 32 },
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                  fontWeight: 600,
                  borderColor: 'rgba(244,67,54,0.5)',
                  color: 'error.main',
                  px: { xs: 1, md: 1.5 },
                  '&:hover': {
                    borderColor: 'error.main',
                    backgroundColor: 'rgba(244,67,54,0.1)'
                  }
                }}
              >
                {deleting ? 'Siliniyor' : 'Sil'}
              </Button>
            )}
          </Stack>

          {/* Kategori rozeti */}
          {category && (
            <Chip
              size="small"
              label={category}
              variant="outlined"
              sx={{ 
                mb: 1, 
                fontSize: '0.7rem', 
                height: 22,
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'text.secondary'
              }}
            />
          )}

          {/* İçerik - Twitter tarzı */}
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.5,
              color: 'text.primary',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              mb: { xs: 1, md: 1.25 },
              fontSize: { xs: '15px', md: '15px' },
              whiteSpace: 'pre-wrap'
            }}
          >
            {content}
          </Typography>

          {/* Aksiyonlar - Twitter tarzı */}
          <Stack 
            direction="row" 
            spacing={{ xs: 0, md: 0 }} 
            sx={{ 
              mt: { xs: 0.75, md: 1 },
              maxWidth: { xs: '100%', md: '425px' },
              justifyContent: 'space-between'
            }} 
            alignItems="center"
          >
            {/* Yorumlar - Twitter tarzı */}
            <Tooltip title={openComments ? 'Yorumları gizle' : 'Yorumları göster'}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: openComments ? 'primary.main' : 'text.secondary',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(52,195,161,0.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleComments(e)
                }}
              >
                <IconButton 
                  size="small" 
                  sx={{ 
                    color: 'inherit',
                    width: { xs: 36, md: 36 }, 
                    height: { xs: 36, md: 36 },
                    minWidth: { xs: 36, md: 36 },
                    minHeight: { xs: 36, md: 36 },
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <ChatBubbleOutline sx={{ fontSize: { xs: '18px', md: '18px' } }} />
                </IconButton>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'inherit',
                    fontSize: { xs: '13px', md: '13px' },
                    minWidth: 'auto'
                  }}
                >
                  {comments.length > 0 ? comments.length : ''}
                </Typography>
              </Box>
            </Tooltip>

            {/* Like - Twitter tarzı */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: myVote === 1 ? 'primary.main' : 'text.secondary',
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(52,195,161,0.1)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleVote(+1, e)
              }}
            >
              <IconButton
                size="small"
                sx={{ 
                  color: 'inherit',
                  width: { xs: 36, md: 36 }, 
                  height: { xs: 36, md: 36 },
                  minWidth: { xs: 36, md: 36 },
                  minHeight: { xs: 36, md: 36 },
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <ThumbUpOffAlt sx={{ fontSize: { xs: '18px', md: '18px' } }} />
              </IconButton>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'inherit',
                  cursor: likes > 0 ? 'pointer' : 'default',
                  fontSize: { xs: '13px', md: '13px' },
                  minWidth: 'auto',
                  '&:hover': likes > 0 ? { textDecoration: 'underline' } : {}
                }}
                onClick={(e) => {
                  if (likes > 0) {
                    e.stopPropagation()
                    setShowLikedDialog(true)
                  }
                }}
              >
                {likes > 0 ? likes : ''}
            </Typography>
            </Box>

            {/* Dislike - Twitter tarzı */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: myVote === -1 ? 'error.main' : 'text.secondary',
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: 'rgba(244,67,54,0.1)'
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleVote(-1, e)
              }}
            >
              <IconButton
                size="small"
                sx={{ 
                  color: 'inherit',
                  width: { xs: 36, md: 36 }, 
                  height: { xs: 36, md: 36 },
                  minWidth: { xs: 36, md: 36 },
                  minHeight: { xs: 36, md: 36 },
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <ThumbDownOffAlt sx={{ fontSize: { xs: '18px', md: '18px' } }} />
              </IconButton>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'inherit',
                  cursor: dislikes > 0 ? 'pointer' : 'default',
                  fontSize: { xs: '13px', md: '13px' },
                  minWidth: 'auto',
                  '&:hover': dislikes > 0 ? { textDecoration: 'underline' } : {}
                }}
                onClick={(e) => {
                  if (dislikes > 0) {
                    e.stopPropagation()
                    setShowDislikedDialog(true)
                  }
                }}
              >
                {dislikes > 0 ? dislikes : ''}
            </Typography>
            </Box>
          </Stack>

          {/* Beğenen Kişiler Dialog */}
          <Dialog 
            open={showLikedDialog} 
            onClose={() => setShowLikedDialog(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={false}
            PaperProps={{
              sx: {
                bgcolor: 'rgba(7, 20, 28, 0.98)',
                borderRadius: { xs: 0, sm: 2 },
                m: { xs: 0, sm: 2 },
                maxHeight: { xs: '100vh', sm: '80vh' },
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FAF9F6'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: { xs: 2, md: 1.5 },
              px: { xs: 2, md: 3 },
              pt: { xs: 2, md: 1.5 },
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#FAF9F6'
            }}>
              <Stack direction="row" spacing={{ xs: 1.25, md: 1.5 }} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 44, md: 40 }, height: { xs: 44, md: 40 } }}>
                  <ThumbUp sx={{ color: 'white', fontSize: { xs: '22px', md: '20px' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#FAF9F6', fontSize: { xs: '18px', md: '20px' } }}>
                    Beğenen Kişiler
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.7)', fontSize: { xs: '12px', md: '13px' } }}>
                    {likes} kişi beğendi
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setShowLikedDialog(false)}
                sx={{ 
                  color: 'rgba(250, 249, 246, 0.7)',
                  width: { xs: 44, md: 40 },
                  height: { xs: 44, md: 40 },
                  minWidth: { xs: 44, md: 40 },
                  minHeight: { xs: 44, md: 40 }
                }}
              >
                <Close sx={{ fontSize: { xs: '22px', md: '20px' } }} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ 
              p: { xs: 2, md: 3 }, 
              maxHeight: { xs: 'calc(100vh - 200px)', sm: '60vh' }, 
              overflow: 'auto', 
              bgcolor: 'transparent' 
            }}>
              {loadingLikedUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (() => {
                const usersToShow = (loadedLikedUsers && loadedLikedUsers.length > 0) 
                  ? loadedLikedUsers 
                  : likedUsers
                return usersToShow.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                      <ThumbUpOffAlt sx={{ fontSize: 32, color: 'rgba(250, 249, 246, 0.5)' }} />
                    </Avatar>
                    <Typography variant="body1" sx={{ color: 'rgba(250, 249, 246, 0.7)', fontWeight: 500 }}>
                      Henüz kimse beğenmemiş
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.5)', mt: 0.5, display: 'block' }}>
                      İlk beğenen sen ol!
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 1 }}>
                    {usersToShow.map((user, idx) => (
                      <ListItem 
                        key={user?.userID ?? idx} 
                        sx={{ 
                          px: 2.5, 
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.05)'
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: 'secondary.main', 
                            width: 44, 
                            height: 44, 
                            mr: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#FAF9F6'
                          }}
                        >
                          {initialsFrom(userFullName(user))}
                        </Avatar>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FAF9F6' }}>
                              {userFullName(user)}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.6)', mt: 0.25 }}>
                              Kullanıcı #{user?.userID ?? ''}
                            </Typography>
                          }
                        />
                        <ThumbUp sx={{ color: 'primary.main', fontSize: 20 }} />
                      </ListItem>
                    ))}
                  </List>
                )
              })()}
            </DialogContent>
          </Dialog>

          {/* Beğenmeyen Kişiler Dialog */}
          <Dialog 
            open={showDislikedDialog} 
            onClose={() => setShowDislikedDialog(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={false}
            PaperProps={{
              sx: {
                bgcolor: 'rgba(7, 20, 28, 0.98)',
                borderRadius: { xs: 0, sm: 2 },
                m: { xs: 0, sm: 2 },
                maxHeight: { xs: '100vh', sm: '80vh' },
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FAF9F6'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pb: { xs: 2, md: 1.5 },
              px: { xs: 2, md: 3 },
              pt: { xs: 2, md: 1.5 },
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#FAF9F6'
            }}>
              <Stack direction="row" spacing={{ xs: 1.25, md: 1.5 }} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', width: { xs: 44, md: 40 }, height: { xs: 44, md: 40 } }}>
                  <ThumbDown sx={{ color: 'white', fontSize: { xs: '22px', md: '20px' } }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#FAF9F6', fontSize: { xs: '18px', md: '20px' } }}>
                    Beğenmeyen Kişiler
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.7)', fontSize: { xs: '12px', md: '13px' } }}>
                    {dislikes} kişi beğenmedi
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setShowDislikedDialog(false)}
                sx={{ 
                  color: 'rgba(250, 249, 246, 0.7)',
                  width: { xs: 44, md: 40 },
                  height: { xs: 44, md: 40 },
                  minWidth: { xs: 44, md: 40 },
                  minHeight: { xs: 44, md: 40 }
                }}
              >
                <Close sx={{ fontSize: { xs: '22px', md: '20px' } }} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ 
              p: { xs: 2, md: 3 }, 
              maxHeight: { xs: 'calc(100vh - 200px)', sm: '60vh' }, 
              overflow: 'auto', 
              bgcolor: 'transparent' 
            }}>
              {loadingDislikedUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (() => {
                const usersToShow = (loadedDislikedUsers && loadedDislikedUsers.length > 0) 
                  ? loadedDislikedUsers 
                  : dislikedUsers
                return usersToShow.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                      <ThumbDownOffAlt sx={{ fontSize: 32, color: 'rgba(250, 249, 246, 0.5)' }} />
                    </Avatar>
                    <Typography variant="body1" sx={{ color: 'rgba(250, 249, 246, 0.7)', fontWeight: 500 }}>
                      Henüz kimse beğenmemiş
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.5)', mt: 0.5, display: 'block' }}>
                      Herkes beğeniyor!
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 1 }}>
                    {usersToShow.map((user, idx) => (
                      <ListItem 
                        key={user?.userID ?? idx} 
                        sx={{ 
                          px: 2.5, 
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.05)'
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: 'secondary.main', 
                            width: 44, 
                            height: 44, 
                            mr: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#FAF9F6'
                          }}
                        >
                          {initialsFrom(userFullName(user))}
                        </Avatar>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#FAF9F6' }}>
                              {userFullName(user)}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.6)', mt: 0.25 }}>
                              Kullanıcı #{user?.userID ?? ''}
                            </Typography>
                          }
                        />
                        <ThumbDown sx={{ color: 'error.main', fontSize: 20 }} />
                      </ListItem>
                    ))}
                  </List>
                )
              })()}
            </DialogContent>
          </Dialog>

          {/* Yorumlar Paneli - Twitter tarzı */}
          {openComments && (
            <Box sx={{ mt: 2, overflow: 'visible', width: '100%' }}>
              {/* Yorum yaz - Twitter tarzı */}
              <Box 
                component="form" 
                onSubmit={handleAdd} 
                sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 2, 
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  pt: 1,
                  borderTop: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Yorum yaz…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '15px', md: '15px' },
                      minHeight: { xs: 40, md: 40 },
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.15)'
                      },
                      '&.Mui-focused': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained"
                  size="small" 
                  sx={{ 
                    minHeight: { xs: 40, md: 40 }, 
                    minWidth: { xs: 80, sm: 90 },
                    fontSize: { xs: '14px', md: '14px' },
                    px: { xs: 2, md: 2.5 },
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Gönder
                </Button>
              </Box>

              {/* Yorum listesi - Twitter tarzı */}
              <Box sx={{ 
                pr: { xs: 0.5, md: 0 },
                // Max-height kaldırıldı - tüm yorumlar görünsün
                overflow: 'visible'
              }}>
                {comments.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      px: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <Box
                      component="img"
                      src="/Lumo.png"
                      alt="Lumo"
                      sx={{ 
                        width: 70, 
                        height: 'auto', 
                        mb: 1.5, 
                        opacity: 0.8, 
                        mx: 'auto',
                        display: 'block',
                        filter: 'drop-shadow(0 4px 12px rgba(52,195,161,0.15))'
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9, fontSize: '14px' }}>
                    İlk yorumu sen yaz.
                  </Typography>
                  </Box>
                ) : (
                  <Stack spacing={0}>
                    {comments.map((c) => (
                      <CommentItem key={c.id} comment={c} postId={id} depth={0} />
                    ))}
                        </Stack>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}
