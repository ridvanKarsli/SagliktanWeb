import { Box, CircularProgress, IconButton, Stack, TextField } from '@mui/material'
import { SendRounded } from '@mui/icons-material'
import UserAvatar from '../avatars/UserAvatar.jsx'
import DictationButton from '../a11y/DictationButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { appendDictation } from '../../utils/speech.js'
import { clampLength, counterText, isBlank } from '../../utils/validation.js'
import { COMMENT_MAX_LENGTH } from './commentLimits.js'

// Gönderi altındaki yeni yorum kutusu (yazı + sesle yazma + gönder).
// onChange bir state setter'ı gibi davranır (fonksiyonel güncellemeyi de
// kabul eder): art arda gelen dikte parçaları birbirini ezmesin.
// errorText: sunucudan gelen alan hatası (metin değişince kalkar).
export default function CommentComposer({ value, onChange, onSubmit, submitting, disabled = false, errorText = null }) {
  const { user } = useAuth()
  const blocked = disabled || submitting
  const counter = counterText(value, COMMENT_MAX_LENGTH)
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mb: 1, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} useFlexGap alignItems="flex-end">
        <UserAvatar
          avatarKey={user?.avatarKey}
          name={`${user?.firstName || ''} ${user?.lastName || ''}`}
          size={40}
          sx={{ flexShrink: 0, mb: '3px', display: { xs: 'none', sm: 'flex' } }}
        />
        <TextField
          placeholder="Deneyimini ya da sorunu yaz…"
          value={value}
          onChange={e => onChange(clampLength(e.target.value, COMMENT_MAX_LENGTH))}
          multiline
          minRows={1}
          maxRows={6}
          fullWidth
          size="small"
          disabled={disabled}
          error={!!errorText}
          helperText={errorText || counter || undefined}
          inputProps={{ maxLength: COMMENT_MAX_LENGTH, 'aria-label': 'Yorum', autoCapitalize: 'sentences' }}
          slotProps={{ formHelperText: { sx: { textAlign: errorText ? 'left' : 'right', mr: 0 } } }}
          sx={{ flex: 1, minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: '22px', minHeight: 46 } }}
        />
        <DictationButton
          label="Yorumu sesle yaz"
          disabled={blocked}
          onText={(piece) => onChange(current => clampLength(appendDictation(current, piece), COMMENT_MAX_LENGTH))}
        />
        <IconButton
          type="submit"
          disabled={blocked || isBlank(value)}
          aria-label="Yorumu gönder"
          sx={{
            flexShrink: 0, mb: '1px', width: 44, height: 44, bgcolor: 'primary.main', color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark', color: 'primary.contrastText' },
            '&.Mui-disabled': { bgcolor: 'action.selected', color: 'text.secondary' }
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : <SendRounded sx={{ fontSize: 20, ml: '2px' }} />}
        </IconButton>
      </Stack>
    </Box>
  )
}
