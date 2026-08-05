import { useCallback, useEffect, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch,
  Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ChatBubbleOutlineRounded, DeleteOutline, DescriptionOutlined, EditOutlined, ExpandMoreRounded,
  FlagOutlined, GroupsRounded, PeopleAltRounded
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import {
  createDiseaseGroup, createSubGroup, deleteComment, deleteDiseaseGroup, deletePost, deleteSubGroup,
  getAdminStats, listAdminComments, listAdminPosts, listAdminReports, listAdminUsers,
  listDiseaseGroups, listSubGroups, resolveAdminReport, updateAdminUser, updateDiseaseGroup,
  updateSubGroup
} from '../../services/api.js'
import { prettyDate } from '../../utils/format.js'

const REPORT_STATUS_LABEL = { PENDING: 'Bekliyor', REVIEWED: 'İncelendi', REJECTED: 'Reddedildi' }
const REPORT_STATUS_COLOR = { PENDING: 'warning', REVIEWED: 'success', REJECTED: 'default' }

// Renk adı MUI theme palette anahtarına karşılık geliyor (ör. 'warning' ->
// theme.palette.warning.main) - StatCard'ın arka plan/ikon rengini buradan
// türetiyoruz ki bekleyen şikayet gibi "dikkat çekmesi gereken" kartlar
// diğerlerinden görsel olarak ayrışsın.
function StatCard({ label, value, icon, color = 'primary', highlight = false }) {
  return (
    <Box
      sx={{
        flex: '1 1 200px', p: 2.5, borderRadius: 3, bgcolor: 'background.paper',
        border: '1px solid', borderColor: highlight ? `${color}.main` : 'divider',
        display: 'flex', alignItems: 'center', gap: 2
      }}
    >
      <Box
        sx={{
          width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: (t) => `linear-gradient(135deg, ${t.palette[color].main}33, ${t.palette[color].main}14)`,
          color: `${color}.main`
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.25 }}>{value ?? '—'}</Typography>
      </Box>
    </Box>
  )
}

function DashboardTab({ token }) {
  const [stats, setStats] = useState(null)
  const [groupCount, setGroupCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAdminStats(token),
      listDiseaseGroups(token).catch(() => [])
    ])
      .then(([statsRes, groups]) => {
        setStats(statsRes)
        setGroupCount(Array.isArray(groups) ? groups.length : null)
      })
      .catch(err => showError(err.message || 'İstatistikler alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, showError])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>

  const pending = stats?.pendingReports ?? 0

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Platformun genel durumuna hızlı bir bakış.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <StatCard label="Toplam Kayıtlı Kişi" value={stats?.totalUsers} icon={<PeopleAltRounded />} color="primary" />
        <StatCard label="Toplam Gönderi" value={stats?.totalPosts} icon={<DescriptionOutlined />} color="secondary" />
        <StatCard label="Toplam Yorum" value={stats?.totalComments} icon={<ChatBubbleOutlineRounded />} color="secondary" />
        <StatCard label="Hastalık Grubu" value={groupCount} icon={<GroupsRounded />} color="primary" />
        <StatCard
          label="Bekleyen Şikayet"
          value={pending}
          icon={<FlagOutlined />}
          color={pending > 0 ? 'warning' : 'success'}
          highlight={pending > 0}
        />
      </Stack>
    </Box>
  )
}

function ReportActions({ r, actingId, act, deleteContent }) {
  if (r.status !== 'PENDING') return null
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
  )
}

function ReportCard({ r, actingId, act, deleteContent }) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
        <Chip size="small" label={r.targetType === 'POST' ? 'Gönderi' : 'Yorum'} />
        <Chip size="small" label={REPORT_STATUS_LABEL[r.status] || r.status} color={REPORT_STATUS_COLOR[r.status] || 'default'} />
      </Stack>
      <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>{r.targetPreview}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        Sahibi: {r.targetOwnerName || '—'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: r.reason ? 0.5 : 1.5 }}>
        Şikayet Eden: {r.reporterName}
      </Typography>
      {r.reason && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5, wordBreak: 'break-word' }}>
          Sebep: {r.reason}
        </Typography>
      )}
      <ReportActions r={r} actingId={actingId} act={act} deleteContent={deleteContent} />
    </Box>
  )
}

function ReportsTab({ token }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [status, setStatus] = useState('PENDING')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

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

  const deleteContent = async (r) => {
    const label = r.targetType === 'POST' ? 'gönderiyi' : 'yorumu'
    const ok = await confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`, { title: 'İçeriği sil' })
    if (!ok) return
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
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {reports.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Kayıt yok.</Typography>
          )}
          {reports.map(r => (
            <ReportCard key={r.id} r={r} actingId={actingId} act={act} deleteContent={deleteContent} />
          ))}
        </Stack>
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
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <ReportActions r={r} actingId={actingId} act={act} deleteContent={deleteContent} />
                    </Stack>
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
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>{u.email}</Typography>
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

function UsersTab({ token }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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

// Fotoğraf küçük resimleri (admin'in içeriği tıklamadan/indirmeden hızlıca
// göz atıp tehlikeli/uygunsuz olanı fark edebilmesi için) - hem masaüstü
// tablosunda hem mobil kartta kullanılıyor, tekrarı önlemek adına ayrı bileşen.
function AttachmentThumbnails({ attachments }) {
  if (!attachments || attachments.length === 0) return null
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5, mb: 0.5 }}>
      {attachments.map(a => (
        <Box
          key={a.id}
          component="a"
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'block', width: 56, height: 56, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}
        >
          <Box
            component="img"
            src={a.url}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
      ))}
    </Stack>
  )
}

function ContentCard({ item, type, deletingId, remove }) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      {type === 'posts' && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>{item.title}</Typography>
      )}
      <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word', color: type === 'posts' ? 'text.secondary' : 'text.primary' }}>
        {item.content}
      </Typography>
      {type === 'posts' && <AttachmentThumbnails attachments={item.attachments} />}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.authorName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {prettyDate(item.createdAt) || ''}
          </Typography>
          {type === 'comments' && (
            <Chip size="small" label={item.deleted ? 'Silinmiş' : 'Aktif'} color={item.deleted ? 'default' : 'success'} />
          )}
        </Stack>
        {!(type === 'comments' && item.deleted) && (
          <Button size="small" color="error" disabled={deletingId === item.id} onClick={() => remove(item)}>
            Sil
          </Button>
        )}
      </Stack>
    </Box>
  )
}

function ContentTab({ token }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [type, setType] = useState('posts') // 'posts' | 'comments'
  const [q, setQ] = useState('')
  // Tehlikeli/uygunsuz görsel içerik denetimi: sadece fotoğraflı gönderileri
  // filtreleme - sadece 'posts' tipinde anlamlı, yorumların fotoğrafı yok.
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const load = useCallback(() => {
    setLoading(true)
    if (type === 'posts') {
      listAdminPosts(token, { q: q || undefined, hasPhotos: onlyWithPhotos || undefined, size: 50 })
        .then(res => setItems(Array.isArray(res?.content) ? res.content : []))
        .catch(err => showError(err.message || 'İçerik alınamadı.'))
        .finally(() => setLoading(false))
      return
    }
    listAdminComments(token, { q: q || undefined, size: 50 })
      .then(res => setItems(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'İçerik alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, type, q, onlyWithPhotos, showError])

  useEffect(() => { load() }, [load])

  const remove = async (item) => {
    const label = type === 'posts' ? 'gönderiyi' : 'yorumu'
    const ok = await confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`, { title: 'İçeriği sil' })
    if (!ok) return
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
        {type === 'posts' && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={onlyWithPhotos}
                onChange={e => setOnlyWithPhotos(e.target.checked)}
              />
            }
            label="Sadece fotoğraflı"
          />
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {items.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Kayıt yok.</Typography>
          )}
          {items.map(item => (
            <ContentCard key={item.id} item={item} type={type} deletingId={deletingId} remove={remove} />
          ))}
        </Stack>
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
                    {type === 'posts' && <AttachmentThumbnails attachments={item.attachments} />}
                  </TableCell>
                  <TableCell>{item.authorName}</TableCell>
                  {type === 'comments' && (
                    <TableCell>
                      <Chip size="small" label={item.deleted ? 'Silinmiş' : 'Aktif'} color={item.deleted ? 'default' : 'success'} />
                    </TableCell>
                  )}
                  <TableCell>{prettyDate(item.createdAt) || ''}</TableCell>
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
          <TextField
            label="Ad" value={name} onChange={e => setName(e.target.value)} fullWidth autoFocus
            slotProps={{ htmlInput: { 'data-testid': 'group-name' } }}
          />
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
  const confirm = useConfirm()

  const remove = async () => {
    const ok = await confirm(`"${subGroup.name}" alt grubunu silmek istiyor musun? İçindeki tüm gönderiler de silinir.`, { title: 'Alt grubu sil' })
    if (!ok) return
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
        <IconButton size="small" aria-label="Alt Grubu Düzenle" onClick={() => setDialog('edit')}><EditOutlined fontSize="small" /></IconButton>
        <IconButton size="small" aria-label="Alt Grubu Sil" onClick={remove}><DeleteOutline fontSize="small" /></IconButton>
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
  const confirm = useConfirm()

  const loadSubGroups = useCallback(() => {
    listSubGroups(token, group.id).then(setSubGroups).catch(() => setSubGroups([]))
  }, [token, group.id])

  const remove = async (e) => {
    e.stopPropagation()
    const ok = await confirm(`"${group.name}" hastalık grubunu silmek istiyor musun? Tüm alt gruplar ve içerikler de silinir.`, { title: 'Hastalık grubunu sil' })
    if (!ok) return
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
            <IconButton size="small" aria-label="Grubu Düzenle" onClick={() => setDialog('edit')}><EditOutlined fontSize="small" /></IconButton>
            <IconButton size="small" aria-label="Grubu Sil" onClick={remove}><DeleteOutline fontSize="small" /></IconButton>
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
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}
      >
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
