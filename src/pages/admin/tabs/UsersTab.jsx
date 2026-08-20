import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, MenuItem, Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import { listAdminUsers, updateAdminUser } from '../../../services/api.js'

// AdminPanel.jsx'ten ayrı bir dosyaya taşındı (bkz. clean-code audit).

function EditUserDialog({ user, onClose, onSaved, token }) {
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [bio, setBio] = useState(user.bio || '')
  const [role, setRole] = useState(user.role || 'USER')
  const [active, setActive] = useState(!!user.active)
  const [saving, setSaving] = useState(false)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) { showError('Ad ve soyad zorunludur.'); return }
    // Faz8-5: rol/aktiflik burada tek dokunuşla değişip kaydediliyordu -
    // uygulamanın her yerinde yıkıcı/hassas aksiyonlar useConfirm() ile
    // onaylatılırken, dokunmatik ekranda kolayca yanlışlıkla tıklanabilecek
    // bir Switch/Select ile yetki yükseltme ya da hesap pasifleştirme
    // istisnaydı. Sadece GERÇEKTEN değişen hassas alanlar için soruyoruz -
    // ad/soyad/bio düzenlemesi her seferinde onay istemeyi gereksiz
    // yorucu hale getirmesin diye.
    const roleChanged = role !== (user.role || 'USER')
    const activeChanged = active !== !!user.active
    if (roleChanged || activeChanged) {
      const parts = []
      if (roleChanged) parts.push(role === 'ADMIN' ? 'rolünü ADMIN yapmak' : 'admin yetkisini kaldırmak')
      if (activeChanged) parts.push(active ? 'hesabını yeniden aktifleştirmek' : 'hesabını pasifleştirmek')
      const ok = await confirm(
        `${user.email} kullanıcısının ${parts.join(' ve ')} istiyor musun?`,
        { title: 'Hassas değişikliği onayla' }
      )
      if (!ok) return
    }
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
          <TextField
            label="Biyografi" value={bio} onChange={e => setBio(e.target.value)}
            fullWidth multiline minRows={2} slotProps={{ htmlInput: { 'data-testid': 'edit-user-bio' } }}
          />
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

function UserCard({ u, onEdit }) {
  return (
    // width/minWidth/overflow üçlüsü: ContentTab.jsx#ContentCard ile aynı
    // gerekçe - mobilde metin kart sınırını taşıp overflow-x:hidden (bkz.
    // index.css) yüzünden sağ tarafın sessizce kırpılmasını önlüyor.
    <Box
      sx={{
        p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        width: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{u.email}</Typography>
        </Box>
        <Button size="small" onClick={() => onEdit(u)} sx={{ flexShrink: 0 }}>Düzenle</Button>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={u.role} color={u.role === 'ADMIN' ? 'primary' : 'default'} />
        <Chip size="small" label={u.active ? 'Aktif' : 'Pasif'} color={u.active ? 'success' : 'default'} />
        <Chip size="small" variant="outlined" label={u.emailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'} />
      </Stack>
    </Box>
  )
}

export default function UsersTab({ token }) {
  const theme = useTheme()
  // Faz8-5: ReportsTab.jsx'teki aynı fix - eşik tablonun minWidth'iyle
  // eşleşsin diye down('md') (900px) kullanılıyor. Önceden down('sm')
  // (600px) idi ve tabloda minWidth yoktu - 600-900px arası (tablet)
  // kullanıcılar 6 sütunu yatay kaydırmadan okuyamıyordu.
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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
        sx={{ width: { xs: '100%', sm: 320 }, mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {users.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Kayıt yok.</Typography>
          )}
          {users.map(u => (
            <UserCard key={u.id} u={u} onEdit={setEditing} />
          ))}
        </Stack>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 700 }}>
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
                  <TableCell sx={{ maxWidth: 220, whiteSpace: 'normal', wordBreak: 'break-word' }}>{u.email}</TableCell>
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
