import { Box, Divider, FormControlLabel, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { DarkModeRounded, FormatSizeRounded, LightModeRounded, RecordVoiceOverOutlined } from '@mui/icons-material'
import { SettingsCard } from './SettingsSection.jsx'
import { useAccessibility } from '../../context/AccessibilityContext.jsx'
import { isDictationSupported, isSpeechSynthesisSupported } from '../../utils/speech.js'

function SettingLabel({ icon, children }) {
  const Icon = icon
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{children}</Typography>
    </Stack>
  )
}

// Tema, yazı boyutu, yüksek kontrast ve sesli özellikler (bu cihazda saklanır).
export default function AccessibilitySettings() {
  const {
    fontScale, highContrast, themeMode, fontScaleOptions, setFontScale, setHighContrast, setThemeMode
  } = useAccessibility()
  const voiceSupported = isDictationSupported() || isSpeechSynthesisSupported()

  return (
    <SettingsCard padded sx={{ p: 2.5 }}>
      <Stack spacing={2.5}>
        <Box>
          <SettingLabel icon={themeMode === 'light' ? LightModeRounded : DarkModeRounded}>Tema</SettingLabel>
          <ToggleButtonGroup value={themeMode} exclusive size="small" onChange={(_, v) => v && setThemeMode(v)} fullWidth aria-label="Tema">
            <ToggleButton value="dark">Koyu</ToggleButton>
            <ToggleButton value="light">Açık</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Açık zemin bazı kullanıcılar için daha rahat okunur
          </Typography>
        </Box>

        <Divider />

        <Box>
          <SettingLabel icon={FormatSizeRounded}>Yazı Boyutu</SettingLabel>
          <ToggleButtonGroup value={fontScale} exclusive size="small" onChange={(_, v) => v && setFontScale(v)} fullWidth aria-label="Yazı boyutu">
            {Object.entries(fontScaleOptions).map(([key, opt]) => (
              <ToggleButton key={key} value={key}>{opt.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider />

        <FormControlLabel
          control={<Switch checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Yüksek Kontrast</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Metin ve kenarlıkları daha belirgin hale getirir
              </Typography>
            </Box>
          }
          sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { ml: 1 } }}
        />

        <Divider />

        <Stack direction="row" spacing={1} alignItems="flex-start">
          <RecordVoiceOverOutlined sx={{ fontSize: 20, color: 'text.secondary', mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Sesle yazma ve sesli dinleme</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Gönderi ve yorum alanlarındaki mikrofon düğmesiyle konuşarak yazabilir, gönderilerdeki
              "Sesli dinle" ile metni dinleyebilirsin. Cihazının kendi Türkçe sesi kullanılır
              {voiceSupported ? '' : ' (bu tarayıcı desteklemiyor; Chrome ya da Safari\'nin güncel sürümünü dene)'}.
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </SettingsCard>
  )
}
