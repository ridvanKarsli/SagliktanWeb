import { Button, CircularProgress, Stack, TextField } from '@mui/material'

const TITLE_MAX = 255

// Gönderinin yerinde düzenlenmesi (başlık + içerik).
export default function PostEditForm({ title, onTitleChange, content, onContentChange, saving, onSave, onCancel }) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Başlık"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        fullWidth
        inputProps={{ maxLength: TITLE_MAX }}
      />
      <TextField
        label="İçerik"
        value={content}
        onChange={e => onContentChange(e.target.value)}
        fullWidth
        multiline
        minRows={4}
      />
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
        </Button>
        <Button onClick={onCancel} disabled={saving}>İptal</Button>
      </Stack>
    </Stack>
  )
}
