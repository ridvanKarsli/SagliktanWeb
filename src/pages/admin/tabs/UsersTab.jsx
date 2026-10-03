import { useEffect, useState } from 'react'
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, MenuItem, Stack, Switch, TextField, Typography
} from '@mui/material'
import { PeopleAltOutlined, ShieldOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import { listAdminUsers, updateAdminUser } from '../../../services/api.js'
import { usePaginatedList } from '../../../hooks/usePaginatedList.js'
import { initialsFrom, relativeTime } from '../../../utils/format.js'
import { clickableProps } from '../../../utils/clickable.js'
import { AdminCard, AdminEmpty, AdminList, AdminLoading, AdminSearch, LoadMoreButton, SegmentedFilter } from '../AdminUi.jsx'

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
    // Hassas alanlar (rol/aktiflik) sadece GERÇEKTEN değiştiyse onay ister.
    const roleChanged = role !== (user.role || 'USER')
    const activeChanged = active !== !!user.active
    if (roleChanged || activeChanged) {
      const parts = []
      if (roleChanged) parts.push(role === 'ADMIN' ? 'rolünü ADMIN yapmak' : 'admin yetkisini kaldırmak')
      if (activeChanged) parts.push(active ? 'hesabını yeniden aktifleştirmek' : 'hesabını pasifleştirmek')
      const ok = await confirm(
        `${user.email} kullanıcısının ${parts.join(' ve ')} istiyor musun?`,
        { title: 'Hassas değişikliği onayla', confirmLabel: 'Onayla' }
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
      <DialogTitle sx={{ wordBreak: 'break-all' }}>{user.email}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Ad" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth />
            <TextField label="Soyad" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth />
          </Stack>
          <TextField
            label="Biyografi" value={bio} onChange={e => setBio(e.target.value)}
            fullWidth multiline minRows={2} slotProps={{ htmlInput: { 'data-testid': 'edit-user-bio', maxLength: 500 } }}
          />
          <TextField select label="Rol" value={role} onChange={e => setRole(e.target.value)} fullWidth>
            <MenuItem value="USER">Kullanıcı</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch checked={active} onChange={e => setActive(e.target.checked)} />}
            label={active ? 'Hesap aktif' : 'Hesap pasif - giriş yapamaz'}
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
  const navigate = useNavigate()
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'İsimsiz'
  return (
    <AdminCard sx={{ opacity: u.active ? 1 : 0.7 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          {...clickableProps(() => navigate(`/users/${u.id}`))}
          aria-label={`${name} profiline git`}
          sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, flexShrink: 0, cursor: 'pointer' }}
        >
          {initialsFrom(name)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.25 }} noWrap>{name}</Typography>
            {u.role === 'ADMIN' && <ShieldOutlined sx={{ fontSize: 16, color: 'primary.main' }} titleAccess="Admin" />}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-all' }}>{u.email}</Typography>
        </Box>
        <Button size="small" variant="outlined" onClick={() => onEdit(u)} sx={{ flexShrink: 0, minHeight: 36 }}>Düzenle</Button>
      </Stack>
      <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap alignItems="center">
        {!u.active && <Chip size="small" label="Pasif" />}
        {!u.emailVerified && <Chip size="small" label="Doğrulanmamış" color="warning" variant="outlined" />}
        {u.active && u.emailVerified && <Chip size="small" label="Aktif" color="success" variant="outlined" />}
        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto !important' }} noWrap>
          {relativeTime(u.createdAt)} katıldı
        </Typography>
      </Stack>
    </AdminCard>
  )
}

export default function UsersTab({ token }) {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [filter, setFilter] = useState('all') // all | admin | inactive | unverified
  const [editing, setEditing] = useState(null)
  const { showError } = useNotification()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const params = filter === 'admin' ? { role: 'ADMIN' } : filter === 'inactive' ? { active: false } : {}

  const {
    items: users, setItems: setUsers, loading, loadingMore, last, totalCount, loadMore,
  } = usePaginatedList(
    (pageNum) => listAdminUsers(token, { q: debouncedQ || undefined, ...params, page: pageNum, size: 30 }),
    { deps: [token, debouncedQ, filter], onError: (err) => showError(err.message || 'Kullanıcılar alınamadı.') }
  )

  const shown = filter === 'unverified' ? users.filter(u => !u.emailVerified) : users

  return (
    <Stack spacing={2}>
      <AdminSearch value={q} onChange={setQ} placeholder="Ad, soyad ya da e-posta ara..." />
      <SegmentedFilter
        ariaLabel="Kullanıcı filtresi"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tümü' },
          { value: 'admin', label: 'Adminler' },
          { value: 'inactive', label: 'Pasif' },
          { value: 'unverified', label: 'Doğrulanmamış' },
        ]}
      />

      {loading ? <AdminLoading /> : shown.length === 0 ? (
        <AdminEmpty icon={PeopleAltOutlined} title="Kullanıcı bulunamadı" description={debouncedQ ? 'Aramayı değiştirip tekrar dene.' : undefined} />
      ) : (
        <AdminList>
          {shown.map(u => <UserCard key={u.id} u={u} onEdit={setEditing} />)}
        </AdminList>
      )}

      {!loading && !last && <LoadMoreButton loading={loadingMore} shown={users.length} total={totalCount} onClick={loadMore} noun="kullanıcı" />}

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
    </Stack>
  )
}
