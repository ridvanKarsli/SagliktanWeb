import { useMemo, useState, useEffect } from 'react'
import {
  Box, Button, Avatar, Grid, TextField, Stack, Typography, Divider,
  Alert, CircularProgress, Chip, IconButton, Tooltip
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { Close as CloseIcon } from '@mui/icons-material'
import Surface from '../components/Surface.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getAllUsers } from '../services/api.js'

const RECENT_KEY = 'recent_users_v1'
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
function loadRecents() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
function saveRecents(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)) } catch {}
}
function upsertRecent(user, current) {
  const key = `${user.userID}-${(user.email || '').toLowerCase()}`
  const filtered = current.filter(r => `${r.userID}-${(r.email || '').toLowerCase()}` !== key)
  const now = new Date().toISOString()
  const next = [{ ...user, _ts: now }, ...filtered].slice(0, MAX_RECENTS)
  saveRecents(next)
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

  const [q, setQ] = useState(initialQ)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [recents, setRecents] = useState(loadRecents())
  const [randomBlock, setRandomBlock] = useState([])

  useEffect(() => { setQ(initialQ) }, [initialQ])

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    async function load() {
      if (!token) { setLoading(false); setError('Oturum bulunamadı.'); return }
      setLoading(true); setError('')
      try {
        const list = await getAllUsers(token, { signal: controller.signal })
        if (!mounted) return
        const seen = new Set()
        const uniq = []
        for (const u of list) {
          const key = `${u.userID}-${(u.email || '').toLowerCase()}`
          if (!seen.has(key)) { uniq.push(u); seen.add(key) }
        }
        setUsers(uniq)
        setRandomBlock(pickRandom(uniq, RANDOM_COUNT))
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Kullanıcılar alınamadı.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false; controller.abort() }
  }, [token])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    const filtered = users.filter(u => {
      const name = `${u.name || ''} ${u.surname || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      const role = normalizeRole(u.role).toLowerCase()
      return name.includes(s) || email.includes(s) || role.includes(s)
    })
    return filtered.slice(0, SEARCH_LIMIT)
  }, [q, users])

  const onSearchSubmit = (e) => {
    e.preventDefault()
    const next = q.trim()
    const sp = new URLSearchParams(loc.search)
    if (next) sp.set('q', next); else sp.delete('q')
    nav(`/search${sp.toString() ? `?${sp.toString()}` : ''}`)
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
    }, recents)
    setRecents(next)
    nav(`/profile?userID=${encodeURIComponent(user.userID)}`)
  }

  const clearRecents = () => { saveRecents([]); setRecents([]) }

  const SectionItem = ({ u, showDivider }) => {
    const role = normalizeRole(u.role)
    const nameFull = [u.name, u.surname].filter(Boolean).join(' ') || `Kullanıcı #${u.userID}`
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: { xs: 0.5, md: 1 } }}>
          <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800, width: 44, height: 44 }}
                  aria-label={`${nameFull} avatarı`}>
            {initialsFrom(u.name, u.surname)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} noWrap title={nameFull}>{nameFull}</Typography>
              <Chip label={role} size="small" variant="outlined"
                    sx={{ height: 22, borderColor: 'rgba(255,255,255,0.24)', color: 'rgba(255,255,255,0.9)' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap title={u.email}>
              {u.email}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Doğum Tarihi: {prettyDate(u.dateOfBirth)}
            </Typography>
          </Box>
          <Button onClick={() => visitProfile(u)} size="small" variant="contained" sx={{ whiteSpace: 'nowrap', minHeight: 36 }}>
            Profili Gör
          </Button>
        </Box>
        {showDivider && <Divider sx={{ opacity: 0.16 }} />}
      </Box>
    )
  }

  return (
    <Surface sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={1.25} component="form" onSubmit={onSearchSubmit} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24, md: 28 } }}>
          Kişi Ara
        </Typography>
        <TextField
          fullWidth
          placeholder="Uzman veya kullanıcı ara…"
          value={q}
          onChange={e => setQ(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: false }}
          sx={{
            '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1.2 },
            '& .MuiInputBase-input': { color: '#FAF9F6' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.85)' }
          }}
        />
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
            <>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {results.length} sonuç (ilk {Math.min(results.length, SEARCH_LIMIT)})
              </Typography>
              <Grid container>
                {results.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Sonuç bulunamadı.
                    </Typography>
                  </Grid>
                )}
                {results.map((u, i) => (
                  <Grid item xs={12} key={`${u.userID}-${u.email}-${i}`}>
                    <SectionItem u={u} showDivider={i < results.length - 1} />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Son Arananlar</Typography>
                {recents.length > 0 && (
                  <Tooltip title="Geçmişi temizle">
                    <IconButton size="small" onClick={clearRecents} aria-label="Geçmişi temizle"
                      sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
              {recents.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Henüz arama geçmişiniz yok.
                </Typography>
              ) : (
                <Grid container sx={{ mb: 2 }}>
                  {recents.map((u, i) => (
                    <Grid item xs={12} key={`recent-${u.userID}-${u.email}-${i}`}>
                      <SectionItem u={u} showDivider={i < recents.length - 1} />
                    </Grid>
                  ))}
                </Grid>
              )}

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Keşfet (Rastgele 20)</Typography>
              <Grid container>
                {randomBlock.map((u, i) => (
                  <Grid item xs={12} key={`rnd-${u.userID}-${u.email}-${i}`}>
                    <SectionItem u={u} showDivider={i < randomBlock.length - 1} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Surface>
  )
}
