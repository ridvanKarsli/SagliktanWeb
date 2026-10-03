import { useRef, useState } from 'react'
import { Box, Button, CircularProgress, Collapse, Stack, SwipeableDrawer, TextField, Typography } from '@mui/material'
import { useNotification } from '../../context/NotificationContext.jsx'
import { clampLength, cleanText, counterText, fieldErrorsFrom, isBlank, replyError } from '../../utils/validation.js'
import { COMMENT_MAX_LENGTH } from './commentLimits.js'

function ReplyForm({ authorName, isMobile, open, submitting, text, errorText, onTextChange, onCancel, onSubmit }) {
  const counter = counterText(text, COMMENT_MAX_LENGTH)
  return (
    <Stack spacing={1.5}>
      <TextField
        value={text}
        onChange={e => onTextChange(clampLength(e.target.value, COMMENT_MAX_LENGTH))}
        placeholder={`${authorName} kişisine yanıt yaz…`}
        multiline
        minRows={isMobile ? 3 : 2}
        maxRows={8}
        fullWidth
        size="small"
        autoFocus={open}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '18px' } }}
        error={!!errorText}
        helperText={errorText || counter || undefined}
        inputProps={{ maxLength: COMMENT_MAX_LENGTH, autoCapitalize: 'sentences', 'aria-label': `${authorName} kişisine yanıt` }}
        slotProps={{ formHelperText: { sx: { textAlign: errorText ? 'left' : 'right', mr: 0 } } }}
      />
      <Stack direction="row" spacing={1} justifyContent={isMobile ? 'stretch' : 'flex-end'}>
        <Button
          fullWidth={isMobile} size={isMobile ? 'medium' : 'small'}
          onClick={onCancel} disabled={submitting}
          sx={{ minHeight: 44, order: isMobile ? 1 : 0 }}
        >
          Vazgeç
        </Button>
        <Button
          fullWidth={isMobile} size={isMobile ? 'medium' : 'small'} variant="contained"
          onClick={onSubmit} disabled={submitting || isBlank(text)}
          sx={{ minHeight: 44, order: isMobile ? 2 : 1 }}
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
  const [serverError, setServerError] = useState(null) // { msg, value }
  const submittingRef = useRef(false)

  const submit = async () => {
    if (submittingRef.current) return // çift dokunuş aynı yanıtı iki kez eklemesin
    const problem = replyError(text)
    if (problem) { showError(problem); return }
    submittingRef.current = true
    setSubmitting(true)
    setServerError(null)
    try {
      await onSubmit(cleanText(text))
      setText('')
      onOpenChange(false)
      showSuccess('Yanıt eklendi.')
    } catch (err) {
      const fieldMsg = fieldErrorsFrom(err).content
      if (fieldMsg) setServerError({ msg: fieldMsg, value: text })
      else showError(err.message || 'Yanıt eklenemedi.')
    } finally {
      submittingRef.current = false
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
      errorText={serverError && serverError.value === text ? serverError.msg : null}
      onTextChange={setText}
      onCancel={() => onOpenChange(false)}
      onSubmit={submit}
    />
  )

  // Masaüstünde satır içi alan yumuşakça açılır.
  if (!isMobile) {
    return (
      <Collapse in={open} timeout={220} unmountOnExit>
        <Box sx={{ mt: 1, mb: 0.5 }}>{form}</Box>
      </Collapse>
    )
  }

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
          sx: { borderTopLeftRadius: 28, borderTopRightRadius: 28, p: 2.5, pt: 1.5, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))' }
        }
      }}
    >
      <Box aria-hidden sx={{ width: 40, height: 5, borderRadius: 999, bgcolor: 'brand.borderStrong', mx: 'auto', mb: 2 }} />
      <Typography variant="h6" component="h2" sx={{ fontFamily: (t) => t.typography.h5.fontFamily, fontWeight: 700, mb: 0.75 }}>
        {authorName} kişisine yanıt
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', display: 'block', mb: 1.75, pl: 1.25, borderLeft: '3px solid', borderColor: 'brand.primarySoft' }}
        noWrap
      >
        {snippet.slice(0, 80)}{snippet.length > 80 ? '…' : ''}
      </Typography>
      {form}
    </SwipeableDrawer>
  )
}
