import { useCallback, useEffect, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography
} from '@mui/material'
import { AddRounded, DeleteOutline, EditOutlined, ExpandMoreRounded, GroupsOutlined } from '@mui/icons-material'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import {
  createDiseaseGroup, createSubGroup, deleteDiseaseGroup, deleteSubGroup, listDiseaseGroups,
  listSubGroups, updateDiseaseGroup, updateSubGroup
} from '../../../services/api.js'
import { AdminEmpty, AdminLoading, SectionTitle } from '../AdminUi.jsx'

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
            slotProps={{ htmlInput: { 'data-testid': 'group-name', maxLength: 100 } }}
          />
          <TextField
            label="Açıklama" value={description} onChange={e => setDescription(e.target.value)}
            fullWidth multiline minRows={2} slotProps={{ htmlInput: { maxLength: 500 } }}
            helperText="Grup sayfasında ve arama sonuçlarında görünür."
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
  const [dialog, setDialog] = useState(null)
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
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1, pl: 2, pr: 1, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{subGroup.name}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subGroup.postCount} gönderi</Typography>
      </Box>
      <IconButton size="small" aria-label="Alt Grubu Düzenle" onClick={() => setDialog('edit')} sx={{ width: 40, height: 40 }}><EditOutlined fontSize="small" /></IconButton>
      <IconButton size="small" aria-label="Alt Grubu Sil" onClick={remove} sx={{ width: 40, height: 40 }}><DeleteOutline fontSize="small" /></IconButton>
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
  const [dialog, setDialog] = useState(null)
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
    <Accordion
      disableGutters
      onChange={(_, expanded) => { if (expanded && subGroups === null) loadSubGroups() }}
      sx={{ borderRadius: '12px !important', border: '1px solid', borderColor: 'divider', '&::before': { display: 'none' }, overflow: 'hidden' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ minHeight: 56, px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', pr: 1, minWidth: 0 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>{group.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{group.memberCount} üye</Typography>
          </Box>
          <Stack direction="row" spacing={0} onClick={e => e.stopPropagation()}>
            <IconButton size="small" aria-label="Grubu Düzenle" onClick={() => setDialog('edit')} sx={{ width: 40, height: 40 }}><EditOutlined fontSize="small" /></IconButton>
            <IconButton size="small" aria-label="Grubu Sil" onClick={remove} sx={{ width: 40, height: 40 }}><DeleteOutline fontSize="small" /></IconButton>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {subGroups === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={18} /></Box>
        ) : (
          <>
            {subGroups.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                Henüz alt grup yok.
              </Typography>
            )}
            {subGroups.map(sg => (
              <SubGroupRow key={sg.id} subGroup={sg} token={token} onChanged={loadSubGroups} />
            ))}
            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button size="small" startIcon={<AddRounded />} onClick={() => setDialog('newSub')} sx={{ minHeight: 40 }}>+ Alt Grup Ekle</Button>
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

  if (loading) return <AdminLoading />

  return (
    <Box>
      <SectionTitle
        action={
          <Button variant="contained" size="small" startIcon={<AddRounded />} onClick={() => setCreating(true)} sx={{ minHeight: 40 }}>
            + Yeni Hastalık Grubu
          </Button>
        }
      >
        {groups.length} hastalık grubu
      </SectionTitle>

      <Stack spacing={1}>
        {groups.map(g => (
          <DiseaseGroupAccordion key={g.id} group={g} token={token} onChanged={load} />
        ))}
        {groups.length === 0 && (
          <AdminEmpty icon={GroupsOutlined} title="Henüz hastalık grubu yok" description="İlk grubu oluşturup alt gruplarını ekle." actionLabel="Grup oluştur" onAction={() => setCreating(true)} />
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
