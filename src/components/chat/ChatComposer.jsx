import { useRef } from 'react'
import { Box, CircularProgress, IconButton, InputBase, Stack, Typography } from '@mui/material'
import { CloseRounded, ImageOutlined, SendRounded } from '@mui/icons-material'
import { LIMITS, clampLength, counterText, isBlank } from '../../utils/validation.js'
import { radius } from '../../design/tokens.js'

// Mesaj yazma alanı: fotoğraf eki (önizleme + kaldır), metin, gönder.
// Enter gönderir, Shift+Enter yeni satır.
export default function ChatComposer({ draft, onDraftChange, attachment, onAttach, onRemoveAttachment, sending, onSubmit }) {
  const fileInputRef = useRef(null)
  const canSend = !sending && (!isBlank(draft) || attachment?.status === 'done') && (!attachment || attachment.status === 'done')
  const counter = counterText(draft, LIMITS.MESSAGE_MAX)

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ borderTop: '1px solid', borderColor: 'brand.border', px: { xs: 0.5, md: 0 }, pt: 1.25, pb: 1.25 }}>
      {attachment && (
        <Box sx={{ position: 'relative', width: 72, height: 72, borderRadius: `${radius.md}px`, overflow: 'hidden', mb: 1, ml: 6, bgcolor: 'brand.surfaceAlt' }}>
          {attachment.previewUrl && (
            <Box component="img" src={attachment.previewUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: attachment.status === 'done' ? 1 : 0.5 }} />
          )}
          {attachment.status !== 'done' && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={20} aria-label="Fotoğraf yükleniyor" />
            </Box>
          )}
          <IconButton
            onClick={onRemoveAttachment}
            aria-label="Eki kaldır"
            sx={{
              position: 'absolute', top: 0, right: 0, width: 44, height: 44,
              color: 'common.white', '&:hover': { color: 'common.white', bgcolor: 'transparent' },
            }}
          >
            <Box component="span" sx={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'text.primary', color: 'background.paper' }}>
              <CloseRounded sx={{ fontSize: 16 }} />
            </Box>
          </IconButton>
        </Box>
      )}
      <Stack direction="row" spacing={0.75} alignItems="flex-end">
        <input
          ref={fileInputRef} type="file" accept="image/*" hidden
          onChange={(e) => { onAttach(e.target.files?.[0]); e.target.value = '' }}
        />
        <IconButton onClick={() => fileInputRef.current?.click()} disabled={sending} aria-label="Fotoğraf ekle" sx={{ width: 48, height: 48, flexShrink: 0 }}>
          <ImageOutlined />
        </IconButton>
        <Box
          sx={{
            flex: 1, minWidth: 0, borderRadius: `${radius.lg}px`, bgcolor: 'brand.surfaceAlt', px: 2, py: 1.25,
            border: '2px solid transparent', transition: 'border-color 160ms ease, background-color 160ms ease',
            '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
          }}
        >
          <InputBase
            value={draft}
            onChange={(e) => onDraftChange(clampLength(e.target.value, LIMITS.MESSAGE_MAX))}
            placeholder="Bir mesaj yaz…"
            fullWidth
            multiline
            maxRows={5}
            inputProps={{ 'aria-label': 'Mesaj', maxLength: LIMITS.MESSAGE_MAX, enterKeyHint: 'send', autoCapitalize: 'sentences' }}
            sx={{ fontSize: '1.0625rem', lineHeight: 1.45, p: 0 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />
        </Box>
        <IconButton
          type="submit"
          disabled={!canSend}
          aria-label="Gönder"
          sx={{
            width: 48, height: 48, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastText' },
            '&.Mui-disabled': { bgcolor: 'action.selected', color: 'text.disabled' },
          }}
        >
          {sending ? <CircularProgress size={20} color="inherit" /> : <SendRounded sx={{ fontSize: 22, ml: 0.25 }} />}
        </IconButton>
      </Stack>
      {counter && (
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: 'text.secondary', mt: 0.5, pr: 7 }}>
          {counter}
        </Typography>
      )}
    </Box>
  )
}
