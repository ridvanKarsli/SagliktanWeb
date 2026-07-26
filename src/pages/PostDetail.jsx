import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, CircularProgress, IconButton, Stack, TextField, Typography
} from '@mui/material'
import { ArrowBack, DeleteOutline, EditOutlined } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import {
  createComment, deleteComment, deletePost, getPost, listComments, updateComment, updatePost
} from '../services/api.js'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

function canManage(user, authorId) {
  if (!user) return false
  return user.id === authorId || user.role === 'ADMIN'
}

function CommentRow({ comment, user, token, onUpdated, onDeleted, showError, showSuccess }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const manageable = canManage(user, comment.authorId)

  const saveEdit = async () => {
    if (!text.trim()) { showError('Yorum boş olamaz.'); return }
    setSaving(true)
    try {
      const updated = await updateComment(token, comment.id, text.trim())
      onUpdated(updated || { ...comment, content: text.trim() })
      setEditing(false)
      showSuccess('Yorum güncellendi.')
    } catch (err) {
      showError(err.message || 'Yorum güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Bu yorumu silmek istiyor musun?')) return
    setDeleting(true)
    try {
      await deleteComment(token, comment.id)
      onDeleted(comment.id)
      showSuccess('Yorum silindi.')
    } catch (err) {
      showError(err.message || 'Yorum silinemedi.')
      setDeleting(false)
    }
  }

  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {initialsFrom(comment.authorName || '')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {comment.authorName || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('tr-TR') : ''}
              </Typography>
            </Box>
            {manageable && !editing && (
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={() => { setText(comment.content); setEditing(true) }}>
                  <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={remove} disabled={deleting}>
                  {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                </IconButton>
              </Stack>
            )}
          </Stack>

          {editing ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                value={text}
                onChange={e => setText(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                size="small"
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={saveEdit} disabled={saving}>
                  {saving ? <CircularProgress size={14} color="inherit" /> : 'Kaydet'}
                </Button>
                <Button size="small" onClick={() => setEditing(false)} disabled={saving}>İptal</Button>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              {comment.content}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [last, setLast] = useState(true)

  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [savingPost, setSavingPost] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)

  const loadPost = useCallback(() => {
    if (!token || !postId) return
    setLoading(true)
    setError('')
    getPost(token, postId)
      .then(data => {
        setPost(data)
        setEditTitle(data.title)
        setEditContent(data.content)
      })
      .catch(err => setError(err.message || 'Gönderi yüklenemedi.'))
      .finally(() => setLoading(false))
  }, [token, postId])

  const loadComments = useCallback(() => {
    if (!token || !postId) return
    setCommentsLoading(true)
    listComments(token, postId, { page })
      .then(res => {
        setComments(Array.isArray(res?.content) ? res.content : [])
        setTotalPages(res?.totalPages ?? 1)
        setLast(res?.last ?? true)
      })
      .catch(err => showError(err.message || 'Yorumlar alınamadı.'))
      .finally(() => setCommentsLoading(false))
  }, [token, postId, page, showError])

  useEffect(() => { loadPost() }, [loadPost])
  useEffect(() => { loadComments() }, [loadComments])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) { showError('Yorum boş olamaz.'); return }
    setPostingComment(true)
    try {
      await createComment(token, postId, newComment.trim())
      setNewComment('')
      showSuccess('Yorum eklendi.')
      if (page === 0) loadComments()
      else setPage(0)
    } catch (err) {
      showError(err.message || 'Yorum eklenemedi.')
    } finally {
      setPostingComment(false)
    }
  }

  const saveCommentUpdate = (updated) => {
    setComments(prev => prev.map(c => (c.id === updated.id ? updated : c)))
  }
  const removeComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const savePostEdit = async () => {
    if (!editTitle.trim()) { showError('Başlık zorunludur.'); return }
    if (!editContent.trim()) { showError('İçerik zorunludur.'); return }
    setSavingPost(true)
    try {
      const updated = await updatePost(token, post.id, { title: editTitle.trim(), content: editContent.trim() })
      setPost(updated || { ...post, title: editTitle.trim(), content: editContent.trim() })
      setEditingPost(false)
      showSuccess('Gönderi güncellendi.')
    } catch (err) {
      showError(err.message || 'Gönderi güncellenemedi.')
    } finally {
      setSavingPost(false)
    }
  }

  const removePost = async () => {
    if (!window.confirm('Bu gönderiyi silmek istiyor musun?')) return
    setDeletingPost(true)
    try {
      await deletePost(token, post.id)
      showSuccess('Gönderi silindi.')
      navigate(`/sub-groups/${post.subGroupId}`)
    } catch (err) {
      showError(err.message || 'Gönderi silinemedi.')
      setDeletingPost(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (error || !post) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack />
        </IconButton>
        <Alert severity="error">{error || 'Gönderi bulunamadı.'}</Alert>
      </Box>
    )
  }

  const manageable = canManage(user, post.authorId)
  const edited = !!(post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt)

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(`/sub-groups/${post.subGroupId}`)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Alt Gruba Dön
        </Typography>
      </Stack>

      <Box
        sx={{
          p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2,
          bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, fontWeight: 700 }}>
            {initialsFrom(post.authorName || '')}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {post.authorName || 'Kullanıcı'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : ''}
              {edited ? ' · düzenlendi' : ''}
            </Typography>
          </Box>
          {manageable && !editingPost && (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditingPost(true) }}>
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={removePost} disabled={deletingPost}>
                {deletingPost ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
              </IconButton>
            </Stack>
          )}
        </Stack>

        {editingPost ? (
          <Stack spacing={2}>
            <TextField
              label="Başlık"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="İçerik"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={savePostEdit} disabled={savingPost}>
                {savingPost ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
              </Button>
              <Button onClick={() => setEditingPost(false)} disabled={savingPost}>İptal</Button>
            </Stack>
          </Stack>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, wordBreak: 'break-word' }}>
              {post.title}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word', color: 'text.primary' }}>
              {post.content}
            </Typography>
          </>
        )}
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        Yorumlar
      </Typography>

      <Box component="form" onSubmit={submitComment} sx={{ mb: 3 }}>
        <Stack spacing={1.5}>
          <TextField
            placeholder="Yorumunu yaz..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            disabled={postingComment}
            sx={{ alignSelf: 'flex-end' }}
          >
            {postingComment ? <CircularProgress size={16} color="inherit" /> : 'Yorum Yap'}
          </Button>
        </Stack>
      </Box>

      {commentsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              Henüz yorum yok. İlk yorumu sen yap!
            </Typography>
          ) : (
            comments.map(c => (
              <CommentRow
                key={c.id}
                comment={c}
                user={user}
                token={token}
                onUpdated={saveCommentUpdate}
                onDeleted={removeComment}
                showError={showError}
                showSuccess={showSuccess}
              />
            ))
          )}

          {totalPages > 1 && (
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ py: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page <= 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                Önceki
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sayfa {page + 1} / {totalPages}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={last}
                onClick={() => setPage(p => p + 1)}
              >
                Sonraki
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  )
}
