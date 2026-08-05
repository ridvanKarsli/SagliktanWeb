import { useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, Drawer, IconButton, Stack, TextField, Typography,
  useMediaQuery, useTheme
} from '@mui/material'
import { ChevronRightRounded, DeleteOutline, EditOutlined, FlagOutlined, ReplyOutlined } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import ReactionButtons from '../ReactionButtons.jsx'
import { deleteComment, reactToComment, removeCommentReaction, updateComment } from '../../services/api.js'
import { initialsFrom, prettyDate } from '../../utils/format.js'
import { canManage } from '../../utils/permissions.js'

// Tek bir yorum (ya da yanıt) satırı - PostDetail.jsx'ten ayrı bir dosyaya
// taşındı (bkz. clean-code audit). token/showError/showSuccess/user artık
// prop olarak alınmıyor, doğrudan context'ten okunuyor - önceden 12 prop
// alıyordu, bu üç context değeri + user'ın kaldırılmasıyla 8'e indi.
export default function CommentRow({
  comment, isReply = false, canReply, onUpdated, onReplySubmitted, onReport, onAuthorClick, onOpenThread
}) {
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()
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
                {prettyDate(comment.createdAt) || ''}
              </Typography>
            </Box>
            {!editing && !isDeleted && (
              <Stack direction="row" spacing={0.5} flexShrink={0}>
                {manageable && (
                  <>
                    <IconButton size="small" onClick={() => { setText(comment.content); setEditing(true) }} aria-label="Düzenle">
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={remove} disabled={deleting} aria-label="Sil">
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
              {/* Yorumlar da okunacak asıl içerik - gövde ölçüsünde (body1),
                  ikincil metin ölçüsünde değil. */}
              <Typography
                variant="body1"
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

      {(comment.replyCount ?? 0) > 0 && (
        <Button
          size="small"
          onClick={() => onOpenThread(comment)}
          endIcon={<ChevronRightRounded fontSize="small" />}
          sx={{ color: 'primary.main', fontWeight: 600, pl: 0.5, mt: 1.5 }}
        >
          {comment.replyCount} yanıtı görüntüle
        </Button>
      )}
    </Box>
  )
}
