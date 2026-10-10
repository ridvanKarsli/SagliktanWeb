import { useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, Stack, TextField, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { ExpandLessRounded, ExpandMoreRounded, SubdirectoryArrowRightRounded, TaskAltRounded } from '@mui/icons-material'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { TypePill } from '../PostTypeBadges.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import ReactionButtons from '../ReactionButtons.jsx'
import SensitiveContentBanner from '../SensitiveContentBanner.jsx'
import CommentReplyComposer from './CommentReplyComposer.jsx'
import CommentActionsMenu from './CommentActionsMenu.jsx'
import { deleteComment, reactToComment, removeCommentReaction, updateComment } from '../../services/api.js'
import { relativeTime } from '../../utils/format.js'
import { canManage } from '../../utils/permissions.js'
import { clickableProps } from '../../utils/clickable.js'
import { COMMENT_MAX_LENGTH } from './commentLimits.js'
import { clampLength, cleanText, commentError, counterText, fieldErrorsFrom } from '../../utils/validation.js'
import { focusRingSx } from '../../design/focus.js'

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
  accepted = false, canAccept = false, onAccept, onUnaccept, acceptPending = false,
  // Az önce en iyi cevap seçildiyse satır bir kez yumuşakça parlar.
  celebrateId = null
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

  const [editError, setEditError] = useState(null) // { msg, value } - metin değişince kalkar
  const editUnchanged = cleanText(text) === cleanText(comment.content)
  const visibleEditError = editError && editError.value === text ? editError.msg : null

  const saveEdit = async () => {
    if (saving) return
    const problem = commentError(text)
    if (problem) { setEditError({ msg: problem, value: text }); return }
    if (editUnchanged) { setEditing(false); return }
    setSaving(true)
    try {
      const updated = await updateComment(token, comment.id, cleanText(text))
      onUpdated(updated || { ...comment, content: cleanText(text) })
      setEditing(false)
      showSuccess('Yorum güncellendi.')
    } catch (err) {
      const fieldMsg = fieldErrorsFrom(err).content
      if (fieldMsg) setEditError({ msg: fieldMsg, value: text })
      else showError(err.message || 'Yorum güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!(await confirm('Bu yorumu silmek istiyor musun?', { title: 'Yorumu sil', confirmLabel: 'Sil' }))) return
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

  const avatarSize = isReply ? 32 : 40
  const authorName = comment.authorName || 'Kullanıcı'
  const when = relativeTime(comment.createdAt)

  return (
    <Box
      id={`comment-${comment.id}`}
      className={accepted && celebrateId === comment.id ? 'sg-glow' : undefined}
      sx={{
        py: isReply ? 1 : 1.75,
        scrollMarginTop: 80,
        ...(accepted ? {
          my: 0.75, mx: { xs: -1, sm: -1.5 }, px: { xs: 1, sm: 1.5 }, borderRadius: '18px',
          bgcolor: 'brand.primarySoft'
        } : {}),
        // Satırlar kutusuz: hiyerarşiyi girinti ve avatar ölçüsü taşır.
      }}
    >
      <Stack direction="row" spacing={isReply ? 1.25 : 1.5} alignItems="flex-start">
        {isDeleted ? (
          <Avatar sx={{ width: avatarSize, height: avatarSize, flexShrink: 0, mt: '2px', bgcolor: 'action.selected', color: 'text.secondary' }}>·</Avatar>
        ) : (
          <Box
            {...clickableProps(() => onAuthorClick(comment.authorId))}
            aria-label={`${authorName} profiline git`}
            sx={{
              borderRadius: '50%', flexShrink: 0, cursor: 'pointer', mt: '2px',
              '&:focus-visible': focusRingSx
            }}
          >
            <UserAvatar avatarKey={comment.authorAvatarKey} name={authorName} size={avatarSize} />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Başlık: ad · zaman — tek satır, menü sağda */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minHeight: 28 }}>
            <Typography
              component="span"
              variant="subtitle2"
              {...(!isDeleted ? clickableProps(() => onAuthorClick(comment.authorId)) : {})}
              noWrap
              sx={{
                fontWeight: 800, lineHeight: 1.3, cursor: isDeleted ? 'default' : 'pointer',
                color: isDeleted ? 'text.secondary' : 'text.primary',
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
            <TypePill tone="solved" label="En iyi cevap" sx={{ mb: 0.75, bgcolor: 'background.paper' }} />
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
                value={text} onChange={e => setText(clampLength(e.target.value, COMMENT_MAX_LENGTH))}
                multiline minRows={2} maxRows={8} fullWidth size="small" autoFocus
                error={!!visibleEditError}
                helperText={visibleEditError || counterText(text, COMMENT_MAX_LENGTH) || undefined}
                inputProps={{ maxLength: COMMENT_MAX_LENGTH, autoCapitalize: 'sentences', 'aria-label': 'Yorumu düzenle' }}
                slotProps={{ formHelperText: { sx: { textAlign: visibleEditError ? 'left' : 'right', mr: 0 } } }}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" onClick={() => { setEditing(false); setEditError(null) }} disabled={saving}>Vazgeç</Button>
                <Button size="small" variant="contained" onClick={saveEdit} disabled={saving || editUnchanged}>
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
                  ...(isDeleted ? { fontStyle: 'italic', color: 'text.secondary' } : {})
                }}
              >
                {isDeleted ? 'Bu yorum silindi.' : comment.content}
              </Typography>
              {!isDeleted && comment.flaggedSensitive && <SensitiveContentBanner sx={{ mt: 1, mb: 0 }} />}

              {!isDeleted && (
                <Stack direction="row" spacing={0.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.25, ml: -1.25 }}>
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
                      sx={{ color: 'text.secondary', minHeight: 44, px: 1.25 }}
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
                      sx={{ color: accepted ? 'text.secondary' : 'primary.main', minHeight: 44, px: 1.25 }}
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
                  sx={{ color: 'primary.main', minHeight: 44, px: 1.25, ml: -1.25 }}
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
