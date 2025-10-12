import { useEffect, useMemo, useState } from 'react'
import {
  Box, Stack, Typography, Divider, TextField, Button,
  Alert, CircularProgress, Autocomplete, Collapse, Tooltip, IconButton
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { addDisease, getDiseaseNames } from '../../services/api.js'

function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}

function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emptyText}</Typography>
  }
  return (
    <Stack divider={<Divider sx={{ my: 1 }}/> } spacing={1}>
      {items.map((it, i) => (
        <Box key={getKey?.(it, i) ?? i}>{renderItem(it, i)}</Box>
      ))}
    </Stack>
  )
}

function SubRow({ label, value }) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
      gap: { xs: 0.5, sm: 1 },
      alignItems: 'start'
    }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{value || '—'}</Typography>
    </Box>
  )
}

/* Yardımcı: farklı API alan adlarından güvenle isim çıkar */
function getDiseaseName(d) {
  return d?.name ?? d?.diseaseName ?? d?.DiseaseName ?? d?.title ?? d?.Name ?? '—'
}
/* Yardımcı: farklı olası id alanları */
function getDiseaseId(d) {
  return d?.diseaseID ?? d?.id ?? d?.DiseaseID ?? d?.diseaseId ?? null
}

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

  // Listeyi token ile çek
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    async function loadNames() {
      if (!token) return
      setFetching(true)
      setFetchErr('')
      try {
        const names = await getDiseaseNames(token, { signal: controller.signal })
        if (!mounted) return
        setDiseaseNames(names)
      } catch (e) {
        if (!mounted) return
        setFetchErr(e?.message || 'Hastalık listesi alınamadı.')
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

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // ✅ API formatı
      const payload = {
        diseaseName: String(selectedName).trim(),
        dateOfDiagnosis: date || null,
      }
      const created = await addDisease(token, payload)

      onAdded?.({
        diseaseID: created?.diseaseID ?? Math.random().toString(36).slice(2),
        name: payload.diseaseName,                // listede gösterim için normalize
        dateOfDiagnosis: payload.dateOfDiagnosis,
      })
      setSuccess('Hastalık başarıyla eklendi.')
      setTimeout(() => { onClose?.() }, 800)
    } catch (err) {
      setError(err?.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{
      mt: 2, p: 2, borderRadius: 2,
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))',
      backdropFilter: 'blur(8px)',
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2">Hastalık Ekle</Typography>
        <Tooltip title="Kapat">
          <Button size="small" onClick={onClose} startIcon={<CloseIcon />} variant="text">
            Kapat
          </Button>
        </Tooltip>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="start">
        <Autocomplete
          fullWidth
          options={diseaseNames}
          loading={fetching}
          value={selectedName}
          onChange={(_, v) => setSelectedName(v)}
          freeSolo={false}          // sadece listeden seçim
          disableClearable          // seçimi boşaltma kapalı
          blurOnSelect
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : '')}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'rgba(7,20,28,0.96)',
                color: '#FAF9F6',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                '& .MuiAutocomplete-option': {
                  color: '#FAF9F6',
                  '&[aria-selected="true"]': { bgcolor: 'rgba(52,195,161,0.18)' },
                  '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.06)' }
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
              inputProps={{
                ...params.inputProps,
                readOnly: !!selectedName      // seçim sonrası yazılamaz
              }}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                  borderRadius: 1
                },
                '& .MuiInputBase-input': { color: '#FAF9F6' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' },
                '& .MuiSvgIcon-root': { color: '#FAF9F6' }
              }}
            />
          )}
        />

        <TextField
          label="Tanı Tarihi"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            '& .MuiInputBase-root': {
              bgcolor: 'rgba(255,255,255,0.06)',
              borderRadius: 1
            },
            '& .MuiInputBase-input': { color: '#FAF9F6' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          fullWidth={{ xs: true, sm: false }}
        >
          Kaydet
        </Button>
      </Stack>

      {error && <Alert sx={{ mt: 1.5 }} severity="error" variant="filled">{error}</Alert>}
      {success && <Alert sx={{ mt: 1.5 }} severity="success" variant="filled">{success}</Alert>}
    </Box>
  )
}

export default function UserPart({ publicUserData, sectionKey, canEdit = false }) {
  const { token } = useAuth()
  const [items, setItems] = useState(() =>
    Array.isArray(publicUserData?.diseases) ? publicUserData.diseases : []
  )
  const [openForm, setOpenForm] = useState(false)
  const [delErr, setDelErr] = useState('')
  const [delLoadingId, setDelLoadingId] = useState(null)

  if (!publicUserData) return null

  async function deleteDisease(disease) {
    setDelErr('')
    const id = getDiseaseId(disease)
    if (!id) { setDelErr('Silinecek kaydın kimliği bulunamadı.'); return }
    if (!token) { setDelErr('Oturum bulunamadı. Lütfen tekrar giriş yapın.'); return }
    const ok = window.confirm(`"${getDiseaseName(disease)}" kaydını silmek istiyor musun?`)
    if (!ok) return

    try {
      setDelLoadingId(id)
      const url = `https://saglikta-7d7a2dbc0cf4.herokuapp.com/disease/deleteDisease?diseaseID=${encodeURIComponent(id)}`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      let data = null
      try { data = await res.json() } catch { /* no-op */ }
      if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`)

      setItems(prev => prev.filter(x => getDiseaseId(x) !== id))
    } catch (e) {
      setDelErr(e?.message || 'Silme işlemi başarısız.')
    } finally {
      setDelLoadingId(null)
    }
  }

  if (sectionKey === 'diseases') {
    return (
      <>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ mb: 1, gap: { xs: 1, sm: 0 } }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}>
            Hastalıklarım
          </Typography>

          {canEdit && (
            <Button
              variant={openForm ? 'outlined' : 'contained'}
              onClick={() => setOpenForm(v => !v)}
              startIcon={<AddIcon />}
              size="small"
              fullWidth={{ xs: true, sm: false }}
            >
              {openForm ? 'Hastalık Ekle (Kapat)' : 'Hastalık Ekle'}
            </Button>
          )}
        </Stack>

        {delErr && <Alert sx={{ mb: 1 }} severity="error" variant="filled">{delErr}</Alert>}

        <SectionList
          emptyText="Kayıtlı hastalık bulunamadı."
          items={items}
          renderItem={(d) => {
            const name = getDiseaseName(d)
            const diagDate = prettyDate(d?.dateOfDiagnosis)
            const id = getDiseaseId(d)
            return (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{
                  gap: { xs: 0.75, sm: 1 }
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={0.5}>
                    <SubRow label="Hastalık" value={name} />
                    <SubRow label="Tanı Tarihi" value={diagDate} />
                  </Stack>
                </Box>
                {canEdit && (
                  <Tooltip title="Sil">
                    <span>
                      <IconButton
                        aria-label="Sil"
                        onClick={() => deleteDisease(d)}
                        disabled={!id || delLoadingId === id}
                        sx={{
                          ml: { xs: 0, sm: 1 },
                          alignSelf: { xs: 'flex-end', sm: 'center' },
                          color: 'error.main',
                          border: '1px solid',
                          borderColor: 'rgba(244,67,54,0.4)',
                          '&:hover': {
                            bgcolor: 'rgba(244,67,54,0.15)',
                            borderColor: 'rgba(244,67,54,0.6)'
                          }
                        }}
                      >
                        {delLoadingId === id ? <CircularProgress size={18} /> : <DeleteIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            )
          }}
          getKey={(d, i) => getDiseaseId(d) ?? i}
        />

        <Collapse in={canEdit && openForm} unmountOnExit>
          <AddDiseaseForm
            onAdded={(newItem) => setItems((prev) => [newItem, ...prev])}
            onClose={() => setOpenForm(false)}
          />
        </Collapse>
      </>
    )
  }

  return null
}
