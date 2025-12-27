import { useMemo, useState } from 'react'
import {
  Box, Stack, Typography, TextField, Button,
  CircularProgress, Paper, IconButton, Menu, MenuItem
} from '@mui/material'
import {
  LocalHospital, WorkHistory, Business, Place, Phone, Email, Campaign,
  Add as AddIcon, DeleteOutline as DeleteIcon, Edit, MoreVert
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import {
  addSpecialization, deleteSpecialization,
  addWorkAddress, deleteWorkAddress,
  addContactInfor, deleteContact,
  addAnnouncement, deleteAnnouncement
} from '../../services/api.js'
import { Section, SubRow, SectionList, prettyDate } from './ProfileShared.jsx'

/* ---------- FORM: Uzmanlık Ekle ---------- */
function AddSpecializationForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [name, setName] = useState('')
  const [exp, setExp] = useState('') // number as string
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => name.trim().length > 0 && String(exp).trim() !== '', [name, exp])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { showError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return

    setLoading(true)
    try {
      const years = Number(exp)
      const payload = { nameOfSpecialization: name.trim(), specializationExperience: isNaN(years) ? 0 : years }
      const created = await addSpecialization(token, payload)

      onAdded?.({
        specializationID: created?.specializationID ?? Math.random().toString(36).slice(2),
        nameOfSpecialization: payload.nameOfSpecialization,
        specializationExperience: payload.specializationExperience,
      })
      showSuccess('Uzmanlık eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) {
      showError(err?.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        mt: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Uzmanlık Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
        <TextField 
          fullWidth 
          label="Uzmanlık Adı" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          size="small" 
          required 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <TextField 
          fullWidth 
          label="Deneyim (yıl)" 
          type="number" 
          inputProps={{ min: 0, max: 60, step: 1 }}
          value={exp} 
          onChange={(e) => setExp(e.target.value)} 
          size="small" 
          required 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!canSubmit || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} 
          sx={{ 
            minHeight: { xs: 48, md: 44 }, 
            px: { xs: 2.5, md: 2 },
            fontSize: { xs: '15px', md: '14px' },
            fontWeight: 600
          }}
        >
          Kaydet
        </Button>
      </Stack>

    </Paper>
  )
}

/* ---------- FORM: Adres Ekle ---------- */
function AddAddressForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [form, setForm] = useState({ workPlaceName: '', street: '', city: '', county: '', country: '' })
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => form.workPlaceName.trim().length > 0, [form.workPlaceName])
  function updateField(key) { return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { showError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return

    setLoading(true)
    try {
      const payload = {
        workPlaceName: form.workPlaceName.trim(),
        street: form.street || '', city: form.city || '', county: form.county || '', country: form.country || ''
      }
      const created = await addWorkAddress(token, payload)
      onAdded?.({ addressID: created?.addressID ?? created?.adressID ?? Math.random().toString(36).slice(2), ...payload })
      showSuccess('Adres eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) { showError(err?.message || 'Kayıt sırasında bir hata oluştu.') }
    finally { setLoading(false) }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        mt: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Adres Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
        <TextField 
          fullWidth 
          label="İş Yeri" 
          value={form.workPlaceName} 
          onChange={updateField('workPlaceName')} 
          size="small" 
          required 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <TextField 
          fullWidth 
          label="Sokak/Cadde" 
          value={form.street} 
          onChange={updateField('street')} 
          size="small" 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch" sx={{ mt: 1.5 }}>
        <TextField 
          fullWidth 
          label="İlçe" 
          value={form.county} 
          onChange={updateField('county')} 
          size="small" 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <TextField 
          fullWidth 
          label="Şehir" 
          value={form.city} 
          onChange={updateField('city')} 
          size="small" 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <TextField 
          fullWidth 
          label="Ülke" 
          value={form.country} 
          onChange={updateField('country')} 
          size="small" 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
      </Stack>

      <Button 
        type="submit" 
        variant="contained" 
        disabled={!canSubmit || loading}
        startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} 
        sx={{ 
          minHeight: { xs: 48, md: 44 }, 
          px: { xs: 2.5, md: 2 }, 
          mt: 2,
          fontSize: { xs: '15px', md: '14px' },
          fontWeight: 600
        }}
      >
        Kaydet
      </Button>

    </Paper>
  )
}

/* ---------- FORM: İletişim Ekle ---------- */
function AddContactForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [form, setForm] = useState({ email: '', phoneNumber: '' })
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => form.email.trim().length > 0 && form.phoneNumber.trim().length > 0, [form])
  function updateField(key) { return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { showError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return
    setLoading(true)
    try {
      const payload = { email: form.email.trim(), phoneNumber: form.phoneNumber.trim() }
      const created = await addContactInfor(token, payload)
      onAdded?.({ contactID: created?.contactID ?? Math.random().toString(36).slice(2), ...payload })
      showSuccess('İletişim eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) { showError(err?.message || 'Kayıt sırasında bir hata oluştu.') }
    finally { setLoading(false) }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        mt: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>İletişim Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
        <TextField 
          fullWidth 
          label="E-posta" 
          value={form.email} 
          onChange={updateField('email')} 
          size="small" 
          required 
          type="email" 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <TextField 
          fullWidth 
          label="Telefon" 
          value={form.phoneNumber} 
          onChange={updateField('phoneNumber')} 
          size="small" 
          required
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!canSubmit || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} 
          sx={{ 
            minHeight: { xs: 48, md: 44 }, 
            px: { xs: 2.5, md: 2 },
            fontSize: { xs: '15px', md: '14px' },
            fontWeight: 600
          }}
        >
          Kaydet
        </Button>
      </Stack>

    </Paper>
  )
}

/* ---------- FORM: Duyuru Ekle ---------- */
function AddAnnouncementForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [form, setForm] = useState({ title: '', content: '', uploadDate: '' }) // YYYY-MM-DD
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () => form.title.trim().length > 0 && form.content.trim().length > 0 && form.uploadDate.trim().length > 0,
    [form]
  )
  function updateField(key) { return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { showError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return
    setLoading(true)
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
      showSuccess('Duyuru eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) { showError(err?.message || 'Kayıt sırasında bir hata oluştu.') }
    finally { setLoading(false) }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        mt: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Duyuru Ekle</Typography>
        <Button size="small" onClick={onClose} variant="text">Kapat</Button>
      </Stack>

      <Stack spacing={1.5}>
        <TextField 
          fullWidth 
          label="Başlık" 
          value={form.title} 
          onChange={updateField('title')} 
          size="small" 
          required 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' },
              minHeight: { xs: 48, md: 40 }
            }
          }}
        />
        <TextField 
          fullWidth 
          multiline 
          minRows={3} 
          label="İçerik" 
          value={form.content} 
          onChange={updateField('content')} 
          size="small" 
          required 
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '16px', md: '15px' }
            }
          }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField 
            fullWidth 
            label="Tarih" 
            type="date" 
            value={form.uploadDate} 
            onChange={updateField('uploadDate')}
            InputLabelProps={{ shrink: true }} 
            size="small" 
            required 
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', md: '15px' },
                minHeight: { xs: 48, md: 40 }
              }
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!canSubmit || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />} 
            sx={{ 
              minHeight: { xs: 48, md: 44 }, 
              px: { xs: 2.5, md: 2 },
              fontSize: { xs: '15px', md: '14px' },
              fontWeight: 600
            }}
          >
            Kaydet
          </Button>
        </Stack>
      </Stack>

    </Paper>
  )
}

/* ---------- Ana Bileşen ---------- */
export default function DoctorPart({ doctorData, sectionKey, canEdit = true }) {
  const { token } = useAuth()
  const { showError } = useNotification()
  if (!doctorData) return null

  // Local state: ekleme/silme sonrası UI anında güncellensin
  const [specItems, setSpecItems] = useState(
    Array.isArray(doctorData?.specialization) ? doctorData.specialization : []
  )
  const [openSpecForm, setOpenSpecForm] = useState(false)
  const [delSpecLoadingId, setDelSpecLoadingId] = useState(null)

  const [addrItems, setAddrItems] = useState(
    Array.isArray(doctorData?.worksAddress) ? doctorData.worksAddress : []
  )
  const [openAddrForm, setOpenAddrForm] = useState(false)
  const [delAddrLoadingId, setDelAddrLoadingId] = useState(null)

  const [contactItems, setContactItems] = useState(
    Array.isArray(doctorData?.contactInfor) ? doctorData.contactInfor : []
  )
  const [openContactForm, setOpenContactForm] = useState(false)
  const [delContactLoadingId, setDelContactLoadingId] = useState(null)

  const [annItems, setAnnItems] = useState(
    Array.isArray(doctorData?.announcement) ? doctorData.announcement : []
  )
  const [openAnnForm, setOpenAnnForm] = useState(false)
  const [delAnnLoadingId, setDelAnnLoadingId] = useState(null)

  // Menü anchor state'leri
  const [specMenuAnchors, setSpecMenuAnchors] = useState({})
  const [addrMenuAnchors, setAddrMenuAnchors] = useState({})
  const [contactMenuAnchors, setContactMenuAnchors] = useState({})
  const [annMenuAnchors, setAnnMenuAnchors] = useState({})

  // --- DELETE handlers ---
  async function deleteSpecById(item) {
    const id = item?.specializationID
    if (!id) { showError('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.nameOfSpecialization ?? 'Uzmanlık'}" silinsin mi?`)) return
    try {
      setDelSpecLoadingId(id)
      await deleteSpecialization(token, id)
      setSpecItems(prev => prev.filter(x => (x?.specializationID ?? x?.id) !== id))
    } catch (e) { showError(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelSpecLoadingId(null) }
  }

  async function deleteAddrById(item) {
    const id = item?.addressID ?? item?.adressID
    if (!id) { showError('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.workPlaceName ?? 'Adres'}" silinsin mi?`)) return
    try {
      setDelAddrLoadingId(id)
      await deleteWorkAddress(token, id)
      setAddrItems(prev => prev.filter(x => (x?.addressID ?? x?.adressID) !== id))
    } catch (e) { showError(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelAddrLoadingId(null) }
  }

  async function deleteContactById(item) {
    const id = item?.contactID
    if (!id) { showError('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.email ?? item?.phoneNumber ?? 'İletişim'}" silinsin mi?`)) return
    try {
      setDelContactLoadingId(id)
      await deleteContact(token, id)
      setContactItems(prev => prev.filter(x => x?.contactID !== id))
    } catch (e) { showError(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelContactLoadingId(null) }
  }

  async function deleteAnnById(item) {
    const id = item?.announcementID
    if (!id) { showError('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!window.confirm(`"${item?.title ?? 'Duyuru'}" silinsin mi?`)) return
    try {
      setDelAnnLoadingId(id)
      await deleteAnnouncement(token, id)
      setAnnItems(prev => prev.filter(x => x?.announcementID !== id))
    } catch (e) { showError(e?.message || 'Silme işlemi başarısız.') }
    finally { setDelAnnLoadingId(null) }
  }

  // --- RENDER ---
  if (sectionKey === 'spec') {
    return (
      <Section 
        title="Uzmanlık" 
        count={specItems.length} 
        chipIcon={<LocalHospital sx={{ fontSize: 18 }} />}
        actionIcon={canEdit ? (
          <IconButton
            size="small"
            onClick={() => setOpenSpecForm(true)}
            sx={{
              color: 'text.secondary',
              width: { xs: 36, md: 36 },
              height: { xs: 36, md: 36 },
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(52,195,161,0.1)'
              }
            }}
          >
            <Edit sx={{ fontSize: { xs: '20px', md: '20px' } }} />
          </IconButton>
        ) : null}
        onActionClick={canEdit ? () => setOpenSpecForm(true) : undefined}
      >

        <SectionList
          items={specItems}
          emptyText="Uzmanlık alanı bulunamadı."
          getKey={(spec, i) => spec?.specializationID ?? i}
          renderItem={(spec) => {
            const id = spec?.specializationID
            const menuAnchor = specMenuAnchors[id] || null
            const openMenu = Boolean(menuAnchor)
            
            return (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <SubRow 
                        icon={<LocalHospital fontSize="small" />} 
                        label="Uzmanlık" 
                        value={spec?.nameOfSpecialization} 
                      />
                    </Box>
                    {canEdit && (
                      <IconButton
                        size="small"
                        onClick={(e) => setSpecMenuAnchors(prev => ({ ...prev, [id]: e.currentTarget }))}
                        sx={{
                          color: 'text.secondary',
                          width: { xs: 32, md: 32 },
                          height: { xs: 32, md: 32 },
                          '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'rgba(255,255,255,0.08)'
                          }
                        }}
                      >
                        <MoreVert sx={{ fontSize: { xs: '18px', md: '18px' } }} />
                      </IconButton>
                    )}
                  </Stack>
                  
                  {(spec?.specializationExperience ?? spec?.experienceYears) != null && (
                    <SubRow 
                      icon={<WorkHistory fontSize="small" />} 
                      label="Deneyim"
                      value={`${spec?.specializationExperience ?? spec?.experienceYears} yıl`} 
                    />
                  )}
                  
                  {canEdit && (
                    <Menu
                      anchorEl={menuAnchor}
                      open={openMenu}
                      onClose={() => setSpecMenuAnchors(prev => ({ ...prev, [id]: null }))}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      PaperProps={{
                        sx: {
                          bgcolor: 'rgba(7, 20, 28, 0.98)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 2,
                          minWidth: 140,
                          mt: 0.5
                        }
                      }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setSpecMenuAnchors(prev => ({ ...prev, [id]: null }))
                          deleteSpecById(spec)
                        }}
                        disabled={delSpecLoadingId === id}
                        sx={{
                          color: 'error.main',
                          fontSize: { xs: '14px', md: '14px' },
                          py: { xs: 1, md: 1 },
                          '&:hover': {
                            backgroundColor: 'rgba(244,67,54,0.1)'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        {delSpecLoadingId === id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} sx={{ color: 'error.main' }} />
                            <span>Siliniyor...</span>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                            <span>Sil</span>
                          </Box>
                        )}
                      </MenuItem>
                    </Menu>
                  )}
                </Stack>
              </Paper>
            )
          }}
        />

        {canEdit && openSpecForm && <AddSpecializationForm onAdded={(x) => setSpecItems(p => [x, ...p])} onClose={() => setOpenSpecForm(false)} />}
      </Section>
    )
  }

  if (sectionKey === 'addr') {
    return (
      <Section 
        title="Adresler" 
        count={addrItems.length} 
        chipIcon={<Business sx={{ fontSize: 18 }} />}
        actionIcon={canEdit ? (
          <IconButton
            size="small"
            onClick={() => setOpenAddrForm(true)}
            sx={{
              color: 'text.secondary',
              width: { xs: 36, md: 36 },
              height: { xs: 36, md: 36 },
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(52,195,161,0.1)'
              }
            }}
          >
            <Edit sx={{ fontSize: { xs: '20px', md: '20px' } }} />
          </IconButton>
        ) : null}
        onActionClick={canEdit ? () => setOpenAddrForm(true) : undefined}
      >

        <SectionList
          items={addrItems}
          emptyText="Çalışma adresi bulunamadı."
          getKey={(a, i) => a?.adressID ?? a?.addressID ?? i}
          renderItem={(a) => {
            const addrId = a?.addressID ?? a?.adressID
            const menuAnchor = addrMenuAnchors[addrId] || null
            const openMenu = Boolean(menuAnchor)
            
            return (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <SubRow icon={<Business fontSize="small" />} label="İş Yeri" value={a?.workPlaceName} />
                    </Box>
                    {canEdit && (
                      <IconButton
                        size="small"
                        onClick={(e) => setAddrMenuAnchors(prev => ({ ...prev, [addrId]: e.currentTarget }))}
                        sx={{
                          color: 'text.secondary',
                          width: { xs: 32, md: 32 },
                          height: { xs: 32, md: 32 },
                          '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'rgba(255,255,255,0.08)'
                          }
                        }}
                      >
                        <MoreVert sx={{ fontSize: { xs: '18px', md: '18px' } }} />
                      </IconButton>
                    )}
                  </Stack>
                  
                  <SubRow icon={<Place fontSize="small" />} label="Adres"
                    value={[a?.street, a?.county, a?.city, a?.country].filter(Boolean).join(', ')} />
                  
                  {canEdit && (
                    <Menu
                      anchorEl={menuAnchor}
                      open={openMenu}
                      onClose={() => setAddrMenuAnchors(prev => ({ ...prev, [addrId]: null }))}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      PaperProps={{
                        sx: {
                          bgcolor: 'rgba(7, 20, 28, 0.98)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 2,
                          minWidth: 140,
                          mt: 0.5
                        }
                      }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setAddrMenuAnchors(prev => ({ ...prev, [addrId]: null }))
                          deleteAddrById(a)
                        }}
                        disabled={delAddrLoadingId === addrId}
                        sx={{
                          color: 'error.main',
                          fontSize: { xs: '14px', md: '14px' },
                          py: { xs: 1, md: 1 },
                          '&:hover': {
                            backgroundColor: 'rgba(244,67,54,0.1)'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        {delAddrLoadingId === addrId ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} sx={{ color: 'error.main' }} />
                            <span>Siliniyor...</span>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                            <span>Sil</span>
                          </Box>
                        )}
                      </MenuItem>
                    </Menu>
                  )}
                </Stack>
              </Paper>
            )
          }}
        />

        {canEdit && openAddrForm && <AddAddressForm onAdded={(x) => setAddrItems(p => [x, ...p])} onClose={() => setOpenAddrForm(false)} />}
      </Section>
    )
  }

  if (sectionKey === 'contact') {
    return (
      <Section 
        title="İletişim" 
        count={contactItems.length} 
        chipIcon={<Phone sx={{ fontSize: 18 }} />}
        actionIcon={canEdit ? (
          <IconButton
            size="small"
            onClick={() => setOpenContactForm(true)}
            sx={{
              color: 'text.secondary',
              width: { xs: 36, md: 36 },
              height: { xs: 36, md: 36 },
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(52,195,161,0.1)'
              }
            }}
          >
            <Edit sx={{ fontSize: { xs: '20px', md: '20px' } }} />
          </IconButton>
        ) : null}
        onActionClick={canEdit ? () => setOpenContactForm(true) : undefined}
      >

        <SectionList
          items={contactItems}
          emptyText="İletişim bilgisi bulunamadı."
          getKey={(c, i) => c?.contactID ?? i}
          renderItem={(c) => {
            const id = c?.contactID
            const menuAnchor = contactMenuAnchors[id] || null
            const openMenu = Boolean(menuAnchor)
            
            return (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <SubRow icon={<Email fontSize="small" />} label="E-posta" value={c?.email} />
                    </Box>
                    {canEdit && (
                      <IconButton
                        size="small"
                        onClick={(e) => setContactMenuAnchors(prev => ({ ...prev, [id]: e.currentTarget }))}
                        sx={{
                          color: 'text.secondary',
                          width: { xs: 32, md: 32 },
                          height: { xs: 32, md: 32 },
                          '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'rgba(255,255,255,0.08)'
                          }
                        }}
                      >
                        <MoreVert sx={{ fontSize: { xs: '18px', md: '18px' } }} />
                      </IconButton>
                    )}
                  </Stack>
                  
                  <SubRow icon={<Phone fontSize="small" />} label="Telefon" value={c?.phoneNumber} />
                  
                  {canEdit && (
                    <Menu
                      anchorEl={menuAnchor}
                      open={openMenu}
                      onClose={() => setContactMenuAnchors(prev => ({ ...prev, [id]: null }))}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      PaperProps={{
                        sx: {
                          bgcolor: 'rgba(7, 20, 28, 0.98)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 2,
                          minWidth: 140,
                          mt: 0.5
                        }
                      }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setContactMenuAnchors(prev => ({ ...prev, [id]: null }))
                          deleteContactById(c)
                        }}
                        disabled={delContactLoadingId === id}
                        sx={{
                          color: 'error.main',
                          fontSize: { xs: '14px', md: '14px' },
                          py: { xs: 1, md: 1 },
                          '&:hover': {
                            backgroundColor: 'rgba(244,67,54,0.1)'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        {delContactLoadingId === id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} sx={{ color: 'error.main' }} />
                            <span>Siliniyor...</span>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                            <span>Sil</span>
                          </Box>
                        )}
                      </MenuItem>
                    </Menu>
                  )}
                </Stack>
              </Paper>
            )
          }}
        />

        {canEdit && openContactForm && <AddContactForm onAdded={(x) => setContactItems(p => [x, ...p])} onClose={() => setOpenContactForm(false)} />}
      </Section>
    )
  }

  if (sectionKey === 'ann') {
    return (
      <Section 
        title="Duyurular" 
        count={annItems.length} 
        chipIcon={<Campaign sx={{ fontSize: 18 }} />}
        actionIcon={canEdit ? (
          <IconButton
            size="small"
            onClick={() => setOpenAnnForm(true)}
            sx={{
              color: 'text.secondary',
              width: { xs: 36, md: 36 },
              height: { xs: 36, md: 36 },
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(52,195,161,0.1)'
              }
            }}
          >
            <Edit sx={{ fontSize: { xs: '20px', md: '20px' } }} />
          </IconButton>
        ) : null}
        onActionClick={canEdit ? () => setOpenAnnForm(true) : undefined}
      >

        <SectionList
          items={annItems}
          emptyText="Duyuru bulunamadı."
          getKey={(a, i) => a?.announcementID ?? i}
          renderItem={(a) => {
            const id = a?.announcementID
            const menuAnchor = annMenuAnchors[id] || null
            const openMenu = Boolean(menuAnchor)
            
            return (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <SubRow icon={<Campaign fontSize="small" />} label="Başlık" value={a?.title} />
                    </Box>
                    {canEdit && (
                      <IconButton
                        size="small"
                        onClick={(e) => setAnnMenuAnchors(prev => ({ ...prev, [id]: e.currentTarget }))}
                        sx={{
                          color: 'text.secondary',
                          width: { xs: 32, md: 32 },
                          height: { xs: 32, md: 32 },
                          '&:hover': {
                            color: 'text.primary',
                            backgroundColor: 'rgba(255,255,255,0.08)'
                          }
                        }}
                      >
                        <MoreVert sx={{ fontSize: { xs: '18px', md: '18px' } }} />
                      </IconButton>
                    )}
                  </Stack>
                  
                  <SubRow label="İçerik" value={a?.content} />
                  <SubRow label="Tarih" value={prettyDate(a?.uploadDate)} />
                  
                  {canEdit && (
                    <Menu
                      anchorEl={menuAnchor}
                      open={openMenu}
                      onClose={() => setAnnMenuAnchors(prev => ({ ...prev, [id]: null }))}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      PaperProps={{
                        sx: {
                          bgcolor: 'rgba(7, 20, 28, 0.98)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 2,
                          minWidth: 140,
                          mt: 0.5
                        }
                      }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setAnnMenuAnchors(prev => ({ ...prev, [id]: null }))
                          deleteAnnById(a)
                        }}
                        disabled={delAnnLoadingId === id}
                        sx={{
                          color: 'error.main',
                          fontSize: { xs: '14px', md: '14px' },
                          py: { xs: 1, md: 1 },
                          '&:hover': {
                            backgroundColor: 'rgba(244,67,54,0.1)'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        {delAnnLoadingId === id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} sx={{ color: 'error.main' }} />
                            <span>Siliniyor...</span>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                            <span>Sil</span>
                          </Box>
                        )}
                      </MenuItem>
                    </Menu>
                  )}
                </Stack>
              </Paper>
            )
          }}
        />

        {canEdit && openAnnForm && <AddAnnouncementForm onAdded={(x) => setAnnItems(p => [x, ...p])} onClose={() => setOpenAnnForm(false)} />}
      </Section>
    )
  }

  return null
}
