import { useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, Stack, TextField, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { CheckCircleRounded, ExpandLessRounded, ExpandMoreRounded, SubdirectoryArrowRightRounded, TaskAltRounded } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import ReactionButtons from '../ReactionButtons.jsx'
import SensitiveContentBanner from '../SensitiveContentBanner.jsx'
import CommentReplyComposer from './CommentReplyComposer.jsx'
import CommentActionsMenu from './CommentActionsMenu.jsx'
import { deleteComment, reactToComment, removeCommentReaction, updateComment } from '../../services/api.js'
import { initialsFrom, relativeTime } from '../../utils/format.js'
import { canManage } from '../../utils/permissions.js'
import { clickableProps } from '../../utils/clickable.js'
import { COMMENT_MAX_LENGTH } from './commentLimits.js'

// Tek bir yorum ya da yanıt satırı. Girinti/bağlantı çizgisi BURADA değil,
// PostDetail'deki thread bloğunda çizilir - bu bileşen hiçbir zaman kendi
// içinde başka bir satır render etmez (iç içe geçme tasarım gereği imkânsız).
//
// Props:
//   comment       - CommentResponse
//   isReply       - girintili blokta mı (avatar/ölçüler küçülür)
//   replyingTo    - bir başka yanıta verilmiş yanıt ise o kişinin adı
//   canReply      - kullanıcı gruba üye mi
//   thread        - { expanded, loading } (sadece replyCount > 0 ise anlamlı)
//   onToggleThread(comment), onReplySubmitted(comment, text), onUpdated(updated),
//   onReport(id), onAuthorClick(authorId)
export default function CommentRow({
  comment, isReply = false, replyingTo = null, canReply, thread,
  onUpdated, onReplySubmitted, onReport, onAuthorClick, onToggleThread,
  // Soru gönderilerinde "en iyi cevap"
  accepted = false, canAccept = false, onAccept, onUnaccept, acceptPending = false
}) {
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const confirm = useConfirm()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const isDeleted = !!comment.deleted
  const manageable = !isDeleted && canManage(user, comment.authorId)
  const isOwnComment = user?.id === comment.authorId
  const replyCount = comment.replyCount ?? 0
  const expanded = !!thread?.expanded

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
      // Backend soft delete yapıyor; yanıt zinciri kopmasın diye ağaçtan çıkarmıyoruz.
      onUpdated({ ...comment, deleted: true, content: '[Bu yorum silindi]' })
      showSuccess('Yorum silindi.')
    } catch (err) {
      showError(err.message || 'Yorum silinemedi.')
    } finally {
      setDeleting(false)
    }
  }

  const avatarSize = isReply ? 28 : 36
  const authorName = comment.authorName || 'Kullanıcı'
  const when = relativeTime(comment.createdAt)

  return (
    <Box
      id={`comment-${comment.id}`}
      sx={{
        py: isReply ? 1 : 1.5,
        scrollMarginTop: 80,
        ...(accepted ? {
          mx: { xs: -1, sm: -1.5 }, px: { xs: 1, sm: 1.5 }, borderRadius: 3,
          bgcolor: 'rgba(76,184,159,0.08)', boxShadow: 'inset 3px 0 0 #4CB89F'
        } : {}),
        // Satırlar kutusuz: hiyerarşiyi girinti ve avatar ölçüsü taşır.
      }}
    >
      <Stack direction="row" spacing={isReply ? 1.25 : 1.5} alignItems="flex-start">
        <Avatar
          {...(!isDeleted ? clickableProps(() => onAuthorClick(comment.authorId)) : {})}
          aria-label={!isDeleted ? `${authorName} profiline git` : undefined}
          sx={{
            width: avatarSize, height: avatarSize, fontSize: isReply ? 11 : 13, fontWeight: 700,
            flexShrink: 0, cursor: isDeleted ? 'default' : 'pointer', mt: '2px',
            ...(isDeleted ? { bgcolor: 'action.disabledBackground', color: 'text.disabled' } : {})
          }}
        >
          {isDeleted ? '·' : initialsFrom(authorName)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Başlık: ad · zaman — tek satır, menü sağda */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minHeight: 28 }}>
            <Typography
              component="span"
              variant="subtitle2"
              {...(!isDeleted ? clickableProps(() => onAuthorClick(comment.authorId)) : {})}
              noWrap
              sx={{
                fontWeight: 600, lineHeight: 1.3, cursor: isDeleted ? 'default' : 'pointer',
                color: isDeleted ? 'text.disabled' : 'text.primary',
                '&:hover': isDeleted ? {} : { textDecoration: 'underline' }
              }}
            >
              {isDeleted ? 'Silinmiş yorum' : authorName}
            </Typography>
            {when && (
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                · {when}
              </Typography>
            )}
            <Box sx={{ flex: 1 }} />
            {!editing && !isDeleted && (manageable || !isOwnComment) && (
              <CommentActionsMenu
                canManage={manageable}
                canReport={!isOwnComment}
                deleting={deleting}
                onEdit={() => { setText(comment.content); setEditing(true) }}
                onDelete={remove}
                onReport={() => onReport(comment.id)}
              />
            )}
          </Stack>

          {accepted && !isDeleted && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'success.main', mb: 0.25 }}>
              <CheckCircleRounded sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>En iyi cevap</Typography>
            </Stack>
          )}

          {/* Bir başka yanıta verilmiş yanıt: bağlamı küçük bir satırla göster */}
          {replyingTo && !isDeleted && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', mb: 0.25 }}>
              <SubdirectoryArrowRightRounded sx={{ fontSize: 14 }} />
              <Typography variant="caption" noWrap>{replyingTo} kişisine yanıt</Typography>
            </Stack>
          )}

          {editing ? (
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <TextField
                value={text} onChange={e => setText(e.target.value)}
                multiline minRows={2} maxRows={8} fullWidth size="small" autoFocus
                inputProps={{ maxLength: COMMENT_MAX_LENGTH, 'aria-label': 'Yorumu düzenle' }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" onClick={() => setEditing(false)} disabled={saving}>Vazgeç</Button>
                <Button size="small" variant="contained" onClick={saveEdit} disabled={saving}>
                  {saving ? <CircularProgress size={14} color="inherit" /> : 'Kaydet'}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-line', wordBreak: 'break-word', lineHeight: 1.5,
                  fontSize: isReply ? '0.9375rem' : '1rem',
                  ...(isDeleted ? { fontStyle: 'italic', color: 'text.disabled' } : {})
                }}
              >
                {isDeleted ? 'Bu yorum silindi.' : comment.content}
              </Typography>
              {!isDeleted && comment.flaggedSensitive && <SensitiveContentBanner sx={{ mt: 1, mb: 0 }} />}

              {!isDeleted && (
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.25, ml: -0.75 }}>
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
                      onClick={() => setReplyOpen(o => !o)}
                      sx={{ color: 'text.secondary', fontWeight: 600, minHeight: 36, px: 1 }}
                    >
                      Yanıtla
                    </Button>
                  )}
                  {canAccept && !isOwnComment && (
                    <Button
                      size="small"
                      onClick={() => (accepted ? onUnaccept?.() : onAccept?.(comment.id))}
                      disabled={acceptPending}
                      startIcon={acceptPending ? <CircularProgress size={12} /> : (accepted ? null : <TaskAltRounded sx={{ fontSize: '16px !important' }} />)}
                      sx={{ color: accepted ? 'text.secondary' : 'success.main', fontWeight: 700, minHeight: 36, px: 1 }}
                    >
                      {accepted ? 'Seçimi kaldır' : 'En iyi cevap'}
                    </Button>
                  )}
                </Stack>
              )}

              {replyCount > 0 && (
                <Button
                  size="small"
                  onClick={() => onToggleThread(comment)}
                  disabled={!!thread?.loading}
                  startIcon={thread?.loading
                    ? <CircularProgress size={12} />
                    : expanded ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
                  sx={{ color: 'primary.main', fontWeight: 600, minHeight: 36, px: 1, ml: -1, mt: 0.25 }}
                  aria-expanded={expanded}
                >
                  {expanded ? 'Yanıtları gizle' : `${replyCount} yanıt`}
                </Button>
              )}
            </>
          )}

          {/* Masaüstünde satır içi; mobilde alttan açılan çekmece (portal). */}
          <CommentReplyComposer
            comment={comment}
            authorName={authorName}
            isMobile={isMobile}
            open={replyOpen}
            onOpenChange={setReplyOpen}
            onSubmit={(content) => onReplySubmitted(comment, content)}
          />
        </Box>
      </Stack>
    </Box>
  )
}
