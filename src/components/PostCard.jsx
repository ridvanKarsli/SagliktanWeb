import { useState } from 'react'
import { Box, Avatar, Typography, Stack, IconButton, Tooltip, Divider, TextField, Button } from '@mui/material'
import {
  ChatBubbleOutline,
  ThumbUpOffAlt,
  ThumbDownOffAlt
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
 * PostCard artık:
 * - like/dislike (post seviyesinde)
 * - yorum paneli: yorum ekleme + yorumlarda like/dislike
 */
export default function PostCard({
  id,
  author,
  content,
  timestamp,
  likes = 0,
  dislikes = 0,
  myVote = 0,          // -1: dislike, 0: none, +1: like
  comments = [],
  onVote,              // (postId, delta) => void  delta: +1 | -1
  onAddComment,        // (postId, text) => void
  onCommentVote        // (postId, commentId, delta) => void
}) {
  const [openComments, setOpenComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const dt = new Date(timestamp)
  const toggle = () => setOpenComments(v => !v)

  const handleVote = (delta) => onVote?.(id, delta)
  const handleAdd = (e) => {
    e.preventDefault()
    const t = commentText.trim()
    if (!t) return
    onAddComment?.(id, t)
    setCommentText('')
    if (!openComments) setOpenComments(true)
  }

  return (
    <Box
      sx={{
        px: { xs: 1, md: 1.5 },
        py: 1.5,
        transition: 'background-color .15s ease',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 2 }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar aria-hidden sx={{ bgcolor: 'secondary.main', fontWeight: 800 }}>
          {initialsFrom(author)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.5, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FAF9F6' }} noWrap>
              {author}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }} noWrap>
              {dt.toLocaleString()}
            </Typography>
          </Stack>

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
          <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} alignItems="center">
            <Tooltip title={openComments ? 'Yorumları gizle' : 'Yorum yap / Yorumları göster'}>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.85)' }} onClick={toggle}>
                <ChatBubbleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', mr: 1 }}>
              {comments.length}
            </Typography>

            <Tooltip title="Beğen">
              <IconButton
                size="small"
                sx={{ color: myVote === 1 ? 'primary.main' : 'rgba(255,255,255,0.85)' }}
                onClick={() => handleVote(+1)}
              >
                <ThumbUpOffAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {likes}
            </Typography>

            <Tooltip title="Beğenme">
              <IconButton
                size="small"
                sx={{ color: myVote === -1 ? 'primary.main' : 'rgba(255,255,255,0.85)' }}
                onClick={() => handleVote(-1)}
              >
                <ThumbDownOffAlt fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {dislikes}
            </Typography>
          </Stack>

          {/* Yorumlar Paneli */}
          {openComments && (
            <Box sx={{ mt: 1.5 }}>
              {/* Yorum yaz */}
              <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Yorum yaz…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  size="small"
                />
                <Button type="submit" size="small">Gönder</Button>
              </Box>

              {/* Yorum listesi */}
              <Box sx={{ mt: 1 }}>
                {comments.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    İlk yorumu sen yaz.
                  </Typography>
                ) : (
                  comments.map((c, i) => (
                    <Box key={c.id} sx={{ py: 1 }}>
                      <Stack direction="row" spacing={1.25} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 28, height: 28 }}>
                          {initialsFrom(c.author)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="baseline">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FAF9F6' }}>
                              {c.author}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                              {new Date(c.timestamp).toLocaleString()}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)' }}>
                            {c.text}
                          </Typography>

                          {/* Yorum like/dislike */}
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                            <Tooltip title="Beğen">
                              <IconButton
                                size="small"
                                sx={{ color: c.myVote === 1 ? 'primary.main' : 'rgba(255,255,255,0.85)' }}
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
                                sx={{ color: c.myVote === -1 ? 'primary.main' : 'rgba(255,255,255,0.85)' }}
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
                  ))
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
