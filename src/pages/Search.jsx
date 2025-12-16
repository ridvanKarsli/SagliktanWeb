import { useMemo, useState, useEffect } from 'react'
import {
  Box, Button, Avatar, Grid, TextField, Stack, Typography, Divider,
  Alert, CircularProgress, Chip, IconButton, Tooltip, Paper, Tabs, Tab
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { Close as CloseIcon, LocalHospital as DoctorIcon, People as UserIcon } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllDoctors, getAllPublicUsers } from '../services/api.js'

const RECENT_KEY_DOCTORS = 'recent_doctors_v1'
const RECENT_KEY_USERS = 'recent_users_v1'
const MAX_RECENTS = 12
const RANDOM_COUNT = 20
const SEARCH_LIMIT = 50

function initialsFrom(name = '', surname = '') {
  const parts = `${name || ''} ${surname || ''}`.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}
function normalizeRole(role) {
  const r = String(role || '').toLowerCase()
  if (r === 'doktor' || r === 'doctor' || r === 'd') return 'Doktor'
  if (r === 'hasta' || r === 'user' || r === 'h') return 'Kullanıcı'
  return role || '—'
}
function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}
function loadRecents(type) {
  const key = type === 'doctor' ? RECENT_KEY_DOCTORS : RECENT_KEY_USERS
  try {
    const raw = localStorage.getItem(key)
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
function saveRecents(list, type) {
  const key = type === 'doctor' ? RECENT_KEY_DOCTORS : RECENT_KEY_USERS
  try { localStorage.setItem(key, JSON.stringify(list)) } catch {}
}
function upsertRecent(user, current, type) {
  const key = `${user.userID}-${(user.email || '').toLowerCase()}`
  const filtered = current.filter(r => `${r.userID}-${(r.email || '').toLowerCase()}` !== key)
  const now = new Date().toISOString()
  const next = [{ ...user, _ts: now }, ...filtered].slice(0, MAX_RECENTS)
  saveRecents(next, type)
  return next
}
function pickRandom(arr, n) {
  if (arr.length <= n) return [...arr]
  const a = [...arr]
  for (let i = a.length - 1; i > a.length - 1 - n; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(-n)
}

export default function Search() {
  const { token } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()
  const params = new URLSearchParams(loc.search)
  const initialQ = params.get('q') || ''
  const initialTab = params.get('tab') || 'doctor' // 'doctor' veya 'user'

  const [q, setQ] = useState(initialQ)
  const [activeTab, setActiveTab] = useState(initialTab === 'user' ? 1 : 0)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState('')
  const [doctors, setDoctors] = useState([])
  const [users, setUsers] = useState([])
  const [recents, setRecents] = useState(loadRecents(initialTab === 'user' ? 'user' : 'doctor'))
  const [randomBlock, setRandomBlock] = useState([])

  useEffect(() => { setQ(initialQ) }, [initialQ])
  useEffect(() => {
    const tab = activeTab === 0 ? 'doctor' : 'user'
    const currentTab = params.get('tab') || 'doctor'
    if (currentTab !== tab) {
      const sp = new URLSearchParams(loc.search)
      sp.set('tab', tab)
      nav(`/search${sp.toString() ? `?${sp.toString()}` : ''}`, { replace: true })
    }
    setRecents(loadRecents(tab))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Doktorları yükle
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    async function loadDoctors() {
      if (!token) return
      if (doctors.length > 0) {
        // Zaten yüklenmişse, sadece random block'u güncelle
        if (activeTab === 0) {
          setRandomBlock(pickRandom(doctors, RANDOM_COUNT))
        }
        return
      }
      setLoadingDoctors(true); setError('')
      try {
        const list = await getAllDoctors(token, { signal: controller.signal })
        if (!mounted) return
        const seen = new Set()
        const uniq = []
        for (const d of list) {
          const key = `${d.userID}-${(d.email || '').toLowerCase()}`
          if (!seen.has(key)) { uniq.push(d); seen.add(key) }
        }
        setDoctors(uniq)
        if (activeTab === 0) {
          setRandomBlock(pickRandom(uniq, RANDOM_COUNT))
        }
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Doktorlar alınamadı.')
      } finally {
        if (mounted) setLoadingDoctors(false)
      }
    }
    loadDoctors()
    return () => { mounted = false; controller.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Kullanıcıları yükle
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    async function loadUsers() {
      if (!token) return
      if (users.length > 0) {
        // Zaten yüklenmişse, sadece random block'u güncelle
        if (activeTab === 1) {
          setRandomBlock(pickRandom(users, RANDOM_COUNT))
        }
        return
      }
      setLoadingUsers(true); setError('')
      try {
        const list = await getAllPublicUsers(token, { signal: controller.signal })
        if (!mounted) return
        const seen = new Set()
        const uniq = []
        for (const u of list) {
          const key = `${u.userID}-${(u.email || '').toLowerCase()}`
          if (!seen.has(key)) { uniq.push(u); seen.add(key) }
        }
        setUsers(uniq)
        if (activeTab === 1) {
          setRandomBlock(pickRandom(uniq, RANDOM_COUNT))
        }
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Kullanıcılar alınamadı.')
      } finally {
        if (mounted) setLoadingUsers(false)
      }
    }
    loadUsers()
    return () => { mounted = false; controller.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Tab değiştiğinde random block'u güncelle
  useEffect(() => {
    if (activeTab === 0 && doctors.length > 0) {
      setRandomBlock(pickRandom(doctors, RANDOM_COUNT))
    } else if (activeTab === 1 && users.length > 0) {
      setRandomBlock(pickRandom(users, RANDOM_COUNT))
    }
  }, [activeTab, doctors, users])

  const loading = activeTab === 0 ? loadingDoctors : loadingUsers

  const currentList = activeTab === 0 ? doctors : users
  const currentType = activeTab === 0 ? 'doctor' : 'user'

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    const filtered = currentList.filter(u => {
      const name = `${u.name || ''} ${u.surname || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const role = normalizeRole(u.role).toLowerCase()
      return name.includes(s) || email.includes(s) || role.includes(s)
    })
    return filtered.slice(0, SEARCH_LIMIT)
  }, [q, currentList])

  const onSearchSubmit = (e) => {
    e.preventDefault()
    const next = q.trim()
    const sp = new URLSearchParams(loc.search)
    if (next) sp.set('q', next); else sp.delete('q')
    sp.set('tab', currentType)
    nav(`/search${sp.toString() ? `?${sp.toString()}` : ''}`)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setQ('')
    const sp = new URLSearchParams()
    sp.set('tab', newValue === 0 ? 'doctor' : 'user')
    nav(`/search?${sp.toString()}`, { replace: true })
  }

  const visitProfile = (user) => {
    if (!user?.userID) return
    const next = upsertRecent({
      userID: user.userID,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      dateOfBirth: user.dateOfBirth
    }, recents, currentType)
    setRecents(next)
    nav(`/profile?userID=${encodeURIComponent(user.userID)}`)
  }

  const clearRecents = () => { 
    saveRecents([], currentType)
    setRecents([]) 
  }

  const SectionItem = ({ u }) => {
    const role = normalizeRole(u.role)
    const nameFull = [u.name, u.surname].filter(Boolean).join(' ') || `Kullanıcı #${u.userID}`
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          mb: 1.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.12)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Stack 
          direction="row" 
          spacing={{ xs: 1.5, sm: 2 }} 
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'secondary.main', 
                fontWeight: 800, 
                width: { xs: 48, sm: 52 }, 
                height: { xs: 48, sm: 52 },
                fontSize: { xs: 16, sm: 18 }
              }}
              aria-label={`${nameFull} avatarı`}
            >
              {initialsFrom(u.name, u.surname)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  color: 'text.primary',
                  wordBreak: 'break-word'
                }}
              >
                {nameFull}
              </Typography>
              <Chip 
                label={role} 
                size="small" 
                variant="outlined"
                sx={{ 
                  height: 24, 
                  fontSize: '0.75rem',
                  borderColor: 'rgba(255,255,255,0.2)', 
                  color: 'text.secondary',
                  fontWeight: 500
                }} 
              />
            </Box>
          </Stack>
          <Button 
            onClick={() => visitProfile(u)} 
            variant="contained" 
            sx={{ 
              whiteSpace: 'nowrap', 
              minHeight: { xs: 48, sm: 40 },
              minWidth: { xs: 100, sm: 120 },
              fontSize: { xs: '13px', sm: '14px' },
              fontWeight: 600,
              flexShrink: 0,
              px: { xs: 1.5, sm: 2 }
            }}
          >
            Profili Gör
          </Button>
        </Stack>
      </Paper>
    )
  }

  return (
    <Box sx={{ py: { xs: 1.5, md: 3 }, px: { xs: 0.5, sm: 0 } }}>
      {/* Başlık ve Sekmeler */}
      <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 24, md: 28 } }}>
          Kişi Ara
        </Typography>
        
        {/* Tab'lar */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 2, sm: 3 }
            }
          }}
        >
          <Tab 
            icon={<DoctorIcon sx={{ mb: 0.5 }} />} 
            iconPosition="start"
            label="Doktor Ara" 
          />
          <Tab 
            icon={<UserIcon sx={{ mb: 0.5 }} />} 
            iconPosition="start"
            label="Kullanıcı Ara" 
          />
        </Tabs>

        {/* Arama Kutusu */}
        <Box component="form" onSubmit={onSearchSubmit}>
          <TextField
            fullWidth
            placeholder={activeTab === 0 ? "Doktor ara… (isim, uzmanlık alanı)" : "Kullanıcı ara… (isim, e-posta)"}
            value={q}
            onChange={e => setQ(e.target.value)}
            size="medium"
            InputLabelProps={{ shrink: false }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '16px', sm: '16px' },
                minHeight: { xs: 48, md: 40 }
              }
            }}
          />
        </Box>
      </Stack>

      {error && <Alert severity="error" variant="filled" sx={{ mb: 1 }}>{error}</Alert>}
      {loading && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      )}

      {!loading && !error && (
        <>
          {q.trim() ? (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {results.length} sonuç bulundu
              </Typography>
              {results.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: { xs: 8, md: 10 },
                    px: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <Box
                    component="img"
                    src="/Lumo.png"
                    alt="Lumo"
                    sx={{ 
                      width: { xs: 140, md: 180 }, 
                      height: 'auto', 
                      mb: 3, 
                      mx: 'auto',
                      display: 'block',
                      maxWidth: '100%',
                      filter: 'drop-shadow(0 6px 20px rgba(52,195,161,0.2))'
                    }}
                  />
                  <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
                    Sonuç bulunamadı
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                    Farklı bir arama terimi deneyin
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {results.map((u, i) => (
                    <SectionItem key={`${u.userID}-${u.email}-${i}`} u={u} />
                  ))}
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack spacing={4}>
              {/* Son Arananlar */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 } }}>
                    Son Arananlar
                  </Typography>
                  {recents.length > 0 && (
                    <Tooltip title="Geçmişi temizle">
                      <IconButton 
                        size="small" 
                        onClick={clearRecents} 
                        aria-label="Geçmişi temizle"
                        sx={{ 
                          color: 'text.secondary', 
                          '&:hover': { 
                            color: 'text.primary',
                            backgroundColor: 'rgba(255,255,255,0.05)'
                          } 
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                {recents.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                      Henüz arama geçmişiniz yok.
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={1.5}>
                    {recents.map((u, i) => (
                      <SectionItem key={`recent-${u.userID}-${u.email}-${i}`} u={u} />
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Keşfet */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: 18, sm: 20 } }}>
                  Keşfet
                </Typography>
                <Stack spacing={1.5}>
                  {randomBlock.map((u, i) => (
                    <SectionItem key={`rnd-${u.userID}-${u.email}-${i}`} u={u} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </>
      )}
    </Box>
  )
}
