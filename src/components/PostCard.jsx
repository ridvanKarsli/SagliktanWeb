import { useState, useEffect } from 'react'
import {
  Box, Avatar, Typography, Stack, IconButton, Tooltip, Divider,
  TextField, Button, Chip, List, ListItem, ListItemText, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
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
  onAuthorClick         // 🔹 (authorId) => void
}) {
  const [openComments, setOpenComments] = useState(false)
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
  const toggleComments = () => setOpenComments(v => !v)
  // toggleDetails kaldırıldı

  const handleVote = (delta) => onVote?.(id, delta)

  const handleAdd = (e, commentId = null) => {
    e.preventDefault()
    const t = commentText.trim()
    if (!t) return
    onAddComment?.(id, t, commentId)
    setCommentText('')
    setReplyingTo(null)
    if (!openComments) setOpenComments(true)
  }
  
  // Recursive component for nested comments
  const CommentItem = ({ comment, postId, depth = 0 }) => {
    const [replyText, setReplyText] = useState('')
    const [showReply, setShowReply] = useState(false)
    const canDeleteComment = !!onCommentDelete && (isOwner || (currentUserId && comment.authorId && comment.authorId === currentUserId))
    
    return (
      <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 1.5, pl: depth > 0 ? 2 : 0, borderLeft: depth > 0 ? '2px solid rgba(255,255,255,0.1)' : 'none' }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 32, height: 32 }}>
            {initialsFrom(comment.author)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {comment.author}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {new Date(comment.timestamp).toLocaleString()}
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
                    minWidth: { xs: 70, md: 80 },
                    height: { xs: 28, md: 32 },
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
            
            <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.75 }}>
              {comment.text}
            </Typography>
            
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
              <Tooltip title="Beğen">
                <IconButton
                  size="small"
                  sx={{ color: comment.myVote === 1 ? 'primary.main' : 'text.secondary', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                  onClick={() => onCommentVote?.(postId, comment.id, +1)}
                >
                  <ThumbUpOffAlt fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {comment.likes}
              </Typography>
              
              <Tooltip title="Beğenme">
                <IconButton
                  size="small"
                  sx={{ color: comment.myVote === -1 ? 'primary.main' : 'text.secondary', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                  onClick={() => onCommentVote?.(postId, comment.id, -1)}
                >
                  <ThumbDownOffAlt fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {comment.dislikes}
              </Typography>
              
              <Button
                size="small"
                onClick={() => setShowReply(!showReply)}
                sx={{ ml: 1, minWidth: 'auto', fontSize: '0.75rem' }}
              >
                Yanıtla
              </Button>
            </Stack>
            
            {/* Reply form */}
            {showReply && (
              <Box component="form" onSubmit={(e) => {
                e.preventDefault()
                const t = replyText.trim()
                if (!t) return
                onAddComment?.(postId, t, comment.id)
                setReplyText('')
                setShowReply(false)
              }} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Yanıt yaz…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  size="small"
                />
                <Button type="submit" size="small">Gönder</Button>
                <Button size="small" onClick={() => { setShowReply(false); setReplyText('') }}>İptal</Button>
              </Box>
            )}
            
            {/* Nested comments */}
            {comment.comments && comment.comments.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
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
    <Box sx={{ py: { xs: 2.5, md: 3 }, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="flex-start">
        <Avatar aria-hidden sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 }, fontSize: { xs: 15, md: 17 } }}>
          {initialsFrom(author)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Üst bilgi satırı */}
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1, minWidth: 0, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: 'text.primary', cursor: onAuthorClick && authorId ? 'pointer' : 'default' }}
              onClick={() => authorId && onAuthorClick?.(authorId)}
              title={author}
            >
              {author}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {dt.toLocaleString()}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {isOwner && !!onDelete && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleDeletePost}
                disabled={deleting}
                startIcon={deleting ? <CircularProgress size={14} /> : <DeleteOutline />}
                sx={{
                  minWidth: { xs: 80, md: 90 },
                  height: { xs: 32, md: 36 },
                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                  fontWeight: 600,
                  borderColor: 'rgba(244,67,54,0.5)',
                  color: 'error.main',
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
              sx={{ mb: 1.5, fontSize: '0.7rem', height: 24 }}
            />
          )}

          {/* İçerik */}
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.7,
              color: 'text.primary',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              mb: 1.5
            }}
          >
            {content}
          </Typography>

          {/* Aksiyonlar */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center" flexWrap="wrap">
            {/* Yorumlar aç/kapa */}
            <Tooltip title={openComments ? 'Yorumları gizle' : 'Yorum yap / Yorumları göster'}>
              <IconButton size="small" sx={{ color: 'text.secondary', width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 } }} onClick={toggleComments}>
                <ChatBubbleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
              {comments.length}
            </Typography>

            {/* Like */}
            <Tooltip title="Beğen">
              <IconButton
                size="small"
                sx={{ color: myVote === 1 ? 'primary.main' : 'text.secondary', width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 } }}
                onClick={() => handleVote(+1)}
              >
                <ThumbUpOffAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                cursor: likes > 0 ? 'pointer' : 'default',
                '&:hover': likes > 0 ? { textDecoration: 'underline' } : {}
              }}
              onClick={() => likes > 0 && setShowLikedDialog(true)}
            >
              {likes}
            </Typography>

            {/* Dislike */}
            <Tooltip title="Beğenme">
              <IconButton
                size="small"
                sx={{ color: myVote === -1 ? 'primary.main' : 'text.secondary', width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 } }}
                onClick={() => handleVote(-1)}
              >
                <ThumbDownOffAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                cursor: dislikes > 0 ? 'pointer' : 'default',
                '&:hover': dislikes > 0 ? { textDecoration: 'underline' } : {}
              }}
              onClick={() => dislikes > 0 && setShowDislikedDialog(true)}
            >
              {dislikes}
            </Typography>
          </Stack>

          {/* Beğenen Kişiler Dialog */}
          <Dialog 
            open={showLikedDialog} 
            onClose={() => setShowLikedDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: 'rgba(7, 20, 28, 0.98)',
                borderRadius: 2,
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
              pb: 1.5,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#FAF9F6'
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  <ThumbUp sx={{ color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#FAF9F6' }}>
                    Beğenen Kişiler
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.7)' }}>
                    {likes} kişi beğendi
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setShowLikedDialog(false)}
                sx={{ color: 'rgba(250, 249, 246, 0.7)' }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, maxHeight: '60vh', overflow: 'auto', bgcolor: 'transparent' }}>
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
            PaperProps={{
              sx: {
                bgcolor: 'rgba(7, 20, 28, 0.98)',
                borderRadius: 2,
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
              pb: 1.5,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: '#FAF9F6'
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'error.main', width: 40, height: 40 }}>
                  <ThumbDown sx={{ color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#FAF9F6' }}>
                    Beğenmeyen Kişiler
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(250, 249, 246, 0.7)' }}>
                    {dislikes} kişi beğenmedi
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setShowDislikedDialog(false)}
                sx={{ color: 'rgba(250, 249, 246, 0.7)' }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, maxHeight: '60vh', overflow: 'auto', bgcolor: 'transparent' }}>
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

          {/* Yorumlar Paneli */}
          {openComments && (
            <Box sx={{ mt: 2.5 }}>
              {/* Yorum yaz */}
              <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Yorum yaz…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  size="small"
                />
                <Button type="submit" size="small" sx={{ minHeight: { xs: 40, md: 44 }, minWidth: { xs: 64, md: 72 } }}>Gönder</Button>
              </Box>

              {/* Yorum listesi */}
              <Box>
                {comments.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 3,
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
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                      İlk yorumu sen yaz.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
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
    </Box>
  )
}
