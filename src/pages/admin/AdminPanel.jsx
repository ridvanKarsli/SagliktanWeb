import { useCallback, useEffect, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch,
  Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material'
import { DeleteOutline, EditOutlined, ExpandMoreRounded } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import {
  createDiseaseGroup, createSubGroup, deleteComment, deleteDiseaseGroup, deletePost, deleteSubGroup,
  getAdminStats, listAdminComments, listAdminPosts, listAdminReports, listAdminUsers,
  listDiseaseGroups, listSubGroups, resolveAdminReport, updateAdminUser, updateDiseaseGroup,
  updateSubGroup
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

  const act = async (id, newStatus, deleteContent = false) => {
    setActingId(id)
    try {
      await resolveAdminReport(token, id, newStatus, deleteContent)
      showSuccess(deleteContent ? 'İçerik silindi.' : 'Şikayet güncellendi.')
      load()
    } catch (err) {
      showError(err.message || 'Şikayet güncellenemedi.')
    } finally {
      setActingId(null)
    }
  }

  const deleteContent = (r) => {
    const label = r.targetType === 'POST' ? 'gönderiyi' : 'yorumu'
    if (!window.confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`)) return
    act(r.id, 'REVIEWED', true)
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
                        <Button size="small" color="error" disabled={actingId === r.id} onClick={() => deleteContent(r)}>
                          İçeriği Sil
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

function ContentTab({ token }) {
  const [type, setType] = useState('posts') // 'posts' | 'comments'
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const { showError, showSuccess } = useNotification()

  const load = useCallback(() => {
    setLoading(true)
    const fetcher = type === 'posts' ? listAdminPosts : listAdminComments
    fetcher(token, { q: q || undefined, size: 50 })
      .then(res => setItems(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'İçerik alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, type, q, showError])

  useEffect(() => { load() }, [load])

  const remove = async (item) => {
    const label = type === 'posts' ? 'gönderiyi' : 'yorumu'
    if (!window.confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`)) return
    setDeletingId(item.id)
    try {
      if (type === 'posts') await deletePost(token, item.id)
      else await deleteComment(token, item.id)
      showSuccess('Silindi.')
      load()
    } catch (err) {
      showError(err.message || 'Silinemedi.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup size="small" value={type} exclusive onChange={(_, v) => v && setType(v)}>
          <ToggleButton value="posts">Gönderiler</ToggleButton>
          <ToggleButton value="comments">Yorumlar</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small" placeholder="İçerikte ara..." value={q}
          onChange={e => setQ(e.target.value)}
          sx={{ width: 280 }}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {type === 'posts' && <TableCell>Başlık</TableCell>}
                <TableCell>İçerik</TableCell>
                <TableCell>Yazar</TableCell>
                {type === 'comments' && <TableCell>Durum</TableCell>}
                <TableCell>Tarih</TableCell>
                <TableCell align="right">Aksiyon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">Kayıt yok.</TableCell></TableRow>
              )}
              {items.map(item => (
                <TableRow key={item.id}>
                  {type === 'posts' && (
                    <TableCell sx={{ maxWidth: 160, whiteSpace: 'normal', wordBreak: 'break-word' }}>{item.title}</TableCell>
                  )}
                  <TableCell sx={{ maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {item.content}
                  </TableCell>
                  <TableCell>{item.authorName}</TableCell>
                  {type === 'comments' && (
                    <TableCell>
                      <Chip size="small" label={item.deleted ? 'Silinmiş' : 'Aktif'} color={item.deleted ? 'default' : 'success'} />
                    </TableCell>
                  )}
                  <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : ''}</TableCell>
                  <TableCell align="right">
                    {!(type === 'comments' && item.deleted) && (
                      <Button size="small" color="error" disabled={deletingId === item.id} onClick={() => remove(item)}>
                        Sil
                      </Button>
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

function GroupNameDialog({ title, initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [saving, setSaving] = useState(false)
  const { showError } = useNotification()

  const save = async () => {
    if (!name.trim()) { showError('Ad zorunludur.'); return }
    setSaving(true)
    try {
      await onSave({ name: name.trim(), description: description.trim() })
    } catch (err) {
      showError(err.message || 'Kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Ad" value={name} onChange={e => setName(e.target.value)} fullWidth autoFocus />
          <TextField
            label="Açıklama" value={description} onChange={e => setDescription(e.target.value)}
            fullWidth multiline minRows={2}
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

function SubGroupRow({ subGroup, token, onChanged }) {
  const [dialog, setDialog] = useState(null) // null | 'edit'
  const { showError, showSuccess } = useNotification()

  const remove = async () => {
    if (!window.confirm(`"${subGroup.name}" alt grubunu silmek istiyor musun? İçindeki tüm gönderiler de silinir.`)) return
    try {
      await deleteSubGroup(token, subGroup.id)
      showSuccess('Alt grup silindi.')
      onChanged()
    } catch (err) {
      showError(err.message || 'Alt grup silinemedi.')
    }
  }

  return (
    <Stack
      direction="row" alignItems="center" justifyContent="space-between"
      sx={{ py: 1, px: 2, borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{subGroup.name}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subGroup.postCount} sohbet</Typography>
      </Box>
      <Stack direction="row" spacing={0.5}>
        <IconButton size="small" onClick={() => setDialog('edit')}><EditOutlined fontSize="small" /></IconButton>
        <IconButton size="small" onClick={remove}><DeleteOutline fontSize="small" /></IconButton>
      </Stack>
      {dialog === 'edit' && (
        <GroupNameDialog
          title="Alt Grubu Düzenle"
          initial={subGroup}
          onClose={() => setDialog(null)}
          onSave={async (data) => {
            await updateSubGroup(token, subGroup.id, data)
            showSuccess('Alt grup güncellendi.')
            setDialog(null)
            onChanged()
          }}
        />
      )}
    </Stack>
  )
}

function DiseaseGroupAccordion({ group, token, onChanged }) {
  const [subGroups, setSubGroups] = useState(null)
  const [dialog, setDialog] = useState(null) // null | 'edit' | 'newSub'
  const { showError, showSuccess } = useNotification()

  const loadSubGroups = useCallback(() => {
    listSubGroups(token, group.id).then(setSubGroups).catch(() => setSubGroups([]))
  }, [token, group.id])

  const remove = async (e) => {
    e.stopPropagation()
    if (!window.confirm(`"${group.name}" hastalık grubunu silmek istiyor musun? Tüm alt gruplar ve içerikler de silinir.`)) return
    try {
      await deleteDiseaseGroup(token, group.id)
      showSuccess('Grup silindi.')
      onChanged()
    } catch (err) {
      showError(err.message || 'Grup silinemedi.')
    }
  }

  return (
    <Accordion onChange={(_, expanded) => { if (expanded && subGroups === null) loadSubGroups() }}>
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{group.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{group.memberCount} üye</Typography>
          </Box>
          <Stack direction="row" spacing={0.5} onClick={e => e.stopPropagation()}>
            <IconButton size="small" onClick={() => setDialog('edit')}><EditOutlined fontSize="small" /></IconButton>
            <IconButton size="small" onClick={remove}><DeleteOutline fontSize="small" /></IconButton>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {subGroups === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={18} /></Box>
        ) : (
          <>
            {subGroups.map(sg => (
              <SubGroupRow key={sg.id} subGroup={sg} token={token} onChanged={loadSubGroups} />
            ))}
            <Box sx={{ p: 1.5 }}>
              <Button size="small" onClick={() => setDialog('newSub')}>+ Alt Grup Ekle</Button>
            </Box>
          </>
        )}
      </AccordionDetails>

      {dialog === 'edit' && (
        <GroupNameDialog
          title="Hastalık Grubunu Düzenle"
          initial={group}
          onClose={() => setDialog(null)}
          onSave={async (data) => {
            await updateDiseaseGroup(token, group.id, data)
            showSuccess('Grup güncellendi.')
            setDialog(null)
            onChanged()
          }}
        />
      )}
      {dialog === 'newSub' && (
        <GroupNameDialog
          title="Yeni Alt Grup"
          onClose={() => setDialog(null)}
          onSave={async (data) => {
            await createSubGroup(token, group.id, data)
            showSuccess('Alt grup oluşturuldu.')
            setDialog(null)
            loadSubGroups()
          }}
        />
      )}
    </Accordion>
  )
}

function GroupsTab({ token }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { showError, showSuccess } = useNotification()

  const load = useCallback(() => {
    setLoading(true)
    listDiseaseGroups(token)
      .then(res => setGroups(Array.isArray(res) ? res : []))
      .catch(err => showError(err.message || 'Gruplar alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, showError])

  useEffect(() => { load() }, [load])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="contained" size="small" sx={{ mb: 2 }} onClick={() => setCreating(true)}>
        + Yeni Hastalık Grubu
      </Button>

      <Stack spacing={1}>
        {groups.map(g => (
          <DiseaseGroupAccordion key={g.id} group={g} token={token} onChanged={load} />
        ))}
        {groups.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Henüz hastalık grubu yok.
          </Typography>
        )}
      </Stack>

      {creating && (
        <GroupNameDialog
          title="Yeni Hastalık Grubu"
          onClose={() => setCreating(false)}
          onSave={async (data) => {
            await createDiseaseGroup(token, data)
            showSuccess('Grup oluşturuldu.')
            setCreating(false)
            load()
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
        <Tab value="content" label="İçerik" />
        <Tab value="users" label="Kullanıcılar" />
        <Tab value="groups" label="Gruplar" />
      </Tabs>
      {tab === 'dashboard' && <DashboardTab token={token} />}
      {tab === 'reports' && <ReportsTab token={token} />}
      {tab === 'content' && <ContentTab token={token} />}
      {tab === 'users' && <UsersTab token={token} />}
      {tab === 'groups' && <GroupsTab token={token} />}
    </Box>
  )
}
