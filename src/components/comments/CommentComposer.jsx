import { Avatar, Box, CircularProgress, IconButton, Stack, TextField } from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import DictationButton from '../a11y/DictationButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { appendDictation } from '../../utils/speech.js'
import { initialsFrom } from '../../utils/format.js'
import { COMMENT_MAX_LENGTH } from './commentLimits.js'

// Gönderi altındaki yeni yorum kutusu (yazı + sesle yazma + gönder).
// onChange bir state setter'ı gibi davranır (fonksiyonel güncellemeyi de
// kabul eder): art arda gelen dikte parçaları birbirini ezmesin.
export default function CommentComposer({ value, onChange, onSubmit, submitting, disabled = false }) {
  const { user } = useAuth()
  const blocked = disabled || submitting
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}>
          {initialsFrom(`${user?.firstName || ''} ${user?.lastName || ''}`)}
        </Avatar>
        <TextField
          placeholder="Deneyimini ya da sorunu yaz…"
          value={value}
          onChange={e => onChange(e.target.value)}
          multiline
          minRows={1}
          maxRows={6}
          fullWidth
          size="small"
          disabled={disabled}
          inputProps={{ maxLength: COMMENT_MAX_LENGTH, 'aria-label': 'Yorum' }}
        />
        <DictationButton
          label="Yorumu sesle yaz"
          disabled={blocked}
          onText={(piece) => onChange(current => appendDictation(current, piece).slice(0, COMMENT_MAX_LENGTH))}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={blocked || !value.trim()}
          aria-label="Yorumu gönder"
          sx={{ flexShrink: 0, mb: 0.25, width: 44, height: 44 }}
        >
          {submitting ? <CircularProgress size={20} /> : <SendOutlined />}
        </IconButton>
      </Stack>
    </Box>
  )
}
