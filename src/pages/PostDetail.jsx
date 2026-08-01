import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Drawer, IconButton, Skeleton, Stack, TextField, Typography,
  useMediaQuery, useTheme
} from '@mui/material'
import {
  ArrowBack, ChevronRightRounded, DeleteOutline, EditOutlined, FlagOutlined,
  InfoOutlined, ReplyOutlined
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useConfirm } from '../context/ConfirmContext.jsx'
import ReactionButtons from '../components/ReactionButtons.jsx'
import {
  createComment, deleteComment, deletePost, getMyDiseaseGroups, getPost, listComments,
  reactToComment, reactToPost, removeCommentReaction, removePostReaction,
  reportComment, reportPost, updateComment, updatePost
} from '../services/api.js'

// Bir kullanıcının profiline git - kendi profilinse (App.jsx'te UserProfile
// zaten /profile'a yönlendiriyor ama burada da direkt /profile'a göndermek
// gereksiz bir ara sayfa atlamasını önler) tam yetkili /profile'a, başkası
// için herkese açık /users/:id sayfasına.
function goToUserProfile(navigate, currentUser, targetUserId) {
  if (!targetUserId) return
  if (currentUser && String(currentUser.id) === String(targetUserId)) {
    navigate('/profile')
  } else {
    navigate(`/users/${targetUserId}`)
  }
}

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

// Yorum satırı yüklenirken gösterilen iskelet - CommentRow'un avatar+metin
// yerleşimini taklit eder, boş ekran yerine sayfanın taslağını gösterir.
function CommentRowSkeleton() {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="30%" sx={{ fontSize: '0.875rem' }} />
          <Skeleton variant="text" width="90%" sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width="60%" />
        </Box>
      </Stack>
    </Box>
  )
}

function canManage(user, authorId) {
  if (!user) return false
  return user.id === authorId || user.role === 'ADMIN'
}

// --- Yorum ağacı yardımcıları ---
// listByPost sadece üst-seviye yorumları sayfalar; her yorumun (ve onun
// yanıtlarının, sınırsız derinlikte) tamamı kendi `replies` alanında gömülü
// gelir (bkz. backend CommentResponse.buildTree). Bu yüzden ağaç üzerinde
// güncelleme/ekleme yaparken de recursive gezinmemiz gerekiyor.

function updateCommentInTree(comments, updated) {
  return comments.map(c => {
    if (c.id === updated.id) return { ...c, ...updated }
    if (c.replies?.length) return { ...c, replies: updateCommentInTree(c.replies, updated) }
    return c
  })
}

// Not: yorum silme artık backend'de soft delete (bkz. CommentServiceImpl.delete) -
// satır kaybolmuyor, "[Bu yorum silindi]" placeholder'ına dönüşüyor ki altındaki
// yanıt zinciri kopmasın. Bu yüzden burada bir "ağaçtan çıkar" fonksiyonuna
// gerek yok, silme de updateCommentInTree ile işleniyor.

function addReplyToTree(comments, reply) {
  const parentId = reply.parentCommentId
  return comments.map(c => {
    if (c.id === parentId) return { ...c, replies: [...(c.replies || []), reply] }
    if (c.replies?.length) return { ...c, replies: addReplyToTree(c.replies, reply) }
    return c
  })
}

// Yanıt zincirlerini iç içe kutular halinde göstermek (Reddit tarzı) -
// sabit bir girinti değeri kullansak bile her seviye kendi ebeveyninin
// İÇİNDE render edildiği için girintiler birbirine binip yine "merdiven"
// oluşturuyordu. Bunun yerine X/Twitter'ın gerçek deseni uygulandı: bir
// yorumun yanıtlarını görmek için o yoruma TIKLANIR, o yorum üstte "post
// gibi" sabitlenir ve doğrudan yanıtları altında DÜZ (iç içe olmayan) bir
// liste halinde gösterilir - bkz. PostDetail'deki threadPath state'i.
// Yapısal derinlik (backend'de) sınırsız kalmaya devam ediyor, sadece aynı
// anda ekranda hiçbir zaman ikiden fazla seviye render edilmiyor.
function findCommentById(list, id) {
  for (const c of list) {
    if (c.id === id) return c
    if (c.replies?.length) {
      const found = findCommentById(c.replies, id)
      if (found) return found
    }
  }
  return null
}

// Şikayet için ortak dialog: post ya da yorum, tek bir bileşenle karşılanıyor.
function ReportDialog({ open, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('')

  const handleClose = () => {
    if (submitting) return
    setReason('')
    onClose()
  }

  const handleSubmit = async () => {
    await onSubmit(reason.trim() || null)
    setReason('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>İçeriği Şikayet Et</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Bu içeriği neden şikayet ettiğinizi kısaca belirtebilirsiniz (opsiyonel).
        </DialogContentText>
        <TextField
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Örn. uygunsuz içerik, yanlış bilgi..."
          multiline
          minRows={2}
          fullWidth
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>Vazgeç</Button>
        <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={16} color="inherit" /> : 'Şikayet Et'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function CommentRow({
  comment, isReply = false, user, token, canReply, onUpdated, onReplySubmitted, onReport, onAuthorClick,
  onOpenThread, showError, showSuccess
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const confirm = useConfirm()
  const theme = useTheme()
  // Mobilde satır içi yanıt kutusu, üstteki/alttaki yorumları aşağı itip
  // parmakla ulaşması zor bir alana taşıyordu - alttan açılan bir Drawer,
  // klavyeyle birlikte ekranın en erişilebilir bölgesinde kalıyor.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const isDeleted = !!comment.deleted
  const manageable = !isDeleted && canManage(user, comment.authorId)
  const isOwnComment = user?.id === comment.authorId

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
    if (!(await confirm('Bu yorumu silmek istiyor musun?', { title: 'Yorumu sil' }))) return
    setDeleting(true)
    try {
      await deleteComment(token, comment.id)
      // Backend soft delete yapıyor (satır kalıyor, içerik placeholder'a
      // dönüyor) ki altındaki yanıt zinciri kopmasın - aynısını burada da
      // uyguluyoruz, ağaçtan çıkarmıyoruz.
      onUpdated({ ...comment, deleted: true, content: '[Bu yorum silindi]' })
      showSuccess('Yorum silindi.')
    } catch (err) {
      showError(err.message || 'Yorum silinemedi.')
    } finally {
      setDeleting(false)
    }
  }

  const submitReply = async () => {
    if (!replyText.trim()) { showError('Yanıt boş olamaz.'); return }
    setReplySubmitting(true)
    try {
      await onReplySubmitted(comment.id, replyText.trim())
      setReplyText('')
      setReplyOpen(false)
      // Az önce eklediği yanıtı hemen görsün diye - bu yorumun thread
      // görünümünü açıyoruz (zaten açıksa no-op), "N yanıtı görüntüle"
      // arkasında saklı kalıp kafa karıştırmasın.
      onOpenThread(comment)
      showSuccess('Yanıt eklendi.')
    } catch (err) {
      showError(err.message || 'Yanıt eklenemedi.')
    } finally {
      setReplySubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        // Instagram'ın yorum satırları borderless - burada da üst seviye
        // yorum düz zemin üstünde duruyor, sadece yanıtlar (isReply) hafif
        // bir zemin farkı + sol vurgu çizgisiyle ayrışıyor (hangi yorumun
        // altına yazıldığı belli olsun diye - bu kısım IG'de yok ama
        // hiyerarşi netliği için tutuldu).
        bgcolor: isReply ? 'action.hover' : 'transparent',
        // Yanıtlar tek bir sabit girinti alıyor - bu satır hiçbir zaman
        // kendi içinde bir yanıt render etmiyor (bkz. thread-drill
        // navigasyonu), o yüzden girinti asla üst üste binip büyüyemiyor.
        ...(isReply
          ? { ml: { xs: 1.5, sm: 2.5 }, borderLeft: '2px solid', borderLeftColor: 'primary.main' }
          : {})
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Avatar
          onClick={!isDeleted ? () => onAuthorClick(comment.authorId) : undefined}
          sx={{
            width: 32, height: 32, fontSize: 13,
            fontWeight: 700, flexShrink: 0,
            cursor: isDeleted ? 'default' : 'pointer'
          }}
        >
          {initialsFrom(comment.authorName || '')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row" spacing={1} alignItems="center" justifyContent="space-between"
            flexWrap="wrap" useFlexGap
          >
            <Box>
              <Typography
                variant="subtitle2"
                onClick={!isDeleted ? () => onAuthorClick(comment.authorId) : undefined}
                sx={{
                  fontWeight: 600, display: 'inline-block',
                  cursor: isDeleted ? 'default' : 'pointer',
                  '&:hover': isDeleted ? {} : { textDecoration: 'underline' }
                }}
              >
                {comment.authorName || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('tr-TR') : ''}
              </Typography>
            </Box>
            {!editing && !isDeleted && (
              <Stack direction="row" spacing={0.5} flexShrink={0}>
                {manageable && (
                  <>
                    <IconButton size="small" onClick={() => { setText(comment.content); setEditing(true) }}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={remove} disabled={deleting}>
                      {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                    </IconButton>
                  </>
                )}
                {!isOwnComment && (
                  <IconButton size="small" onClick={() => onReport(comment.id)} title="Şikayet Et">
                    <FlagOutlined fontSize="small" />
                  </IconButton>
                )}
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
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" onClick={saveEdit} disabled={saving}>
                  {saving ? <CircularProgress size={14} color="inherit" /> : 'Kaydet'}
                </Button>
                <Button size="small" onClick={() => setEditing(false)} disabled={saving}>İptal</Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5, whiteSpace: 'pre-line', wordBreak: 'break-word',
                  ...(isDeleted ? { fontStyle: 'italic', color: 'text.secondary' } : {})
                }}
              >
                {comment.content}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                <ReactionButtons
                  helpfulCount={comment.helpfulCount}
                  notHelpfulCount={comment.notHelpfulCount}
                  myReaction={comment.myReaction}
                  onReact={(value) => reactToComment(token, comment.id, value)}
                  onRemove={() => removeCommentReaction(token, comment.id)}
                />
                {canReply && (
                  <Button
                    size="small"
                    startIcon={<ReplyOutlined fontSize="small" />}
                    onClick={() => setReplyOpen(o => !o)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Yanıtla
                  </Button>
                )}
              </Stack>
            </>
          )}

          {replyOpen && !isMobile && (
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <TextField
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`${comment.authorName || 'Kullanıcı'} kişisine yanıt yaz...`}
                multiline
                minRows={2}
                fullWidth
                size="small"
                autoFocus
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" onClick={submitReply} disabled={replySubmitting}>
                  {replySubmitting ? <CircularProgress size={14} color="inherit" /> : 'Yanıtla'}
                </Button>
                <Button size="small" onClick={() => setReplyOpen(false)} disabled={replySubmitting}>İptal</Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>

      {isMobile && (
        <Drawer
          anchor="bottom"
          open={replyOpen}
          onClose={() => { if (!replySubmitting) setReplyOpen(false) }}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                p: 2,
                pb: 'calc(16px + env(safe-area-inset-bottom, 0px))'
              }
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            {comment.authorName || 'Kullanıcı'} kişisine yanıt yaz
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Yanıtını yaz..."
              multiline
              minRows={3}
              fullWidth
              size="small"
              autoFocus={replyOpen}
            />
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" onClick={submitReply} disabled={replySubmitting} sx={{ minHeight: 44 }}>
                {replySubmitting ? <CircularProgress size={16} color="inherit" /> : 'Yanıtla'}
              </Button>
              <Button fullWidth onClick={() => setReplyOpen(false)} disabled={replySubmitting} sx={{ minHeight: 44 }}>
                İptal
              </Button>
            </Stack>
          </Stack>
        </Drawer>
      )}

      {comment.replies?.length > 0 && (
        <Button
          size="small"
          onClick={() => onOpenThread(comment)}
          endIcon={<ChevronRightRounded fontSize="small" />}
          sx={{ color: 'primary.main', fontWeight: 600, pl: 0.5, mt: 1.5 }}
        >
          {comment.replies.length} yanıtı görüntüle
        </Button>
      )}
    </Box>
  )
}

export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [last, setLast] = useState(true)
  // X tarzı thread-drill: bir yoruma tıklanınca id'si buraya eklenir, o
  // yorum "odak" olur (üstte sabitlenir), doğrudan yanıtları altında düz
  // bir liste halinde gösterilir - bkz. yukarıdaki findCommentById.
  const [threadPath, setThreadPath] = useState([])

  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [savingPost, setSavingPost] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)

  // { open, type: 'post' | 'comment', targetId }
  const [reportTarget, setReportTarget] = useState({ open: false, type: null, targetId: null })
  const [reportSubmitting, setReportSubmitting] = useState(false)

  // Backend, bir hastalık grubuna üye olmayan kullanıcının o gruba ait
  // postlara yorum yapmasını reddediyor (bkz. CommentServiceImpl.
  // assertMemberOfGroup). Bunu önceden bilmeden yorum kutusunu göstermek,
  // kullanıcının yazıp gönder deyince "yetkin yok" hatası almasına yol
  // açıyordu - şimdi üyelik önceden kontrol edilip kutu hiç gösterilmiyor.
  const [myGroupIds, setMyGroupIds] = useState(null) // null = henüz bilinmiyor
  useEffect(() => {
    if (!token) return
    let mounted = true
    getMyDiseaseGroups(token)
      .then(groups => { if (mounted) setMyGroupIds(new Set((Array.isArray(groups) ? groups : []).map(g => g.id))) })
      .catch(() => { if (mounted) setMyGroupIds(new Set()) })
    return () => { mounted = false }
  }, [token])

  const goToProfile = useCallback((authorId) => goToUserProfile(navigate, user, authorId), [navigate, user])

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
    setPage(0)
    setThreadPath([])
    listComments(token, postId, { page: 0 })
      .then(res => {
        setComments(Array.isArray(res?.content) ? res.content : [])
        setLast(res?.last ?? true)
      })
      .catch(err => showError(err.message || 'Yorumlar alınamadı.'))
      .finally(() => setCommentsLoading(false))
  }, [token, postId, showError])

  // Bir yorumun thread'ini aç (o yorum "odak" olur) - zaten odaktaysa
  // tekrar eklemiyoruz ki geri butonu tek tıkla üst seviyeye dönsün.
  const openThread = useCallback((comment) => {
    setThreadPath(prev => (prev[prev.length - 1] === comment.id ? prev : [...prev, comment.id]))
  }, [])
  const goBackThread = () => setThreadPath(prev => prev.slice(0, -1))

  // Sayfa numaralı gezinme yerine mevcut listeye ekleyen "Daha Fazla Yükle" -
  // mobilde tek elle kullanım daha kolay, kullanıcı okuduğu yeri kaybetmiyor.
  const loadMoreComments = async () => {
    const nextPage = page + 1
    setCommentsLoadingMore(true)
    try {
      const res = await listComments(token, postId, { page: nextPage })
      setComments(prev => [...prev, ...(Array.isArray(res?.content) ? res.content : [])])
      setLast(res?.last ?? true)
      setPage(nextPage)
    } catch (err) {
      showError(err.message || 'Yorumlar alınamadı.')
    } finally {
      setCommentsLoadingMore(false)
    }
  }

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
      loadComments()
    } catch (err) {
      showError(err.message || 'Yorum eklenemedi.')
    } finally {
      setPostingComment(false)
    }
  }

  const submitReply = async (parentCommentId, content) => {
    const reply = await createComment(token, postId, content, parentCommentId)
    setComments(prev => addReplyToTree(prev, reply))
  }

  const saveCommentUpdate = (updated) => {
    setComments(prev => updateCommentInTree(prev, updated))
  }

  const openReportDialog = (type, targetId) => setReportTarget({ open: true, type, targetId })
  const closeReportDialog = () => setReportTarget({ open: false, type: null, targetId: null })

  const submitReport = async (reason) => {
    setReportSubmitting(true)
    try {
      if (reportTarget.type === 'post') {
        await reportPost(token, reportTarget.targetId, reason)
      } else {
        await reportComment(token, reportTarget.targetId, reason)
      }
      showSuccess('Şikayetiniz alındı, teşekkür ederiz.')
      closeReportDialog()
    } catch (err) {
      showError(err.message || 'Şikayet gönderilemedi.')
    } finally {
      setReportSubmitting(false)
    }
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
    if (!(await confirm('Bu gönderiyi silmek istiyor musun?', { title: 'Gönderiyi sil' }))) return
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
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2,
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="35%" sx={{ fontSize: '0.875rem' }} />
              <Skeleton variant="text" width="20%" sx={{ fontSize: '0.75rem' }} />
            </Box>
          </Stack>
          <Skeleton variant="text" width="55%" sx={{ fontSize: '1.5rem', mb: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </Box>
        <Stack spacing={1.5}>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
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
  const isOwnPost = user?.id === post.authorId
  const edited = !!(post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt)
  // Üyelik henüz yükleniyorsa (myGroupIds === null) yorum kutusunu
  // gösterip sonra "yetkin yok" hatası almasın diye şimdilik gizli tutuyoruz.
  const isMember = myGroupIds != null && myGroupIds.has(post.diseaseGroupId)
  const focusedComment = threadPath.length > 0
    ? findCommentById(comments, threadPath[threadPath.length - 1])
    : null

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

      <Alert severity="info" icon={<InfoOutlined fontSize="small" />} sx={{ mb: 2 }}>
        Bu sayfadaki paylaşımlar kullanıcı deneyimlerine dayanır, tıbbi tavsiye niteliği taşımaz.
        Sağlığınızla ilgili kararlar için mutlaka bir sağlık profesyoneline danışın.
      </Alert>

      <Box sx={{ mb: 1 }}>
      <Box sx={{ pb: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          {/* Gradyan ring avatar - bkz. PostCard.jsx, marka diliyle tutarlı */}
          <Box
            onClick={() => goToProfile(post.authorId)}
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
              background: 'linear-gradient(135deg, #4CB89F 0%, #E08B6D 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', p: '2.5px'
            }}
          >
            <Avatar
              sx={{
                width: '100%', height: '100%', fontWeight: 700,
                border: '2px solid', borderColor: 'background.default'
              }}
            >
              {initialsFrom(post.authorName || '')}
            </Avatar>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              onClick={() => goToProfile(post.authorId)}
              sx={{ fontWeight: 600, display: 'inline-block', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {post.authorName || 'Kullanıcı'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : ''}
              {edited ? ' · düzenlendi' : ''}
            </Typography>
          </Box>
          {!editingPost && (
            <Stack direction="row" spacing={0.5}>
              {manageable && (
                <>
                  <IconButton size="small" onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditingPost(true) }}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={removePost} disabled={deletingPost}>
                    {deletingPost ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                  </IconButton>
                </>
              )}
              {!isOwnPost && (
                <IconButton size="small" onClick={() => openReportDialog('post', post.id)} title="Şikayet Et">
                  <FlagOutlined fontSize="small" />
                </IconButton>
              )}
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
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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

      {/* X/Facebook tarzı: aksiyon çubuğu içerikten bir bölücüyle ayrılıp
          kartın tam genişliğine yayılıyor, salt "içeriğin altında duran bir
          buton grubu" değil de belirgin bir aksiyon alanı hissi veriyor. */}
      {!editingPost && (
        <>
          <Divider />
          <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 1 }}>
            <ReactionButtons
              helpfulCount={post.helpfulCount}
              notHelpfulCount={post.notHelpfulCount}
              myReaction={post.myReaction}
              onReact={(value) => reactToPost(token, post.id, value)}
              onRemove={() => removePostReaction(token, post.id)}
              size="medium"
            />
          </Box>
        </>
      )}
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        {focusedComment ? 'Yanıtlar' : 'Yorumlar'}
      </Typography>

      {/* Bir yorumun thread'i açıkken üst-seviye yorum kutusu yerine odak
          yorumun kendi "Yanıtla" butonu kullanılıyor - hangi seviyeye yazdığı
          karışmasın diye. */}
      {!focusedComment && (
        myGroupIds != null && !isMember ? (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate(`/groups/${post.diseaseGroupId}`)}>
                Gruba Git
              </Button>
            }
          >
            Yorum yapabilmek için bu hastalık grubuna üye olmalısın.
          </Alert>
        ) : (
          <Box component="form" onSubmit={submitComment} sx={{ mb: 3 }}>
            <Stack spacing={1.5}>
              <TextField
                placeholder="Yorumunu yaz..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                disabled={!isMember}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={postingComment || !isMember}
                sx={{ alignSelf: 'flex-end' }}
              >
                {postingComment ? <CircularProgress size={16} color="inherit" /> : 'Yorum Yap'}
              </Button>
            </Stack>
          </Box>
        )
      )}

      {commentsLoading ? (
        <Stack spacing={1.5}>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
      ) : focusedComment ? (
        <Box>
          <Button
            size="small"
            onClick={goBackThread}
            startIcon={<ArrowBack fontSize="small" />}
            sx={{ color: 'text.secondary', mb: 1.5 }}
          >
            Geri
          </Button>
          <CommentRow
            comment={focusedComment}
            isReply={false}
            user={user}
            token={token}
            canReply={isMember}
            onUpdated={saveCommentUpdate}
            onReplySubmitted={submitReply}
            onReport={id => openReportDialog('comment', id)}
            onAuthorClick={goToProfile}
            onOpenThread={openThread}
            showError={showError}
            showSuccess={showSuccess}
          />
          {focusedComment.replies?.length > 0 && (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {focusedComment.replies.map(reply => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  isReply
                  user={user}
                  token={token}
                  canReply={isMember}
                  onUpdated={saveCommentUpdate}
                  onReplySubmitted={submitReply}
                  onReport={id => openReportDialog('comment', id)}
                  onAuthorClick={goToProfile}
                  onOpenThread={openThread}
                  showError={showError}
                  showSuccess={showSuccess}
                />
              ))}
            </Stack>
          )}
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
                isReply={false}
                user={user}
                token={token}
                canReply={isMember}
                onUpdated={saveCommentUpdate}
                onReplySubmitted={submitReply}
                onReport={id => openReportDialog('comment', id)}
                onAuthorClick={goToProfile}
                onOpenThread={openThread}
                showError={showError}
                showSuccess={showSuccess}
              />
            ))
          )}

          {!last && comments.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMoreComments}
                disabled={commentsLoadingMore}
                sx={{ minWidth: 180, minHeight: 44 }}
              >
                {commentsLoadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
              </Button>
            </Box>
          )}
        </Stack>
      )}

      <ReportDialog
        open={reportTarget.open}
        onClose={closeReportDialog}
        onSubmit={submitReport}
        submitting={reportSubmitting}
      />
    </Box>
  )
}
