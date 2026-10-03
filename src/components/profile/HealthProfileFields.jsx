import { Box, ButtonBase, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import {
  EmojiPeopleOutlined, FavoriteBorderRounded, MedicalServicesOutlined, PersonOutlineRounded
} from '@mui/icons-material'
import { COMMUNITY_ROLES } from '../../utils/communityProfile.js'
import CityField from './CityField.jsx'
import { currentYear, normalizeDiagnosisYear } from '../../utils/validation.js'
import { radius } from '../../design/tokens.js'

const ROLE_ICONS = {
  PATIENT: PersonOutlineRounded,
  CAREGIVER: FavoriteBorderRounded,
  PROFESSIONAL: MedicalServicesOutlined,
  OTHER: EmojiPeopleOutlined,
}

// Seçim listesinin alt ucu: backend 1900'e kadar kabul ediyor, ama listeyi
// kısa tutmak için 1930; daha eski kayıtlı (geçerli) bir değer varsa listeye eklenir.
const LIST_FLOOR = 1930
function yearOptions(selected) {
  const top = currentYear()
  const years = Array.from({ length: top - LIST_FLOOR + 1 }, (_, i) => top - i)
  if (selected && selected < LIST_FLOOR) years.push(selected)
  return years
}

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
              flexDirection: 'column', gap: 1, p: 1.75, minHeight: 112, borderRadius: `${radius.lg}px`, textAlign: 'center',
              border: '2px solid', borderColor: selected ? 'primary.main' : 'brand.border',
              bgcolor: selected ? 'brand.primarySoft' : 'background.paper',
              transition: 'border-color 200ms ease, background-color 200ms ease, transform 160ms var(--ease-spring)',
              '&:active': { transform: 'scale(0.96)' },
              '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
            }}
          >
            <Box
              key={selected ? 'on' : 'off'}
              className={selected ? 'sg-pop' : undefined}
              sx={{ width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: selected ? 'background.paper' : 'brand.surfaceAlt', color: selected ? 'primary.main' : 'text.secondary' }}
            >
              <Icon sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.3, color: selected ? 'primary.main' : 'text.primary' }}>{r.label}</Typography>
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
// validation: isteğe bağlı useFormValidation örneği - verilirse sunucu/alan
// hataları (şehir, tanı yılı) ilgili alanın altında gösterilir.
export default function HealthProfileFields({ value, onChange, showRole = false, validation }) {
  const v = value || {}
  const set = (patch) => onChange({ ...v, ...patch })
  // Aralık dışı (gelecek/çok eski) kayıtlı değer boş görünür.
  const year = normalizeDiagnosisYear(v.diagnosisYear)
  const fieldProps = (name) => (validation ? validation.field(name) : {})
  const errorText = (name) => (validation ? validation.error(name) : null)
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
        value={year || ''}
        onChange={e => set({ diagnosisYear: e.target.value ? Number(e.target.value) : null })}
        {...fieldProps('diagnosisYear')}
        fullWidth
        helperText={errorText('diagnosisYear') || 'Benzer süreçteki kişilerle eşleşmek için. İsteğe bağlı.'}
        slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } } } }}
      >
        <MenuItem value="">Belirtmek istemiyorum</MenuItem>
        {yearOptions(year).map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
      </TextField>
      <CityField
        value={v.city}
        onChange={(city) => set({ city })}
        label="Yaşadığın şehir"
        {...fieldProps('city')}
        helperText={errorText('city') || 'Profilinde görünür; yakınındaki üyeleri bulmana da yardım eder. İsteğe bağlı.'}
      />
      <Box sx={{ p: 1.75, borderRadius: `${radius.md}px`, border: '2px solid', borderColor: v.discoverable ? 'primary.main' : 'brand.border', bgcolor: v.discoverable ? 'brand.primarySoft' : 'background.paper', transition: 'background-color 200ms ease, border-color 200ms ease' }}>
        <FormControlLabel
          control={<Switch checked={!!v.discoverable} onChange={e => set({ discoverable: e.target.checked })} />}
          label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Benzer üyeler beni bulabilsin</Typography>}
          sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse', gap: 1 }}
        />
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
          Açarsan rolün ve tanı yılın profilinde görünür; aynı gruplardaki benzer üyelere önerilirsin
          ve sen de onları görürsün. Kapalıyken bu bilgiler yalnızca sende kalır. İstediğin zaman Ayarlar'dan değiştirebilirsin.
        </Typography>
      </Box>
    </Stack>
  )
}
