import { useMemo, useState } from 'react'
import {
  Box, Stack, Typography, TextField, Button, Alert,
  CircularProgress, Tooltip, IconButton, Paper
} from '@mui/material'
import {
  LocalHospital, WorkHistory, Business, Place, Phone, Email, Campaign,
  Add as AddIcon, DeleteOutline as DeleteIcon
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  addSpecialization, deleteSpecialization,
  addWorkAddress, deleteWorkAddress,
  addContactInfor, deleteContact,
  addAnnouncement, deleteAnnouncement
} from '../../services/api.js'
import { Section, GlassTile, SectionList, prettyDate } from './ProfileShared.jsx'

/* ---------- FORM: Uzmanlık Ekle ---------- */
function AddSpecializationForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [exp, setExp] = useState('') // number as string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => name.trim().length > 0 && String(exp).trim() !== '', [name, exp])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return

    setLoading(true); setError(''); setSuccess('')
    try {
      const years = Number(exp)
      const payload = { nameOfSpecialization: name.trim(), specializationExperience: isNaN(years) ? 0 : years }
      const created = await addSpecialization(token, payload)

      onAdded?.({
        specializationID: created?.specializationID ?? Math.random().toString(36).slice(2),
        nameOfSpecialization: payload.nameOfSpecialization,
        specializationExperience: payload.specializationExperience,
      })
      setSuccess('Uzmanlık eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) {
      setError(err?.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit}
      sx={{
        mt: 1.5, p: 2, borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))',
        backdropFilter: 'blur(8px)',
      }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Uzmanlık Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
        <TextField fullWidth label="Uzmanlık Adı" value={name} onChange={(e) => setName(e.target.value)} size="small" required
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <TextField fullWidth label="Deneyim (yıl)" type="number" inputProps={{ min: 0, max: 60, step: 1 }}
          value={exp} onChange={(e) => setExp(e.target.value)} size="small" required
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <Button type="submit" variant="contained" disabled={!canSubmit || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} sx={{ minHeight: 44, px: 2 }}>
          Kaydet
        </Button>
      </Stack>

      {error && <Alert sx={{ mt: 1.25 }} severity="error" variant="filled">{error}</Alert>}
      {success && <Alert sx={{ mt: 1.25 }} severity="success" variant="filled">{success}</Alert>}
    </Paper>
  )
}

/* ---------- FORM: Adres Ekle ---------- */
function AddAddressForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ workPlaceName: '', street: '', city: '', county: '', country: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => form.workPlaceName.trim().length > 0, [form.workPlaceName])
  function updateField(key) { return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return

    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = {
        workPlaceName: form.workPlaceName.trim(),
        street: form.street || '', city: form.city || '', county: form.county || '', country: form.country || ''
      }
      const created = await addWorkAddress(token, payload)
      onAdded?.({ addressID: created?.addressID ?? created?.adressID ?? Math.random().toString(36).slice(2), ...payload })
      setSuccess('Adres eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) { setError(err?.message || 'Kayıt sırasında bir hata oluştu.') }
    finally { setLoading(false) }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit}
      sx={{ mt: 1.5, p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.14)',
            background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))', backdropFilter: 'blur(8px)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Adres Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
        <TextField fullWidth label="İş Yeri" value={form.workPlaceName} onChange={updateField('workPlaceName')} size="small" required
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <TextField fullWidth label="Sokak/Cadde" value={form.street} onChange={updateField('street')} size="small"
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch" sx={{ mt: 1 }}>
        <TextField fullWidth label="İlçe" value={form.county} onChange={updateField('county')} size="small"
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <TextField fullWidth label="Şehir" value={form.city} onChange={updateField('city')} size="small"
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <TextField fullWidth label="Ülke" value={form.country} onChange={updateField('country')} size="small"
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
      </Stack>

      <Button type="submit" variant="contained" disabled={!canSubmit || loading}
        startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} sx={{ minHeight: 44, px: 2, mt: 1.25 }}>
        Kaydet
      </Button>

      {error && <Alert sx={{ mt: 1.25 }} severity="error" variant="filled">{error}</Alert>}
      {success && <Alert sx={{ mt: 1.25 }} severity="success" variant="filled">{success}</Alert>}
    </Paper>
  )
}

/* ---------- FORM: İletişim Ekle ---------- */
function AddContactForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ email: '', phoneNumber: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => form.email.trim().length > 0 && form.phoneNumber.trim().length > 0, [form])
  function updateField(key) { return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = { email: form.email.trim(), phoneNumber: form.phoneNumber.trim() }
      const created = await addContactInfor(token, payload)
      onAdded?.({ contactID: created?.contactID ?? Math.random().toString(36).slice(2), ...payload })
      setSuccess('İletişim eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) { setError(err?.message || 'Kayıt sırasında bir hata oluştu.') }
    finally { setLoading(false) }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit}
      sx={{ mt: 1.5, p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.14)',
            background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))', backdropFilter: 'blur(8px)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>İletişim Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
        <TextField fullWidth label="E-posta" value={form.email} onChange={updateField('email')} size="small" required type="email"
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <TextField fullWidth label="Telefon" value={form.phoneNumber} onChange={updateField('phoneNumber')} size="small" required
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <Button type="submit" variant="contained" disabled={!canSubmit || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} sx={{ minHeight: 44, px: 2 }}>
          Kaydet
        </Button>
      </Stack>

      {error && <Alert sx={{ mt: 1.25 }} severity="error" variant="filled">{error}</Alert>}
      {success && <Alert sx={{ mt: 1.25 }} severity="success" variant="filled">{success}</Alert>}
    </Paper>
  )
}

/* ---------- FORM: Duyuru Ekle ---------- */
function AddAnnouncementForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ title: '', content: '', uploadDate: '' }) // YYYY-MM-DD
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(
    () => form.title.trim().length > 0 && form.content.trim().length > 0 && form.uploadDate.trim().length > 0,
    [form]
  )
  function updateField(key) { return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        uploadDate: form.uploadDate // "YYYY-MM-DD"
      }
      const created = await addAnnouncement(token, payload)
      onAdded?.({
        announcementID: created?.announcementID ?? Math.random().toString(36).slice(2),
        ...payload
      })
      setSuccess('Duyuru eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) { setError(err?.message || 'Kayıt sırasında bir hata oluştu.') }
    finally { setLoading(false) }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit}
      sx={{ mt: 1.5, p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.14)',
            background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))', backdropFilter: 'blur(8px)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Duyuru Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack spacing={1}>
        <TextField fullWidth label="Başlık" value={form.title} onChange={updateField('title')} size="small" required
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <TextField fullWidth multiline minRows={3} label="İçerik" value={form.content} onChange={updateField('content')} size="small" required
          sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField fullWidth label="Tarih" type="date" value={form.uploadDate} onChange={updateField('uploadDate')}
            InputLabelProps={{ shrink: true }} size="small" required
            sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                  '& .MuiInputBase-input': { color: '#FAF9F6' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }}}/>
          <Button type="submit" variant="contained" disabled={!canSubmit || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} sx={{ minHeight: 44, px: 2 }}>
            Kaydet
          </Button>
        </Stack>
      </Stack>

      {error && <Alert sx={{ mt: 1.25 }} severity="error" variant="filled">{error}</Alert>}
      {success && <Alert sx={{ mt: 1.25 }} severity="success" variant="filled">{success}</Alert>}
    </Paper>
  )
}

/* ---------- Ana Bileşen ---------- */
export default function DoctorPart({ doctorData, sectionKey, canEdit = true }) {
  const { token } = useAuth()
  if (!doctorData) return null

  // Local state: ekleme/silme sonrası UI anında güncellensin
  const [specItems, setSpecItems] = useState(
    Array.isArray(doctorData?.specialization) ? doctorData.specialization : []
  )
  const [openSpecForm, setOpenSpecForm] = useState(false)
  const [delSpecErr, setDelSpecErr] = useState('')
  const [delSpecLoadingId, setDelSpecLoadingId] = useState(null)

  const [addrItems, setAddrItems] = useState(
    Array.isArray(doctorData?.worksAddress) ? doctorData.worksAddress : []
  )
  const [openAddrForm, setOpenAddrForm] = useState(false)
  const [delAddrErr, setDelAddrErr] = useState('')
  const [delAddrLoadingId, setDelAddrLoadingId] = useState(null)

  const [contactItems, setContactItems] = useState(
    Array.isArray(doctorData?.contactInfor) ? doctorData.contactInfor : []
  )
  const [openContactForm, setOpenContactForm] = useState(false)
  const [delContactErr, setDelContactErr] = useState('')
  const [delContactLoadingId, setDelContactLoadingId] = useState(null)

  const [annItems, setAnnItems] = useState(
    Array.isArray(doctorData?.announcement) ? doctorData.announcement : []
  )
  const [openAnnForm, setOpenAnnForm] = useState(false)
  const [delAnnErr, setDelAnnErr] = useState('')
  const [delAnnLoadingId, setDelAnnLoadingId] = useState(null)

  // --- DELETE handlers ---
  async function deleteSpecById(item) {
    setDelSpecErr('')
    const id = item?.specializationID
    if (!id) { setDelSpecErr('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.nameOfSpecialization ?? 'Uzmanlık'}" silinsin mi?`)) return
    try {
      setDelSpecLoadingId(id)
      await deleteSpecialization(token, id)
      setSpecItems(prev => prev.filter(x => (x?.specializationID ?? x?.id) !== id))
    } catch (e) { setDelSpecErr(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelSpecLoadingId(null) }
  }

  async function deleteAddrById(item) {
    setDelAddrErr('')
    const id = item?.addressID ?? item?.adressID
    if (!id) { setDelAddrErr('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.workPlaceName ?? 'Adres'}" silinsin mi?`)) return
    try {
      setDelAddrLoadingId(id)
      await deleteWorkAddress(token, id)
      setAddrItems(prev => prev.filter(x => (x?.addressID ?? x?.adressID) !== id))
    } catch (e) { setDelAddrErr(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelAddrLoadingId(null) }
  }

  async function deleteContactById(item) {
    setDelContactErr('')
    const id = item?.contactID
    if (!id) { setDelContactErr('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.email ?? item?.phoneNumber ?? 'İletişim'}" silinsin mi?`)) return
    try {
      setDelContactLoadingId(id)
      await deleteContact(token, id)
      setContactItems(prev => prev.filter(x => x?.contactID !== id))
    } catch (e) { setDelContactErr(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelContactLoadingId(null) }
  }

  async function deleteAnnById(item) {
    setDelAnnErr('')
    const id = item?.announcementID
    if (!id) { setDelAnnErr('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.title ?? 'Duyuru'}" silinsin mi?`)) return
    try {
      setDelAnnLoadingId(id)
      await deleteAnnouncement(token, id)
      setAnnItems(prev => prev.filter(x => x?.announcementID !== id))
    } catch (e) { setDelAnnErr(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelAnnLoadingId(null) }
  }

  // --- RENDER ---
  if (sectionKey === 'spec') {
    return (
      <Section title="Uzmanlık" count={specItems.length} chipIcon={<LocalHospital sx={{ fontSize: 18 }} />}>
        {canEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            {delSpecErr && <Alert sx={{ flex: 1, minWidth: 240 }} severity="error" variant="filled">{delSpecErr}</Alert>}
            <Box sx={{ flex: 1 }} />
            <Button variant={openSpecForm ? 'outlined' : 'contained'} onClick={() => setOpenSpecForm(v => !v)}
              startIcon={<AddIcon />} size="small" sx={{ minHeight: 40 }} aria-expanded={openSpecForm ? 'true' : 'false'}>
              {openSpecForm ? 'Uzmanlık Ekle (Kapat)' : 'Uzmanlık Ekle'}
            </Button>
          </Box>
        )}

        <SectionList
          items={specItems}
          emptyText="Uzmanlık alanı bulunamadı."
          getKey={(spec, i) => spec?.specializationID ?? i}
          renderItem={(spec) => (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <GlassTile icon={<LocalHospital fontSize="small" />} label="Uzmanlık" value={spec?.nameOfSpecialization} inline />
              <GlassTile icon={<WorkHistory fontSize="small" />} label="Deneyim"
                value={(spec?.specializationExperience ?? spec?.experienceYears) != null
                  ? `${spec?.specializationExperience ?? spec?.experienceYears} yıl` : '—'} inline />
              {canEdit && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Sil">
                    <span>
                      <IconButton aria-label={`"${spec?.nameOfSpecialization ?? 'Uzmanlık'}" kaydını sil`}
                        onClick={() => deleteSpecById(spec)} disabled={delSpecLoadingId === (spec?.specializationID)}
                        sx={{ color: 'error.main', border: '1px solid', borderColor: 'rgba(244,67,54,0.5)',
                              minWidth: 44, minHeight: 44, '&:hover': { bgcolor: 'rgba(244,67,54,0.15)', borderColor: 'rgba(244,67,54,0.7)'}}}>
                        {delSpecLoadingId === (spec?.specializationID) ? <CircularProgress size={18} /> : <DeleteIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>
          )}
        />

        {canEdit && openSpecForm && <AddSpecializationForm onAdded={(x) => setSpecItems(p => [x, ...p])} onClose={() => setOpenSpecForm(false)} />}
      </Section>
    )
  }

  if (sectionKey === 'addr') {
    return (
      <Section title="Adresler" count={addrItems.length} chipIcon={<Business sx={{ fontSize: 18 }} />}>
        {canEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            {delAddrErr && <Alert sx={{ flex: 1, minWidth: 240 }} severity="error" variant="filled">{delAddrErr}</Alert>}
            <Box sx={{ flex: 1 }} />
            <Button variant={openAddrForm ? 'outlined' : 'contained'} onClick={() => setOpenAddrForm(v => !v)}
              startIcon={<AddIcon />} size="small" sx={{ minHeight: 40 }} aria-expanded={openAddrForm ? 'true' : 'false'}>
              {openAddrForm ? 'Adres Ekle (Kapat)' : 'Adres Ekle'}
            </Button>
          </Box>
        )}

        <SectionList
          items={addrItems}
          emptyText="Çalışma adresi bulunamadı."
          getKey={(a, i) => a?.adressID ?? a?.addressID ?? i}
          renderItem={(a) => (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <GlassTile icon={<Business fontSize="small" />} label="İş Yeri" value={a?.workPlaceName} inline />
              <GlassTile icon={<Place fontSize="small" />} label="Adres"
                value={[a?.street, a?.county, a?.city, a?.country].filter(Boolean).join(', ')} inline />
              {canEdit && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Sil">
                    <span>
                      <IconButton aria-label={`"${a?.workPlaceName ?? 'Adres'}" kaydını sil`}
                        onClick={() => deleteAddrById(a)} disabled={delAddrLoadingId === (a?.addressID ?? a?.adressID)}
                        sx={{ color: 'error.main', border: '1px solid', borderColor: 'rgba(244,67,54,0.5)',
                              minWidth: 44, minHeight: 44, '&:hover': { bgcolor: 'rgba(244,67,54,0.15)', borderColor: 'rgba(244,67,54,0.7)'}}}>
                        {delAddrLoadingId === (a?.addressID ?? a?.adressID) ? <CircularProgress size={18} /> : <DeleteIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>
          )}
        />

        {canEdit && openAddrForm && <AddAddressForm onAdded={(x) => setAddrItems(p => [x, ...p])} onClose={() => setOpenAddrForm(false)} />}
      </Section>
    )
  }

  if (sectionKey === 'contact') {
    return (
      <Section title="İletişim" count={contactItems.length} chipIcon={<Phone sx={{ fontSize: 18 }} />}>
        {canEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            {delContactErr && <Alert sx={{ flex: 1, minWidth: 240 }} severity="error" variant="filled">{delContactErr}</Alert>}
            <Box sx={{ flex: 1 }} />
            <Button variant={openContactForm ? 'outlined' : 'contained'} onClick={() => setOpenContactForm(v => !v)}
              startIcon={<AddIcon />} size="small" sx={{ minHeight: 40 }} aria-expanded={openContactForm ? 'true' : 'false'}>
              {openContactForm ? 'İletişim Ekle (Kapat)' : 'İletişim Ekle'}
            </Button>
          </Box>
        )}

        <SectionList
          items={contactItems}
          emptyText="İletişim bilgisi bulunamadı."
          getKey={(c, i) => c?.contactID ?? i}
          renderItem={(c) => (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <GlassTile icon={<Email fontSize="small" />} label="E-posta" value={c?.email} inline />
              <GlassTile icon={<Phone fontSize="small" />} label="Telefon" value={c?.phoneNumber} inline />
              {canEdit && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Sil">
                    <span>
                      <IconButton aria-label={`"${c?.email ?? c?.phoneNumber ?? 'İletişim'}" kaydını sil`}
                        onClick={() => deleteContactById(c)} disabled={delContactLoadingId === c?.contactID}
                        sx={{ color: 'error.main', border: '1px solid', borderColor: 'rgba(244,67,54,0.5)',
                              minWidth: 44, minHeight: 44, '&:hover': { bgcolor: 'rgba(244,67,54,0.15)', borderColor: 'rgba(244,67,54,0.7)'}}}>
                        {delContactLoadingId === c?.contactID ? <CircularProgress size={18} /> : <DeleteIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>
          )}
        />

        {canEdit && openContactForm && <AddContactForm onAdded={(x) => setContactItems(p => [x, ...p])} onClose={() => setOpenContactForm(false)} />}
      </Section>
    )
  }

  if (sectionKey === 'ann') {
    return (
      <Section title="Duyurular" count={annItems.length} chipIcon={<Campaign sx={{ fontSize: 18 }} />}>
        {canEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            {delAnnErr && <Alert sx={{ flex: 1, minWidth: 240 }} severity="error" variant="filled">{delAnnErr}</Alert>}
            <Box sx={{ flex: 1 }} />
            <Button variant={openAnnForm ? 'outlined' : 'contained'} onClick={() => setOpenAnnForm(v => !v)}
              startIcon={<AddIcon />} size="small" sx={{ minHeight: 40 }} aria-expanded={openAnnForm ? 'true' : 'false'}>
              {openAnnForm ? 'Duyuru Ekle (Kapat)' : 'Duyuru Ekle'}
            </Button>
          </Box>
        )}

        <SectionList
          items={annItems}
          emptyText="Duyuru bulunamadı."
          getKey={(a, i) => a?.announcementID ?? i}
          renderItem={(a) => (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <GlassTile icon={<Campaign fontSize="small" />} label="Başlık" value={a?.title} inline />
              <GlassTile label="İçerik" value={a?.content} inline />
              <GlassTile label="Tarih" value={prettyDate(a?.uploadDate)} inline />
              {canEdit && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Sil">
                    <span>
                      <IconButton aria-label={`"${a?.title ?? 'Duyuru'}" kaydını sil`}
                        onClick={() => deleteAnnById(a)} disabled={delAnnLoadingId === a?.announcementID}
                        sx={{ color: 'error.main', border: '1px solid', borderColor: 'rgba(244,67,54,0.5)',
                              minWidth: 44, minHeight: 44, '&:hover': { bgcolor: 'rgba(244,67,54,0.15)', borderColor: 'rgba(244,67,54,0.7)'}}}>
                        {delAnnLoadingId === a?.announcementID ? <CircularProgress size={18} /> : <DeleteIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>
          )}
        />

        {canEdit && openAnnForm && <AddAnnouncementForm onAdded={(x) => setAnnItems(p => [x, ...p])} onClose={() => setOpenAnnForm(false)} />}
      </Section>
    )
  }

  return null
}
