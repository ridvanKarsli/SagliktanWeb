import { useState } from 'react'
import {
  Box, Avatar, Typography, Stack, IconButton, Tooltip, Divider,
  TextField, Button, Chip, List, ListItem, ListItemText, Paper
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
    <Box
      sx={{
        px: { xs: 1, md: 1.5 },
        py: { xs: 1, md: 1.5 },
        transition: 'background-color .15s ease',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 2 }
      }}
    >
      <Stack direction="row" spacing={{ xs: 1, md: 1.5 }} alignItems="flex-start">
        <Avatar aria-hidden sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 }, fontSize: { xs: 14, md: 16 } }}>
          {initialsFrom(author)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Üst bilgi satırı */}
          <Stack direction="row" spacing={{ xs: 0.75, md: 1 }} alignItems="baseline" sx={{ mb: 0.5, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.light', cursor: onAuthorClick && authorId ? 'pointer' : 'default' }}
              noWrap
              onClick={() => authorId && onAuthorClick?.(authorId)}
              title={author}
            >
              {author}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} noWrap>
              {dt.toLocaleString()}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {isOwner && !!onDelete && (
              <Tooltip title="Gönderiyi sil">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleDeletePost}
                    disabled={deleting}
                    aria-label="Gönderiyi sil"
                    sx={{ color: 'rgba(255,255,255,0.85)', width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>

          {/* Kategori rozeti */}
          {category && (
            <Chip
              size="small"
              label={`Kategori: ${category}`}
              variant="outlined"
              sx={{ mb: 0.75 }}
            />
          )}

          {/* İçerik */}
          <Typography
            sx={{
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.92)',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {content}
          </Typography>

          {/* Aksiyonlar */}
          <Stack direction="row" spacing={{ xs: 0.5, md: 0.75 }} sx={{ mt: 1 }} alignItems="center">
            {/* Yorumlar aç/kapa */}
            <Tooltip title={openComments ? 'Yorumları gizle' : 'Yorum yap / Yorumları göster'}>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.85)', width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }} onClick={toggleComments}>
                <ChatBubbleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', mr: 1 }}>
              {comments.length}
            </Typography>

            {/* Like */}
            <Tooltip title="Beğen">
              <IconButton
                size="small"
                sx={{ color: myVote === 1 ? 'primary.main' : 'rgba(255,255,255,0.85)', width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}
                onClick={() => handleVote(+1)}
              >
                <ThumbUpOffAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {likes}
            </Typography>

            {/* Dislike */}
            <Tooltip title="Beğenme">
              <IconButton
                size="small"
                sx={{ color: myVote === -1 ? 'primary.main' : 'rgba(255,255,255,0.85)', width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}
                onClick={() => handleVote(-1)}
              >
                <ThumbDownOffAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {dislikes}
            </Typography>
          </Stack>

          {/* Detaylar: Beğenen / Beğenmeyen listeleri paneli kaldırıldı */}

          {/* Yorumlar Paneli */}
          {openComments && (
            <Box sx={{ mt: 1.25 }}>
              {/* Yorum yaz */}
              <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: { xs: 0.75, md: 1 } }}>
                <TextField
                  fullWidth
                  placeholder="Yorum yaz…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  size="small"
                />
                <Button type="submit" size="small" sx={{ minHeight: { xs: 36, md: 40 }, minWidth: { xs: 44, md: 48 } }}>Gönder</Button>
              </Box>

              {/* Yorum listesi */}
              <Box sx={{ mt: 1 }}>
                {comments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    İlk yorumu sen yaz.
                  </Typography>
                ) : (
                  comments.map((c, i) => {
                    // 🔹 Kimler silebilir? Post sahibi veya yorum sahibi (c.userID eşleşirse)
                    const canDeleteComment = !!onCommentDelete && (isOwner || (currentUserId && c.authorId && c.authorId === currentUserId))

                    return (
                      <Box key={c.id} sx={{ py: 1 }}>
                        <Stack direction="row" spacing={{ xs: 1, md: 1.25 }} alignItems="flex-start">
                          <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 28, height: 28 }}>
                            {initialsFrom(c.author)}
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            {/* Başlık satırı + sil butonu */}
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FAF9F6' }} noWrap>
                                  {c.author}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }} noWrap>
                                  {new Date(c.timestamp).toLocaleString()}
                                </Typography>
                              </Stack>

                              {canDeleteComment && (
                                <Tooltip title="Yorumu sil">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteComment(c.id)}
                                      aria-label="Yorumu sil"
                                      sx={{ color: 'rgba(255,255,255,0.85)', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                    >
                                      <DeleteOutline fontSize="inherit" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </Stack>

                            {/* Yorum metni */}
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)', mt: 0.25 }}>
                              {c.text}
                            </Typography>

                            {/* Yorum like/dislike */}
                            <Stack direction="row" spacing={{ xs: 0.5, md: 0.75 }} alignItems="center" sx={{ mt: 0.5 }}>
                              <Tooltip title="Beğen">
                                <IconButton
                                  size="small"
                                  sx={{ color: c.myVote === 1 ? 'primary.main' : 'rgba(255,255,255,0.85)', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                  onClick={() => onCommentVote?.(id, c.id, +1)}
                                >
                                  <ThumbUpOffAlt fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                {c.likes}
                              </Typography>

                              <Tooltip title="Beğenme">
                                <IconButton
                                  size="small"
                                  sx={{ color: c.myVote === -1 ? 'primary.main' : 'rgba(255,255,255,0.85)', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                  onClick={() => onCommentVote?.(id, c.id, -1)}
                                >
                                  <ThumbDownOffAlt fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                {c.dislikes}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>

                        {i < comments.length - 1 && <Divider sx={{ mt: 1 }} />}
                      </Box>
                    )
                  })
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Stack>

      <Divider sx={{ mt: 1.5 }} />
    </Box>
  )
}
