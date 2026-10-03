import { useRef } from 'react'
import { Box, CircularProgress, IconButton, Stack, TextField } from '@mui/material'
import { ImageOutlined, SendRounded } from '@mui/icons-material'

// Mesaj yazma alanı: fotoğraf eki (önizleme + kaldır), metin, gönder.
// Enter gönderir, Shift+Enter yeni satır.
export default function ChatComposer({ draft, onDraftChange, attachment, onAttach, onRemoveAttachment, sending, onSubmit }) {
  const fileInputRef = useRef(null)
  const canSend = !sending && (!!draft.trim() || attachment?.status === 'done') && (!attachment || attachment.status === 'done')

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ borderTop: '1px solid', borderColor: 'divider', px: { xs: 0.5, md: 0 }, py: 1.5 }}>
      {attachment && (
        <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: 2, overflow: 'hidden', mb: 1, bgcolor: 'action.hover' }}>
          {attachment.previewUrl && (
            <Box component="img" src={attachment.previewUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: attachment.status === 'done' ? 1 : 0.5 }} />
          )}
          {attachment.status !== 'done' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={18} aria-label="Fotoğraf yükleniyor" />
            </Box>
          )}
          <IconButton
            size="small" onClick={onRemoveAttachment}
            aria-label="Eki kaldır"
            sx={{
              position: 'absolute', top: { xs: -6, sm: 2 }, right: { xs: -6, sm: 2 },
              width: { xs: 44, sm: 18 }, height: { xs: 44, sm: 18 },
              fontSize: { xs: '1.05rem', sm: '0.875rem' },
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
            }}
          >
            ×
          </IconButton>
        </Box>
      )}
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <input
          ref={fileInputRef} type="file" accept="image/*" hidden
          onChange={(e) => { onAttach(e.target.files?.[0]); e.target.value = '' }}
        />
        <IconButton onClick={() => fileInputRef.current?.click()} disabled={sending} aria-label="Fotoğraf ekle">
          <ImageOutlined />
        </IconButton>
        <TextField
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Mesaj yaz..."
          fullWidth
          multiline
          maxRows={4}
          size="small"
          inputProps={{ 'aria-label': 'Mesaj' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              onSubmit(e)
            }
          }}
        />
        <IconButton type="submit" color="primary" disabled={!canSend} aria-label="Gönder">
          {sending ? <CircularProgress size={20} /> : <SendRounded />}
        </IconButton>
      </Stack>
    </Box>
  )
}
