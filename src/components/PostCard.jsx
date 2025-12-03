import { useState } from 'react'
import {
  Box, Avatar, Typography, Stack, IconButton, Tooltip, Divider,
  TextField, Button, Chip, List, ListItem, ListItemText, Paper, CircularProgress
} from '@mui/material'
import {
  ChatBubbleOutline,
  ThumbUpOffAlt,
  ThumbDownOffAlt,
  DeleteOutline
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

  // Callbacks
  onVote,               // (postId, delta) => void  delta: +1 | -1
  onAddComment,         // (postId, text) => void
  onCommentVote,        // (postId, commentId, delta) => void
  onDelete,             // (postId) => void
  onCommentDelete,      // 🔹 (postId, commentId) => void
  onAuthorClick         // 🔹 (authorId) => void
}) {
  const [openComments, setOpenComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  // openDetails, toggleDetails, handleDetails kaldırıldı

  const dt = new Date(timestamp)
  const toggleComments = () => setOpenComments(v => !v)
  // toggleDetails kaldırıldı

  const handleVote = (delta) => onVote?.(id, delta)

  const handleAdd = (e) => {
    e.preventDefault()
    const t = commentText.trim()
    if (!t) return
    onAddComment?.(id, t)
    setCommentText('')
    if (!openComments) setOpenComments(true)
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
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {dislikes}
            </Typography>
          </Stack>

          {/* Detaylar: Beğenen / Beğenmeyen listeleri paneli kaldırıldı */}

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
                    {comments.map((c, i) => {
                      // 🔹 Kimler silebilir? Post sahibi veya yorum sahibi (c.userID eşleşirse)
                      const canDeleteComment = !!onCommentDelete && (isOwner || (currentUserId && c.authorId && c.authorId === currentUserId))

                      return (
                        <Box key={c.id}>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 32, height: 32 }}>
                              {initialsFrom(c.author)}
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                              {/* Başlık satırı + sil butonu */}
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {c.author}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {new Date(c.timestamp).toLocaleString()}
                                  </Typography>
                                </Stack>

                                {canDeleteComment && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDeleteComment(c.id)}
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

                              {/* Yorum metni */}
                              <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.75 }}>
                                {c.text}
                              </Typography>

                              {/* Yorum like/dislike */}
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <Tooltip title="Beğen">
                                  <IconButton
                                    size="small"
                                    sx={{ color: c.myVote === 1 ? 'primary.main' : 'text.secondary', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                    onClick={() => onCommentVote?.(id, c.id, +1)}
                                  >
                                    <ThumbUpOffAlt fontSize="inherit" />
                                  </IconButton>
                                </Tooltip>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {c.likes}
                                </Typography>

                                <Tooltip title="Beğenme">
                                  <IconButton
                                    size="small"
                                    sx={{ color: c.myVote === -1 ? 'primary.main' : 'text.secondary', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                    onClick={() => onCommentVote?.(id, c.id, -1)}
                                  >
                                    <ThumbDownOffAlt fontSize="inherit" />
                                  </IconButton>
                                </Tooltip>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {c.dislikes}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          {i < comments.length - 1 && <Divider sx={{ mt: 2, opacity: 0.08 }} />}
                        </Box>
                      )
                    })}
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
