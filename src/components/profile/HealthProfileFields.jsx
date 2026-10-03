import { Autocomplete, Box, ButtonBase, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import {
  EmojiPeopleOutlined, FavoriteBorderRounded, MedicalServicesOutlined, PersonOutlineRounded
} from '@mui/icons-material'
import { COMMUNITY_ROLES, TR_CITIES } from '../../utils/communityProfile.js'

const ROLE_ICONS = {
  PATIENT: PersonOutlineRounded,
  CAREGIVER: FavoriteBorderRounded,
  PROFESSIONAL: MedicalServicesOutlined,
  OTHER: EmojiPeopleOutlined,
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i)

// Rol seçimi: büyük, tek dokunuşla seçilen kartlar (mobilde 2x2).
export function RolePicker({ value, onChange }) {
  return (
    <Box role="radiogroup" aria-label="Toplulukta kim olarak bulunuyorsun?" sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' } }}>
      {COMMUNITY_ROLES.map(r => {
        const Icon = ROLE_ICONS[r.value]
        const selected = value === r.value
        return (
          <ButtonBase
            key={r.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? null : r.value)}
            sx={{
              flexDirection: 'column', gap: 1, p: 1.75, minHeight: 104, borderRadius: 3, textAlign: 'center',
              border: '1.5px solid', borderColor: selected ? 'primary.main' : 'divider',
              bgcolor: selected ? 'rgba(76,184,159,0.12)' : 'background.paper',
              transition: 'border-color .15s ease, background-color .15s ease',
              '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
            }}
          >
            <Icon sx={{ fontSize: 28, color: selected ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: selected ? 700 : 600, lineHeight: 1.3 }}>{r.label}</Typography>
          </ButtonBase>
        )
      })}
    </Box>
  )
}

/**
 * Tanı yılı + şehir + görünürlük. value: { communityRole, diagnosisYear, city, discoverable }.
 * Hepsi isteğe bağlı; görünürlük açılmadıkça bu bilgiler başkalarına gösterilmez.
 */
export default function HealthProfileFields({ value, onChange, showRole = false }) {
  const v = value || {}
  const set = (patch) => onChange({ ...v, ...patch })
  return (
    <Stack spacing={2.25}>
      {showRole && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Toplulukta kim olarak bulunuyorsun?</Typography>
          <RolePicker value={v.communityRole} onChange={(communityRole) => set({ communityRole })} />
        </Box>
      )}
      <TextField
        select
        label={v.communityRole === 'CAREGIVER' ? 'Yakınının tanı yılı' : 'Tanı yılı'}
        value={v.diagnosisYear || ''}
        onChange={e => set({ diagnosisYear: e.target.value ? Number(e.target.value) : null })}
        fullWidth
        helperText="Benzer süreçteki kişilerle eşleşmek için. İsteğe bağlı."
        slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } } } }}
      >
        <MenuItem value="">Belirtmek istemiyorum</MenuItem>
        {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
      </TextField>
      <Autocomplete
        freeSolo
        options={TR_CITIES}
        value={v.city || ''}
        onInputChange={(_, city) => set({ city: city.slice(0, 60) })}
        renderInput={(params) => (
          <TextField {...params} label="Şehir" helperText="Yakınındaki üyeleri bulmak için. İsteğe bağlı." />
        )}
      />
      <Box sx={{ p: 1.5, borderRadius: 3, border: '1px solid', borderColor: v.discoverable ? 'primary.main' : 'divider' }}>
        <FormControlLabel
          control={<Switch checked={!!v.discoverable} onChange={e => set({ discoverable: e.target.checked })} />}
          label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Benzer üyeler beni bulabilsin</Typography>}
          sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse', gap: 1 }}
        />
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
          Açarsan rolün, tanı yılın ve şehrin profilinde görünür; aynı gruplardaki benzer üyelere önerilirsin
          ve sen de onları görürsün. Kapalıyken bu bilgiler yalnızca sende kalır. İstediğin zaman Ayarlar'dan değiştirebilirsin.
        </Typography>
      </Box>
    </Stack>
  )
}
