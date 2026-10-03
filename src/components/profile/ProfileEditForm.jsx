import { useState } from 'react'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import CityField from './CityField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { updateProfile } from '../../services/api.js'

const BIO_MAX = 1000

const fieldsFrom = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  bio: user?.bio || '',
  city: user?.city || '',
})

// Profil düzenleme formu (ad, soyad, şehir, hakkında). Açılışta mevcut
// kullanıcı bilgisiyle dolar; kaydedince yerel kullanıcıyı da günceller.
export default function ProfileEditForm({ onDone }) {
  const { token, user, updateLocalUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [fields, setFields] = useState(() => fieldsFrom(user))
  const [saving, setSaving] = useState(false)

  const set = (key) => (value) => setFields(f => ({ ...f, [key]: value }))
  const original = fieldsFrom(user)
  const dirty = Object.keys(fields).some(k => fields[k].trim() !== original[k])

  const save = async (e) => {
    e.preventDefault()
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      showError('Ad ve soyad zorunludur.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        firstName: fields.firstName.trim(), lastName: fields.lastName.trim(), bio: fields.bio.trim(), city: fields.city.trim()
      }
      await updateProfile(token, payload)
      updateLocalUser(payload)
      showSuccess('Profil güncellendi.')
      onDone()
    } catch (err) {
      showError(err.message || 'Profil güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box component="form" onSubmit={save} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 2 }}>Profili düzenle</Typography>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Ad" value={fields.firstName} onChange={e => set('firstName')(e.target.value)} fullWidth required autoComplete="given-name" />
          <TextField label="Soyad" value={fields.lastName} onChange={e => set('lastName')(e.target.value)} fullWidth required autoComplete="family-name" />
        </Stack>
        <CityField value={fields.city} onChange={set('city')} label="Yaşadığın şehir" />
        <TextField
          label="Hakkında"
          value={fields.bio}
          onChange={e => set('bio')(e.target.value.slice(0, BIO_MAX))}
          fullWidth multiline minRows={3} maxRows={8}
          placeholder="Kendinden, deneyimlerinden kısaca bahset (isteğe bağlı)"
          helperText={`${fields.bio.length}/${BIO_MAX}`}
          slotProps={{ htmlInput: { maxLength: BIO_MAX }, formHelperText: { sx: { textAlign: 'right', mr: 0 } } }}
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
