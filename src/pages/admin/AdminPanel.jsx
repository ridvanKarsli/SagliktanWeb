import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, MenuItem, Stack, Switch, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, TextField, Typography
} from '@mui/material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import {
  getAdminStats, listAdminReports, listAdminUsers, resolveAdminReport, updateAdminUser
} from '../../services/api.js'

const REPORT_STATUS_LABEL = { PENDING: 'Bekliyor', REVIEWED: 'İncelendi', REJECTED: 'Reddedildi' }
const REPORT_STATUS_COLOR = { PENDING: 'warning', REVIEWED: 'success', REJECTED: 'default' }

function StatCard({ label, value }) {
  return (
    <Box
      sx={{
        flex: '1 1 160px', p: 2.5, borderRadius: 2, bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider'
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>{value ?? '—'}</Typography>
    </Box>
  )
}

function DashboardTab({ token }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  useEffect(() => {
    setLoading(true)
    getAdminStats(token)
      .then(setStats)
      .catch(err => showError(err.message || 'İstatistikler alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, showError])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>

  return (
    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
      <StatCard label="Toplam Kayıtlı Kişi" value={stats?.totalUsers} />
      <StatCard label="Toplam Gönderi" value={stats?.totalPosts} />
      <StatCard label="Toplam Yorum" value={stats?.totalComments} />
      <StatCard label="Bekleyen Şikayet" value={stats?.pendingReports} />
    </Stack>
  )
}

function ReportsTab({ token }) {
  const [status, setStatus] = useState('PENDING')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)
  const { showError, showSuccess } = useNotification()

  const load = useCallback(() => {
    setLoading(true)
    listAdminReports(token, { status: status || undefined, size: 50 })
      .then(res => setReports(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'Şikayetler alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, status, showError])

  useEffect(() => { load() }, [load])

  const act = async (id, newStatus) => {
    setActingId(id)
    try {
      await resolveAdminReport(token, id, newStatus)
      showSuccess('Şikayet güncellendi.')
      load()
    } catch (err) {
      showError(err.message || 'Şikayet güncellenemedi.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        select size="small" label="Durum" value={status}
        onChange={e => setStatus(e.target.value)}
        sx={{ width: 200, mb: 2 }}
      >
        <MenuItem value="">Tümü</MenuItem>
        <MenuItem value="PENDING">Bekliyor</MenuItem>
        <MenuItem value="REVIEWED">İncelendi</MenuItem>
        <MenuItem value="REJECTED">Reddedildi</MenuItem>
      </TextField>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tür</TableCell>
                <TableCell>İçerik</TableCell>
                <TableCell>Sahibi</TableCell>
                <TableCell>Şikayet Eden</TableCell>
                <TableCell>Sebep</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">Aksiyon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">Kayıt yok.</TableCell></TableRow>
              )}
              {reports.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.targetType === 'POST' ? 'Gönderi' : 'Yorum'}</TableCell>
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.targetPreview}</TableCell>
                  <TableCell>{r.targetOwnerName || '—'}</TableCell>
                  <TableCell>{r.reporterName}</TableCell>
                  <TableCell sx={{ maxWidth: 160, whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.reason || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={REPORT_STATUS_LABEL[r.status] || r.status} color={REPORT_STATUS_COLOR[r.status] || 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    {r.status === 'PENDING' && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" disabled={actingId === r.id} onClick={() => act(r.id, 'REVIEWED')}>
                          İncelendi
                        </Button>
                        <Button size="small" color="inherit" disabled={actingId === r.id} onClick={() => act(r.id, 'REJECTED')}>
                          Reddet
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

function EditUserDialog({ user, onClose, onSaved, token }) {
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [bio, setBio] = useState(user.bio || '')
  const [role, setRole] = useState(user.role || 'USER')
  const [active, setActive] = useState(!!user.active)
  const [saving, setSaving] = useState(false)
  const { showError, showSuccess } = useNotification()

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) { showError('Ad ve soyad zorunludur.'); return }
    setSaving(true)
    try {
      const updated = await updateAdminUser(token, user.id, {
        firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() || null, role, active
      })
      showSuccess('Kullanıcı güncellendi.')
      onSaved(updated)
    } catch (err) {
      showError(err.message || 'Kullanıcı güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{user.email}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth />
          <TextField label="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth />
          <TextField label="Biyografi" value={bio} onChange={e => setBio(e.target.value)} fullWidth multiline minRows={2} />
          <TextField select label="Rol" value={role} onChange={e => setRole(e.target.value)} fullWidth>
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch checked={active} onChange={e => setActive(e.target.checked)} />}
            label="Hesap aktif"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Vazgeç</Button>
        <Button variant="contained" onClick={save} disabled={saving}>
          {saving ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function UsersTab({ token }) {
  const [q, setQ] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const { showError } = useNotification()

  const load = useCallback(() => {
    setLoading(true)
    listAdminUsers(token, { q: q || undefined, size: 50 })
      .then(res => setUsers(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'Kullanıcılar alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, q, showError])

  useEffect(() => { load() }, [load])

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        size="small" placeholder="Ad, soyad ya da e-posta ara..." value={q}
        onChange={e => setQ(e.target.value)}
        sx={{ width: 320, mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Doğrulanmış</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">Aksiyon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">Kayıt yok.</TableCell></TableRow>
              )}
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip size="small" label={u.role} color={u.role === 'ADMIN' ? 'primary' : 'default'} /></TableCell>
                  <TableCell>{u.emailVerified ? 'Evet' : 'Hayır'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={u.active ? 'Aktif' : 'Pasif'} color={u.active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setEditing(u)}>Düzenle</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editing && (
        <EditUserDialog
          user={editing}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
            setEditing(null)
          }}
        />
      )}
    </Box>
  )
}

export default function AdminPanel() {
  const { token } = useAuth()
  const [tab, setTab] = useState('dashboard')

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Admin Paneli</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
        <Tab value="dashboard" label="Genel Bakış" />
        <Tab value="reports" label="Şikayetler" />
        <Tab value="users" label="Kullanıcılar" />
      </Tabs>
      {tab === 'dashboard' && <DashboardTab token={token} />}
      {tab === 'reports' && <ReportsTab token={token} />}
      {tab === 'users' && <UsersTab token={token} />}
    </Box>
  )
}
