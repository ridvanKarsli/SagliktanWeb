import { Box, ButtonBase, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import {
  EmojiPeopleOutlined, FavoriteBorderRounded, MedicalServicesOutlined, PersonOutlineRounded
} from '@mui/icons-material'
import { COMMUNITY_ROLES } from '../../utils/communityProfile.js'
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

// Görünürlük anahtarı için ortak kart: başlık, açıklama, açıkken vurgulu kenarlık.
function VisibilityToggle({ checked, onChange, title, description, disabled = false, testId }) {
  return (
    <Box sx={{
      p: 1.75, borderRadius: `${radius.md}px`, border: '2px solid',
      borderColor: checked ? 'primary.main' : 'brand.border',
      bgcolor: checked ? 'brand.primarySoft' : 'background.paper',
      opacity: disabled ? 0.6 : 1,
      transition: 'background-color 200ms ease, border-color 200ms ease, opacity 200ms ease'
    }}>
      <FormControlLabel
        disabled={disabled}
        control={<Switch checked={!!checked} onChange={e => onChange(e.target.checked)} slotProps={{ input: testId ? { 'data-testid': testId } : undefined }} />}
        label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{title}</Typography>}
        sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse', gap: 1 }}
      />
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  )
}

// "Profilim üyelere açık": profil sayfası, grup üye listesi ve kişi araması.
export function ProfilePublicSwitch({ checked, onChange }) {
  return (
    <VisibilityToggle
      checked={checked}
      onChange={onChange}
      testId="profile-public-switch"
      title="Profilim üyelere açık"
      description={checked
        ? 'Üyeler profilini ve paylaşımlarını görebilir; grup üye listelerinde ve kişi aramasında görünürsün.'
        : 'Kapalıyken diğer üyeler profilinde yalnızca adını ve avatarını görür; üye listelerinde ve aramada görünmezsin. Paylaşımların kendi gruplarında görünmeye devam eder.'}
    />
  )
}

// "Benzer üyeler beni bulabilsin": yalnızca eşleşme önerileri + rolün görünmesi.
// Profil kapalıyken anlamsız olduğu için pasif ve kapalıdır.
export function DiscoverableSwitch({ checked, onChange, profilePublic = true }) {
  return (
    <VisibilityToggle
      checked={profilePublic && checked}
      onChange={onChange}
      disabled={!profilePublic}
      testId="discoverable-switch"
      title="Benzer üyeler beni bulabilsin"
      description={profilePublic
        ? 'Açarsan toplulukta kim olduğun profilinde görünür; aynı gruplardaki benzer üyelere önerilirsin ve sen de onları görürsün. İstediğin zaman Ayarlar\'dan değiştirebilirsin.'
        : 'Bunu açmak için önce profilini üyelere açman gerekiyor.'}
    />
  )
}

/**
 * Rol (isteğe bağlı) + iki görünürlük anahtarı.
 * value: { communityRole, discoverable, profilePublic }. Şehir burada yok:
 * yalnızca "Profili düzenle"den değişir.
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
      <ProfilePublicSwitch
        checked={v.profilePublic !== false}
        onChange={(profilePublic) => set(profilePublic ? { profilePublic } : { profilePublic, discoverable: false })}
      />
      <DiscoverableSwitch
        checked={!!v.discoverable}
        profilePublic={v.profilePublic !== false}
        onChange={(discoverable) => set({ discoverable })}
      />
    </Stack>
  )
}
