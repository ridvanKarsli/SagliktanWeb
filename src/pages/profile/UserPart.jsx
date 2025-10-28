import { useEffect, useMemo, useState } from 'react'
import {
  Box, Stack, Typography, TextField, Button,
  Alert, CircularProgress, Autocomplete, Collapse, Tooltip, IconButton, Paper
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { addDisease, getDiseaseNames, deleteDisease } from '../../services/api.js'
import { Section, SectionList, GlassTile, prettyDate } from './ProfileShared.jsx'

/* Yardımcı: farklı API alan adlarından isim/ID çıkar */
function getDiseaseName(d) {
  return d?.name ?? d?.diseaseName ?? d?.DiseaseName ?? d?.title ?? d?.Name ?? '—'
}
function getDiseaseId(d) {
  return d?.diseaseID ?? d?.id ?? d?.DiseaseID ?? d?.diseaseId ?? null
}

/* -------- Form: Hastalık Ekle -------- */
function AddDiseaseForm({ onAdded, onClose }) {
  const { token } = useAuth()
  const [diseaseNames, setDiseaseNames] = useState([])
  const [fetching, setFetching] = useState(false)
  const [fetchErr, setFetchErr] = useState('')

  const [selectedName, setSelectedName] = useState(null)
  const [date, setDate] = useState('') // YYYY-MM-DD

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    async function loadNames() {
      if (!token) return
      setFetching(true); setFetchErr('')
      try {
        const names = await getDiseaseNames(token, { signal: controller.signal })
        if (mounted) setDiseaseNames(names ?? [])
      } catch (e) {
        if (mounted) setFetchErr(e?.message || 'Hastalık listesi alınamadı.')
      } finally {
        if (mounted) setFetching(false)
      }
    }
    loadNames()
    return () => { mounted = false; controller.abort() }
  }, [token])

  const canSubmit = useMemo(() => !!selectedName && String(selectedName).trim().length > 0, [selectedName])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    if (!canSubmit) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = { diseaseName: String(selectedName).trim(), dateOfDiagnosis: date || null }
      const created = await addDisease(token, payload)
      onAdded?.({
        diseaseID: created?.diseaseID ?? Math.random().toString(36).slice(2),
        name: payload.diseaseName,
        dateOfDiagnosis: payload.dateOfDiagnosis,
      })
      setSuccess('Hastalık başarıyla eklendi.')
      setTimeout(() => { onClose?.() }, 900)
    } catch (err) {
      setError(err?.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} role="form" aria-label="Hastalık ekleme formu"
      sx={{
        mt: 1.5, p: 2, borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))',
        backdropFilter: 'blur(8px)',
      }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Hastalık Ekle</Typography>
        <Tooltip title="Kapat">
          <Button size="small" onClick={onClose} startIcon={<CloseIcon />} variant="text">Kapat</Button>
        </Tooltip>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
        <Autocomplete
          fullWidth
          options={diseaseNames}
          loading={fetching}
          value={selectedName}
          onChange={(_, v) => setSelectedName(v)}
          freeSolo={false}
          disableClearable
          blurOnSelect
          disablePortal
          isOptionEqualToValue={(opt, val) => String(opt) === String(val)}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : '')}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'rgba(7,20,28,0.98)',
                color: '#FAF9F6',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                '& .MuiAutocomplete-option': {
                  color: '#FAF9F6',        // metin görünür
                  minHeight: 44,
                  '&[aria-selected="true"]': { bgcolor: 'rgba(52,195,161,0.22)' },
                  '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.08)' }
                }
              }
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hastalık Seçin"
              size="small"
              required
              helperText={fetchErr ? `Liste alınamadı: ${fetchErr}` : ''}
              inputProps={{ ...params.inputProps, readOnly: !!selectedName }} // seçim sonrası yazılamaz
              sx={{
                '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
                '& .MuiInputBase-input': { color: '#FAF9F6' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' },
                '& .MuiSvgIcon-root': { color: '#FAF9F6' }
              }}
            />
          )}
        />

        <TextField
          fullWidth
          label="Tanı Tarihi"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
            '& .MuiInputBase-input': { color: '#FAF9F6' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          sx={{ minHeight: 44, px: 2 }}
          aria-label="Hastalık kaydet"
        >
          Kaydet
        </Button>
      </Stack>

      {error && <Alert sx={{ mt: 1.25 }} severity="error" variant="filled">{error}</Alert>}
      {success && <Alert sx={{ mt: 1.25 }} severity="success" variant="filled">{success}</Alert>}
    </Paper>
  )
}

/* -------- Liste: Hastalıklar (Doctor satırlarıyla aynı görünüm) -------- */
export default function UserPart({ publicUserData, sectionKey, canEdit = false }) {
  const { token } = useAuth()
  const [items, setItems] = useState(() =>
    Array.isArray(publicUserData?.diseases) ? publicUserData.diseases : []
  )
  const [openForm, setOpenForm] = useState(false)
  const [delErr, setDelErr] = useState('')
  const [delLoadingId, setDelLoadingId] = useState(null)

  if (!publicUserData) return null

  async function handleDeleteDisease(disease) {
    setDelErr('')
    const id = getDiseaseId(disease)
    if (!id) { setDelErr('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!token) { setDelErr('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    const ok = window.confirm(`"${getDiseaseName(disease)}" kaydını silmek istiyor musun?`)
    if (!ok) return

    try {
      setDelLoadingId(id)
      await deleteDisease(token, id)
      setItems(prev => prev.filter(x => getDiseaseId(x) !== id))
    } catch (e) {
      setDelErr(e?.message || 'Silme işlemi başarısız.')
    } finally {
      setDelLoadingId(null)
    }
  }

  if (sectionKey !== 'diseases') return null

  return (
    <Section title="Hastalıklarım" count={items.length}>
      {canEdit && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            variant={openForm ? 'outlined' : 'contained'}
            onClick={() => setOpenForm(v => !v)}
            startIcon={<AddIcon />}
            size="small"
            sx={{ minHeight: 40 }}
            aria-expanded={openForm ? 'true' : 'false'}
          >
            {openForm ? 'Hastalık Ekle (Kapat)' : 'Hastalık Ekle'}
          </Button>
        </Box>
      )}

      {delErr && <Alert sx={{ mb: 1 }} severity="error" variant="filled">{delErr}</Alert>}

      <SectionList
        emptyText="Kayıtlı hastalık bulunamadı."
        items={items}
        getKey={(d, i) => getDiseaseId(d) ?? i}
        renderItem={(d) => {
          const name = getDiseaseName(d)
          const diagDate = prettyDate(d?.dateOfDiagnosis)
          const id = getDiseaseId(d)
          return (
            <Stack spacing={1}>
              {/* DoctorPart ile aynı satır tasarımı */}
              <GlassTile label="Hastalık" value={name} inline />
              <GlassTile label="Tanı Tarihi" value={diagDate} inline />

              {canEdit && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Sil">
                    <span>
                      <IconButton
                        aria-label={`"${name}" kaydını sil`}
                        onClick={() => handleDeleteDisease(d)}
                        disabled={!id || delLoadingId === id}
                        sx={{
                          color: 'error.main',
                          border: '1px solid',
                          borderColor: 'rgba(244,67,54,0.5)',
                          minWidth: 44, minHeight: 44,
                          '&:hover': {
                            bgcolor: 'rgba(244,67,54,0.15)',
                            borderColor: 'rgba(244,67,54,0.7)'
                          }
                        }}
                      >
                        {delLoadingId === id ? <CircularProgress size={18} /> : <DeleteIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Stack>
          )
        }}
      />

      <Collapse in={canEdit && openForm} unmountOnExit>
        <AddDiseaseForm
          onAdded={(newItem) => setItems((prev) => [newItem, ...prev])}
          onClose={() => setOpenForm(false)}
        />
      </Collapse>
    </Section>
  )
}
