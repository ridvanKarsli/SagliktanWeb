import { useCallback, useEffect, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography
} from '@mui/material'
import { DeleteOutline, EditOutlined, ExpandMoreRounded } from '@mui/icons-material'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import {
  createDiseaseGroup, createSubGroup, deleteDiseaseGroup, deleteSubGroup, listDiseaseGroups,
  listSubGroups, updateDiseaseGroup, updateSubGroup
} from '../../../services/api.js'

// AdminPanel.jsx'ten ayrı bir dosyaya taşındı (bkz. clean-code audit).

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
    // Başarısız olursa boş liste göster ("Henüz alt grup yok" gibi) - accordion
    // zaten kullanıcının kendi açtığı ikincil bir görünüm, ayrı bir toast
    // eklemek burada gürültü olurdu (bkz. api.js hata yutma konvansiyonu).
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

export default function GroupsTab({ token }) {
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
