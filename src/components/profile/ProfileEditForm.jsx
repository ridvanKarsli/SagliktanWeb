import { useState } from 'react'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import CityField from './CityField.jsx'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { radius } from '../../design/tokens.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { updateProfile } from '../../services/api.js'
import { useFormValidation } from '../../hooks/useFormValidation.js'
import {
  LIMITS, bioError, cityError, cleanLine, cleanText, clampLength, counterText, fieldErrorsFrom, isAtLimit,
  nameError, normalizeCity
} from '../../utils/validation.js'

const fieldsFrom = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  bio: user?.bio || '',
  // Listede olmayan eski değerler ("Yurt dışı", serbest metin) boş sayılır.
  city: normalizeCity(user?.city),
})

// Sunucuya gidecek temiz hâl (kırpılmış, yalnızca boşluksa boş).
const cleaned = (f) => ({
  firstName: cleanLine(f.firstName),
  lastName: cleanLine(f.lastName),
  bio: cleanText(f.bio),
  city: normalizeCity(f.city),
})

const validate = (f) => ({
  firstName: nameError(f.firstName, 'first'),
  lastName: nameError(f.lastName, 'last'),
  city: cityError(f.city),
  bio: bioError(f.bio),
})

const nameInputProps = { maxLength: LIMITS.NAME_MAX, autoCapitalize: 'words', autoCorrect: 'off', spellCheck: false, enterKeyHint: 'next' }

// Profil düzenleme formu (yol arkadaşı, ad, soyad, şehir, hakkında). Açılışta
// mevcut kullanıcı bilgisiyle dolar; kaydedince yerel kullanıcıyı da günceller.
// onEditAvatar verilirse en üstte yol arkadaşını değiştirme satırı görünür.
export default function ProfileEditForm({ onDone, onEditAvatar }) {
  const { token, user, updateLocalUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [fields, setFields] = useState(() => fieldsFrom(user))
  const [saving, setSaving] = useState(false)
  const v = useFormValidation(fields, validate)

  const set = (key) => (value) => setFields(f => ({ ...f, [key]: value }))
  const original = cleaned(fieldsFrom(user))
  const next = cleaned(fields)
  // Eski kayıtlı şehir geçersizse (temizlendi) kaydetmeye de izin ver.
  const staleCity = !!user?.city && !normalizeCity(user.city)
  const dirty = staleCity || Object.keys(next).some(k => next[k] !== original[k])

  const save = async (e) => {
    e.preventDefault()
    if (saving || !v.validateAll()) return
    setSaving(true)
    try {
      await updateProfile(token, next)
      updateLocalUser({ ...next, city: next.city || null })
      showSuccess('Profil güncellendi.')
      onDone()
    } catch (err) {
      if (!v.applyServerErrors(fieldErrorsFrom(err))) showError(err.message || 'Profil güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const bioCounter = counterText(fields.bio, LIMITS.BIO_MAX, { always: true })

  return (
    <Box component="form" onSubmit={save} noValidate sx={{ p: { xs: 2, sm: 3 }, borderRadius: `${radius.lg}px`, bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border' }}>
      <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>Profili düzenle</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
        Burada yazdıkların profilinde görünür. Kendini ne kadar anlatacağına sen karar verirsin.
      </Typography>
      <Stack spacing={2}>
        {onEditAvatar && (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, pr: 1.5, borderRadius: `${radius.md}px`, bgcolor: 'brand.surfaceAlt' }}>
            <UserAvatar avatarKey={user?.avatarKey} name={[user?.firstName, user?.lastName].filter(Boolean).join(' ')} size={52} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" component="p">Yol arkadaşın</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                Faydalı oy aldıkça yenileri açılır.
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={onEditAvatar} aria-label="Yol arkadaşını değiştir" sx={{ minHeight: 44, flexShrink: 0 }}>
              Değiştir
            </Button>
          </Stack>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Ad" value={fields.firstName} onChange={e => set('firstName')(e.target.value)}
            {...v.field('firstName')} helperText={v.error('firstName')}
            fullWidth required autoComplete="given-name" slotProps={{ htmlInput: nameInputProps }}
          />
          <TextField
            label="Soyad" value={fields.lastName} onChange={e => set('lastName')(e.target.value)}
            {...v.field('lastName')} helperText={v.error('lastName')}
            fullWidth required autoComplete="family-name" slotProps={{ htmlInput: nameInputProps }}
          />
        </Stack>
        <CityField
          value={fields.city} onChange={set('city')} label="Yaşadığın şehir"
          {...v.field('city')} helperText={v.error('city')}
        />
        <TextField
          label="Hakkında"
          value={fields.bio}
          onChange={e => set('bio')(clampLength(e.target.value, LIMITS.BIO_MAX))}
          {...v.field('bio')}
          fullWidth multiline minRows={3} maxRows={8}
          placeholder="Kendinden, deneyimlerinden kısaca bahset (isteğe bağlı)"
          helperText={v.error('bio') || bioCounter}
          slotProps={{
            htmlInput: { maxLength: LIMITS.BIO_MAX, autoCapitalize: 'sentences' },
            formHelperText: { sx: { textAlign: 'right', mr: 0, color: isAtLimit(fields.bio, LIMITS.BIO_MAX) ? 'warning.main' : undefined } }
          }}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onDone} disabled={saving} sx={{ minHeight: 44 }}>Vazgeç</Button>
          <Button type="submit" variant="contained" disabled={saving || !dirty} sx={{ minHeight: 44, minWidth: 96 }}>
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
