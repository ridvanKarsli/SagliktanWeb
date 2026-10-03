import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, IconButton, Skeleton, Stack, TextField,
  Typography, useMediaQuery, useTheme
} from '@mui/material'
import {
  CloseRounded, ForumOutlined, GroupsRounded, InfoOutlined, PlaceOutlined
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import PhotoUploadField from './PhotoUploadField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { createPost, getMyDiseaseGroups, listSubGroups } from '../services/api.js'
import { useGroupMembership } from '../hooks/useGroupMembership.js'

const TITLE_MAX = 255
const CONTENT_MAX = 10000
const DRAFT_KEY = 'sagliktan:post-draft'
const LAST_TARGET_KEY = 'sagliktan:last-post-target'

// localStorage gizli sekmede / dolu kotada hata fırlatabilir; taslak bir
// kolaylık, asla akışı bozmamalı.
const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null } },
  set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* yoksay */ } },
  del(key) { try { localStorage.removeItem(key) } catch { /* yoksay */ } },
}

/* Yatay kaydırılabilir seçim çipleri - mobilde başparmakla rahat seçilsin
   diye 40px yükseklik, seçili olan dolu renkte. */
function ChoiceChips({ items, value, onChange, getLabel, ariaLabel, wrap = false }) {
  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      sx={{
        display: 'flex', gap: 1, flexWrap: wrap ? 'wrap' : 'nowrap',
        overflowX: wrap ? 'visible' : 'auto', mx: wrap ? 0 : -0.5, px: wrap ? 0 : 0.5, pb: 0.5,
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      {items.map(it => {
        const selected = String(it.id) === String(value)
        return (
          <Chip
            key={it.id}
            role="radio"
            aria-checked={selected}
            label={getLabel(it)}
            onClick={() => onChange(it.id)}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            sx={{ height: 40, borderRadius: 999, flexShrink: 0, fontWeight: selected ? 700 : 500, px: 0.5 }}
          />
        )
      })}
    </Box>
  )
}

/**
 * Tek gönderi oluşturma penceresi - ana sayfa, grup sayfası ve alt grup
 * sayfası aynı bileşeni kullanır.
 *
 * - presetSubGroup verilirse hedef sabittir (alt grup sayfasından açılınca).
 * - presetDiseaseGroupId verilirse hastalık grubu sabit, alt grup seçilir.
 * - Hiçbiri yoksa kullanıcı üye olduğu gruplardan seçer; son kullandığı
 *   hedef hatırlanır.
 *
 * Yazılan metin cihazda taslak olarak tutulur: pencere yanlışlıkla kapansa
 * da (mobilde geri hareketi, dışarı dokunma) yazı kaybolmaz.
 *
 * Mobilde tam ekran ve "Paylaş" butonu ÜSTTE - klavye açıkken alttaki
 * butonlar ekranın dışında kalıyordu.
 */
export default function NewPostDialog({
  open, onClose, onCreated, presetSubGroup = null, presetDiseaseGroupId = null, presetDiseaseGroupName = ''
}) {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { join, pendingId: joinPendingId } = useGroupMembership()

  const [myGroups, setMyGroups] = useState(null) // null = yükleniyor
  const [diseaseGroupId, setDiseaseGroupId] = useState(null)
  const [subGroupId, setSubGroupId] = useState(null)
  const [subGroupsByDg, setSubGroupsByDg] = useState({})
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const initializedRef = useRef(false)

  const fixedDgId = presetSubGroup?.diseaseGroupId ?? presetDiseaseGroupId ?? null
  const photosBusy = attachments.some(a => a.status === 'compressing' || a.status === 'uploading')

  const resetAttachments = useCallback(() => {
    setAttachments(prev => {
      prev.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl) })
      return []
    })
  }, [])

  /* Açılışta: üye olunan grupları çek, hedefi ve taslağı belirle. */
  useEffect(() => {
    if (!open) { initializedRef.current = false; return }
    if (initializedRef.current) return
    initializedRef.current = true

    const draft = store.get(DRAFT_KEY)
    const last = store.get(LAST_TARGET_KEY)
    const draftFits = draft && (
      presetSubGroup ? String(draft.subGroupId) === String(presetSubGroup.id)
        : fixedDgId ? String(draft.diseaseGroupId) === String(fixedDgId)
          : true
    )
    if (draftFits && (draft.title || draft.content)) {
      setTitle(draft.title || '')
      setContent(draft.content || '')
      setDraftRestored(true)
    } else {
      setTitle(''); setContent(''); setDraftRestored(false)
    }

    if (presetSubGroup) {
      setDiseaseGroupId(presetSubGroup.diseaseGroupId)
      setSubGroupId(presetSubGroup.id)
    } else {
      const src = draftFits && draft?.diseaseGroupId ? draft : last
      const dg = fixedDgId ?? src?.diseaseGroupId ?? null
      setDiseaseGroupId(dg)
      setSubGroupId(dg != null && src && String(src.diseaseGroupId) === String(dg) ? src.subGroupId ?? null : null)
    }

    setMyGroups(null)
    getMyDiseaseGroups(token)
      .then(list => setMyGroups(Array.isArray(list) ? list : []))
      .catch(() => setMyGroups([]))
  }, [open, token, presetSubGroup, fixedDgId])

  /* Grup listesi gelince: seçili grup artık üyelikte yoksa ya da hiç seçim
     yoksa ve tek grup varsa, otomatik düzelt. */
  useEffect(() => {
    if (!open || !myGroups || fixedDgId != null) return
    const ids = myGroups.map(g => String(g.id))
    if (diseaseGroupId != null && !ids.includes(String(diseaseGroupId))) {
      setDiseaseGroupId(null); setSubGroupId(null)
    } else if (diseaseGroupId == null && myGroups.length === 1) {
      setDiseaseGroupId(myGroups[0].id)
    }
  }, [open, myGroups, diseaseGroupId, fixedDgId])

  /* Seçili hastalık grubunun alt gruplarını (önbellekli) getir. */
  useEffect(() => {
    if (!open || diseaseGroupId == null || presetSubGroup) return
    if (subGroupsByDg[diseaseGroupId]) return
    listSubGroups(token, diseaseGroupId)
      .then(list => setSubGroupsByDg(prev => ({ ...prev, [diseaseGroupId]: Array.isArray(list) ? list : [] })))
      .catch(() => setSubGroupsByDg(prev => ({ ...prev, [diseaseGroupId]: [] })))
  }, [open, diseaseGroupId, token, presetSubGroup, subGroupsByDg])

  const subGroups = useMemo(
    () => (presetSubGroup ? [presetSubGroup] : (diseaseGroupId != null ? subGroupsByDg[diseaseGroupId] : undefined)),
    [presetSubGroup, diseaseGroupId, subGroupsByDg]
  )

  /* Tek alt grup varsa onu seç. */
  useEffect(() => {
    if (!presetSubGroup && subGroupId == null && Array.isArray(subGroups) && subGroups.length === 1) {
      setSubGroupId(subGroups[0].id)
    }
  }, [subGroups, subGroupId, presetSubGroup])

  /* Taslağı kaydet (400ms debounce). */
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      if (title.trim() || content.trim()) store.set(DRAFT_KEY, { title, content, diseaseGroupId, subGroupId })
      else store.del(DRAFT_KEY)
    }, 400)
    return () => clearTimeout(t)
  }, [open, title, content, diseaseGroupId, subGroupId])

  const isMember = useMemo(() => {
    if (!myGroups || diseaseGroupId == null) return null
    return myGroups.some(g => String(g.id) === String(diseaseGroupId))
  }, [myGroups, diseaseGroupId])

  const selectedDg = myGroups?.find(g => String(g.id) === String(diseaseGroupId))
  const selectedSub = Array.isArray(subGroups) ? subGroups.find(s => String(s.id) === String(subGroupId)) : null

  const close = () => {
    if (submitting) return
    if (title.trim() || content.trim()) showSuccess('Taslağın kaydedildi, kaldığın yerden devam edebilirsin.')
    resetAttachments()
    onClose()
  }

  const discardDraft = () => {
    setTitle(''); setContent(''); setDraftRestored(false); store.del(DRAFT_KEY)
  }

  const fixedDgName = presetSubGroup?.diseaseGroupName || presetDiseaseGroupName || ''

  const joinFixedGroup = async () => {
    const ok = await join({ id: diseaseGroupId, name: fixedDgName || 'Bu' })
    if (ok) setMyGroups(prev => [...(prev || []), { id: diseaseGroupId, name: fixedDgName }])
  }

  const canSubmit = !submitting && !photosBusy && subGroupId != null && isMember !== false
    && title.trim().length > 0 && content.trim().length > 0

  const submit = async (e) => {
    e?.preventDefault()
    if (subGroupId == null) { showError('Paylaşacağın grubu seç.'); return }
    if (!title.trim()) { showError('Başlık zorunludur.'); return }
    if (!content.trim()) { showError('İçerik zorunludur.'); return }
    if (photosBusy) { showError('Fotoğraflar hâlâ yükleniyor, birazdan tekrar dene.'); return }
    const attachmentKeys = attachments.filter(a => a.status === 'done').map(a => a.storageKey)
    setSubmitting(true)
    try {
      const created = await createPost(token, subGroupId, { title: title.trim(), content: content.trim(), attachmentKeys })
      store.del(DRAFT_KEY)
      store.set(LAST_TARGET_KEY, { diseaseGroupId, subGroupId })
      showSuccess('Gönderi oluşturuldu.')
      setTitle(''); setContent(''); setDraftRestored(false)
      resetAttachments()
      onCreated?.(created, { diseaseGroupId, subGroupId })
      onClose()
    } catch (err) {
      showError(err.message || 'Gönderi oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  const noGroups = myGroups && myGroups.length === 0 && fixedDgId == null

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      fullScreen={isSmallScreen}
      aria-labelledby="new-post-title"
    >
      <Box component="form" id="new-post-form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', height: isSmallScreen ? '100%' : 'auto', minHeight: 0 }}>
        {/* Üst bar: kapat · başlık · Paylaş */}
        <Stack
          direction="row" alignItems="center" spacing={1}
          sx={{
            px: 1, py: 1, pt: isSmallScreen ? 'calc(env(safe-area-inset-top) + 8px)' : 1,
            borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0
          }}
        >
          <IconButton onClick={close} aria-label="Kapat" disabled={submitting} sx={{ width: 44, height: 44 }}>
            <CloseRounded />
          </IconButton>
          <Typography id="new-post-title" variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            Yeni gönderi
          </Typography>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit}
            sx={{ borderRadius: 999, minHeight: 40, minWidth: 88, mr: 0.5 }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Paylaş'}
          </Button>
        </Stack>

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <Stack spacing={2.25}>
            {/* Hedef seçimi */}
            {presetSubGroup ? (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary', minWidth: 0 }}>
                <PlaceOutlined sx={{ fontSize: 18, flexShrink: 0 }} />
                <Typography variant="body2" noWrap>
                  {presetSubGroup.diseaseGroupName ? `${presetSubGroup.diseaseGroupName} › ` : ''}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{presetSubGroup.name}</Box>
                </Typography>
              </Stack>
            ) : myGroups === null ? (
              <Stack spacing={1}>
                <Skeleton variant="text" width={140} />
                <Stack direction="row" spacing={1}>
                  {[96, 120, 80].map(w => <Skeleton key={w} variant="rounded" width={w} height={40} sx={{ borderRadius: 999 }} />)}
                </Stack>
              </Stack>
            ) : noGroups ? (
              <Alert
                severity="info"
                icon={<GroupsRounded />}
                action={
                  <Button color="inherit" size="small" onClick={() => { onClose(); navigate('/groups') }} sx={{ minHeight: 36 }}>
                    Keşfet
                  </Button>
                }
              >
                Paylaşım yapmak için önce bir hastalık grubuna katılmalısın.
              </Alert>
            ) : (
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6, lineHeight: 1.6 }}>
                  Nereye paylaşıyorsun?
                </Typography>
                {fixedDgId == null && myGroups.length > 1 && (
                  <Box sx={{ mt: 0.75 }}>
                    <ChoiceChips
                      ariaLabel="Hastalık grubu"
                      items={myGroups}
                      value={diseaseGroupId}
                      onChange={(id) => { if (String(id) !== String(diseaseGroupId)) { setDiseaseGroupId(id); setSubGroupId(null) } }}
                      getLabel={(g) => g.name}
                    />
                  </Box>
                )}
                {fixedDgId != null && fixedDgName && (
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    <GroupsRounded sx={{ fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{fixedDgName}</Typography>
                  </Stack>
                )}
                {fixedDgId == null && myGroups.length === 1 && (
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    <GroupsRounded sx={{ fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{myGroups[0].name}</Typography>
                  </Stack>
                )}
                {diseaseGroupId != null && (
                  <Box sx={{ mt: 1 }}>
                    {subGroups === undefined ? (
                      <Stack direction="row" spacing={1}>
                        {[110, 90, 130].map(w => <Skeleton key={w} variant="rounded" width={w} height={40} sx={{ borderRadius: 999 }} />)}
                      </Stack>
                    ) : subGroups.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Bu grupta henüz alt grup yok.</Typography>
                    ) : (
                      <ChoiceChips
                        ariaLabel="Alt grup"
                        wrap
                        items={subGroups}
                        value={subGroupId}
                        onChange={setSubGroupId}
                        getLabel={(s) => s.name}
                      />
                    )}
                  </Box>
                )}
                {diseaseGroupId == null && myGroups.length > 1 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Önce bir grup seç, ardından konu başlığını (alt grup).
                  </Typography>
                )}
              </Box>
            )}

            {isMember === false && fixedDgId != null && (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={joinFixedGroup} disabled={joinPendingId != null} sx={{ minHeight: 36 }}>
                    {joinPendingId != null ? <CircularProgress size={16} color="inherit" /> : 'Katıl'}
                  </Button>
                }
              >
                Bu gruba paylaşım yapmak için önce katılman gerekiyor.
              </Alert>
            )}

            {draftRestored && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 0.75, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary' }}>Kaydedilmiş taslağın yüklendi.</Typography>
                <Button size="small" onClick={discardDraft} sx={{ minHeight: 32 }}>Temizle</Button>
              </Stack>
            )}

            <TextField
              label="Başlık"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
              required
              fullWidth
              placeholder={selectedSub ? `${selectedSub.name} için kısa bir başlık` : 'Kısa ve anlaşılır bir başlık'}
              helperText={title.length > TITLE_MAX - 40 ? `${title.length}/${TITLE_MAX}` : ' '}
              slotProps={{
                htmlInput: { maxLength: TITLE_MAX, 'data-testid': 'post-title', enterKeyHint: 'next' },
                formHelperText: { sx: { textAlign: 'right', mr: 0, minHeight: 0 } }
              }}
            />
            <TextField
              label="İçerik"
              value={content}
              onChange={e => setContent(e.target.value.slice(0, CONTENT_MAX))}
              required
              fullWidth
              multiline
              minRows={isSmallScreen ? 8 : 5}
              placeholder="Deneyimini, sorunu ya da merak ettiğini anlat…"
              helperText={content.length > CONTENT_MAX - 500 ? `${content.length}/${CONTENT_MAX}` : ' '}
              slotProps={{
                htmlInput: { maxLength: CONTENT_MAX, 'data-testid': 'post-content' },
                formHelperText: { sx: { textAlign: 'right', mr: 0, minHeight: 0 } }
              }}
            />
            <PhotoUploadField value={attachments} onChange={setAttachments} token={token} disabled={submitting} />

            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ px: 0.5, color: 'text.secondary' }}>
              <InfoOutlined sx={{ fontSize: 16, mt: '2px', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                Paylaşımın kişisel deneyimin olarak görünür, tıbbi tavsiye yerine geçmez.
                Okuyanların sana danışmadan hiçbir ilaç, tedavi ya da sağlık ürünü kullanmaması
                gerektiğini unutma - sağlık kararları için her zaman bir uzmana danışılmalı.
              </Typography>
            </Stack>

            {selectedSub && !presetSubGroup && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
                <ForumOutlined sx={{ fontSize: 16 }} />
                <Typography variant="caption" noWrap>
                  {(selectedDg?.name || fixedDgName) ? `${selectedDg?.name || fixedDgName} › ` : ''}{selectedSub.name} bölümünde paylaşılacak
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  )
}
