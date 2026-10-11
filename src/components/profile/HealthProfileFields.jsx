import { Box, ButtonBase, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import {
  EmojiPeopleOutlined, FavoriteBorderRounded, MedicalServicesOutlined, PersonOutlineRounded
} from '@mui/icons-material'
import { COMMUNITY_ROLES } from '../../utils/communityProfile.js'
import CityField from './CityField.jsx'
import { radius } from '../../design/tokens.js'

const ROLE_ICONS = {
  PATIENT: PersonOutlineRounded,
  CAREGIVER: FavoriteBorderRounded,
  PROFESSIONAL: MedicalServicesOutlined,
  OTHER: EmojiPeopleOutlined,
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

// "Benzer üyeler beni bulabilsin" anahtarı (kayıt formu + Ayarlar ortak).
// KVKK: varsayılan kapalı; açıklama metni neyin görüneceğini net söyler.
export function DiscoverableSwitch({ checked, onChange }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: `${radius.md}px`, border: '2px solid', borderColor: checked ? 'primary.main' : 'brand.border', bgcolor: checked ? 'brand.primarySoft' : 'background.paper', transition: 'background-color 200ms ease, border-color 200ms ease' }}>
      <FormControlLabel
        control={<Switch checked={!!checked} onChange={e => onChange(e.target.checked)} />}
        label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Benzer üyeler beni bulabilsin</Typography>}
        sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse', gap: 1 }}
      />
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
        Açarsan toplulukta kim olduğun profilinde görünür; aynı gruplardaki benzer üyelere önerilirsin
        ve sen de onları görürsün. Kapalıyken bu bilgi yalnızca sende kalır. İstediğin zaman Ayarlar'dan değiştirebilirsin.
      </Typography>
    </Box>
  )
}

/**
 * Rol (isteğe bağlı) + şehir + görünürlük. value: { communityRole, city, discoverable }.
 * Hepsi isteğe bağlı; görünürlük açılmadıkça bu bilgiler başkalarına gösterilmez.
 */
// validation: isteğe bağlı useFormValidation örneği - verilirse sunucu/alan
// hataları (şehir) ilgili alanın altında gösterilir.
export default function HealthProfileFields({ value, onChange, showRole = false, validation }) {
  const v = value || {}
  const set = (patch) => onChange({ ...v, ...patch })
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
      <CityField
        value={v.city}
        onChange={(city) => set({ city })}
        label="Yaşadığın şehir"
        {...fieldProps('city')}
        helperText={errorText('city') || 'Profilinde görünür; yakınındaki üyeleri bulmana da yardım eder. İsteğe bağlı.'}
      />
      <DiscoverableSwitch checked={!!v.discoverable} onChange={(discoverable) => set({ discoverable })} />
    </Stack>
  )
}
