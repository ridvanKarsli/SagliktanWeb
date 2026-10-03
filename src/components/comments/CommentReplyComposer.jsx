import { useState } from 'react'
import { Box, Button, CircularProgress, Stack, SwipeableDrawer, TextField, Typography } from '@mui/material'
import { useNotification } from '../../context/NotificationContext.jsx'
import { COMMENT_MAX_LENGTH } from './commentLimits.js'

function ReplyForm({ authorName, isMobile, open, submitting, text, onTextChange, onCancel, onSubmit }) {
  return (
    <Stack spacing={1.5}>
      <TextField
        value={text}
        onChange={e => onTextChange(e.target.value)}
        placeholder={`${authorName} kişisine yanıt yaz…`}
        multiline
        minRows={isMobile ? 3 : 2}
        maxRows={8}
        fullWidth
        size="small"
        autoFocus={open}
        inputProps={{ maxLength: COMMENT_MAX_LENGTH }}
      />
      <Stack direction="row" spacing={1} justifyContent={isMobile ? 'stretch' : 'flex-end'}>
        <Button
          fullWidth={isMobile} size={isMobile ? 'medium' : 'small'}
          onClick={onCancel} disabled={submitting}
          sx={{ minHeight: isMobile ? 44 : undefined, order: isMobile ? 1 : 0 }}
        >
          Vazgeç
        </Button>
        <Button
          fullWidth={isMobile} size={isMobile ? 'medium' : 'small'} variant="contained"
          onClick={onSubmit} disabled={submitting || !text.trim()}
          sx={{ minHeight: isMobile ? 44 : undefined, order: isMobile ? 2 : 1 }}
        >
          {submitting ? <CircularProgress size={16} color="inherit" /> : 'Yanıtla'}
        </Button>
      </Stack>
    </Stack>
  )
}

// Bir yoruma yanıt yazma alanı: masaüstünde yorumun altında satır içi,
// mobilde klavyeyle rahat yazılsın diye alttan açılan bir çekmecede.
// onSubmit(text) reddedilirse hata gösterilir ve yazılan metin korunur.
export default function CommentReplyComposer({ comment, authorName, isMobile, open, onOpenChange, onSubmit }) {
  const { showError, showSuccess } = useNotification()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!text.trim()) { showError('Yanıt boş olamaz.'); return }
    setSubmitting(true)
    try {
      await onSubmit(text.trim())
      setText('')
      onOpenChange(false)
      showSuccess('Yanıt eklendi.')
    } catch (err) {
      showError(err.message || 'Yanıt eklenemedi.')
    } finally {
      setSubmitting(false)
    }
  }

  const form = (
    <ReplyForm
      authorName={authorName}
      isMobile={isMobile}
      open={open}
      submitting={submitting}
      text={text}
      onTextChange={setText}
      onCancel={() => onOpenChange(false)}
      onSubmit={submit}
    />
  )

  if (!isMobile) return open ? <Box sx={{ mt: 1.5 }}>{form}</Box> : null

  const snippet = comment.content || ''
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={() => onOpenChange(true)}
      onClose={() => { if (!submitting) onOpenChange(false) }}
      disableSwipeToOpen
      // Kenardan kaydırarak açma kapalı; kapalıyken her yorum için gizli bir
      // çekmece (ve metin alanı) DOM'da tutulmasın.
      ModalProps={{ keepMounted: false }}
      slotProps={{
        paper: {
          sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, p: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))' }
        }
      }}
    >
      <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mb: 1.5 }} />
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{authorName} kişisine yanıt</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }} noWrap>
        “{snippet.slice(0, 80)}{snippet.length > 80 ? '…' : ''}”
      </Typography>
      {form}
    </SwipeableDrawer>
  )
}
