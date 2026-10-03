import { Button, CircularProgress, Stack, TextField } from '@mui/material'
import { useFormValidation } from '../../hooks/useFormValidation.js'
import {
  LIMITS, clampLength, counterText, isAtLimit, postContentError, postTitleError
} from '../../utils/validation.js'

const validate = (f) => ({ title: postTitleError(f.title), content: postContentError(f.content) })

const helperSx = (hasError, atLimit) => ({
  textAlign: hasError ? 'left' : 'right', mr: 0, color: !hasError && atLimit ? 'warning.main' : undefined
})

// Gönderinin yerinde düzenlenmesi (başlık + içerik). onSave(applyServerErrors)
// - sunucunun alan hataları ilgili alanın altında gösterilsin diye.
export default function PostEditForm({ title, onTitleChange, content, onContentChange, saving, onSave, onCancel }) {
  const v = useFormValidation({ title, content }, validate)

  const save = () => {
    if (saving || !v.validateAll()) return
    onSave(v.applyServerErrors)
  }

  return (
    <Stack spacing={2}>
      <TextField
        label="Başlık"
        value={title}
        onChange={e => onTitleChange(clampLength(e.target.value, LIMITS.TITLE_MAX))}
        {...v.field('title')}
        helperText={v.error('title') || counterText(title, LIMITS.TITLE_MAX) || undefined}
        fullWidth
        inputProps={{ maxLength: LIMITS.TITLE_MAX, autoCapitalize: 'sentences', enterKeyHint: 'next' }}
        slotProps={{ formHelperText: { sx: helperSx(!!v.error('title'), isAtLimit(title, LIMITS.TITLE_MAX)) } }}
      />
      <TextField
        label="İçerik"
        value={content}
        onChange={e => onContentChange(clampLength(e.target.value, LIMITS.CONTENT_MAX))}
        {...v.field('content')}
        helperText={v.error('content') || counterText(content, LIMITS.CONTENT_MAX) || undefined}
        fullWidth
        multiline
        minRows={4}
        inputProps={{ maxLength: LIMITS.CONTENT_MAX, autoCapitalize: 'sentences' }}
        slotProps={{ formHelperText: { sx: helperSx(!!v.error('content'), isAtLimit(content, LIMITS.CONTENT_MAX)) } }}
      />
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={save} disabled={saving}>
          {saving ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
        </Button>
        <Button onClick={onCancel} disabled={saving}>İptal</Button>
      </Stack>
    </Stack>
  )
}
