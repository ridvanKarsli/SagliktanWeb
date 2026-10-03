import { useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
  Stack, SwipeableDrawer, TextField, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { DeleteOutline, EditOutlined, ExpandLessRounded, ExpandMoreRounded, FlagOutlined, MoreHorizRounded, SubdirectoryArrowRightRounded } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import ReactionButtons from '../ReactionButtons.jsx'
import SensitiveContentBanner from '../SensitiveContentBanner.jsx'
import { deleteComment, reactToComment, removeCommentReaction, updateComment } from '../../services/api.js'
import { initialsFrom, relativeTime } from '../../utils/format.js'
import { canManage } from '../../utils/permissions.js'
import { clickableProps } from '../../utils/clickable.js'

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
  onUpdated, onReplySubmitted, onReport, onAuthorClick, onToggleThread
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
  const [menuAnchor, setMenuAnchor] = useState(null)
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

  const submitReply = async () => {
    if (!replyText.trim()) { showError('Yanıt boş olamaz.'); return }
    setReplySubmitting(true)
    try {
      await onReplySubmitted(comment, replyText.trim())
      setReplyText('')
      setReplyOpen(false)
      showSuccess('Yanıt eklendi.')
    } catch (err) {
      showError(err.message || 'Yanıt eklenemedi.')
    } finally {
      setReplySubmitting(false)
    }
  }

  const avatarSize = isReply ? 28 : 36
  const authorName = comment.authorName || 'Kullanıcı'
  const when = relativeTime(comment.createdAt)

  const replyComposer = (
    <Stack spacing={1.5}>
      <TextField
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        placeholder={`${authorName} kişisine yanıt yaz…`}
        multiline
        minRows={isMobile ? 3 : 2}
        maxRows={8}
        fullWidth
        size="small"
        autoFocus={replyOpen}
        inputProps={{ maxLength: 3000 }}
      />
      <Stack direction="row" spacing={1} justifyContent={isMobile ? 'stretch' : 'flex-end'}>
        <Button
          fullWidth={isMobile} size={isMobile ? 'medium' : 'small'}
          onClick={() => setReplyOpen(false)} disabled={replySubmitting}
          sx={{ minHeight: isMobile ? 44 : undefined, order: isMobile ? 1 : 0 }}
        >
          Vazgeç
        </Button>
        <Button
          fullWidth={isMobile} size={isMobile ? 'medium' : 'small'} variant="contained"
          onClick={submitReply} disabled={replySubmitting || !replyText.trim()}
          sx={{ minHeight: isMobile ? 44 : undefined, order: isMobile ? 2 : 1 }}
        >
          {replySubmitting ? <CircularProgress size={16} color="inherit" /> : 'Yanıtla'}
        </Button>
      </Stack>
    </Stack>
  )

  return (
    <Box
      sx={{
        py: isReply ? 1 : 1.5,
        // Satırlar düz zemin üstünde, kutusuz: kutu/zemin katmanları
        // "iç içe geçmiş" hissini yaratan şeydi. Hiyerarşiyi girinti ve
        // avatar ölçüsü taşıyor, kart kenarları değil.
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
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  aria-label="Yorum seçenekleri"
                  sx={{ flexShrink: 0, color: 'text.secondary', mr: -1 }}
                >
                  <MoreHorizRounded fontSize="small" />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                  {manageable && (
                    <MenuItem onClick={() => { setMenuAnchor(null); setText(comment.content); setEditing(true) }}>
                      <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
                      <ListItemText>Düzenle</ListItemText>
                    </MenuItem>
                  )}
                  {manageable && (
                    <MenuItem onClick={() => { setMenuAnchor(null); remove() }} disabled={deleting}>
                      <ListItemIcon>
                        {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>Sil</ListItemText>
                    </MenuItem>
                  )}
                  {!isOwnComment && (
                    <MenuItem onClick={() => { setMenuAnchor(null); onReport(comment.id) }}>
                      <ListItemIcon><FlagOutlined fontSize="small" /></ListItemIcon>
                      <ListItemText>Şikayet et</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Stack>

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
                inputProps={{ maxLength: 3000 }}
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

          {replyOpen && !isMobile && <Box sx={{ mt: 1.5 }}>{replyComposer}</Box>}
        </Box>
      </Stack>

      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={replyOpen}
          onOpen={() => setReplyOpen(true)}
          onClose={() => { if (!replySubmitting) setReplyOpen(false) }}
          disableSwipeToOpen
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 16, borderTopRightRadius: 16, p: 2,
                pb: 'calc(16px + env(safe-area-inset-bottom, 0px))'
              }
            }
          }}
        >
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mb: 1.5 }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{authorName} kişisine yanıt</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }} noWrap>
            “{(comment.content || '').slice(0, 80)}{(comment.content || '').length > 80 ? '…' : ''}”
          </Typography>
          {replyComposer}
        </SwipeableDrawer>
      )}
    </Box>
  )
}
