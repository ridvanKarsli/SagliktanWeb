import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Button, CircularProgress, Dialog, IconButton, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { CloseRounded, ForumOutlined, InfoOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import PhotoUploadField from './PhotoUploadField.jsx'
import DictationButton from './a11y/DictationButton.jsx'
import PostTargetPicker from './newPost/PostTargetPicker.jsx'
import PollOptionsEditor from './newPost/PollOptionsEditor.jsx'
import SimilarPostsHint from './newPost/SimilarPostsHint.jsx'
import {
  CONTENT_MAX, EMPTY_POLL_OPTIONS, POLL_MAX_OPTIONS, POST_TYPES, TITLE_MAX,
  isKnownPostType, normalizePollOptions, postTypeMeta
} from './newPost/postComposerConfig.js'
import { clearDraft, loadDraft, loadLastTarget, saveDraft, saveLastTarget } from './newPost/postDraftStorage.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { createPost, getMyDiseaseGroups, listSubGroups } from '../services/api.js'
import { appendDictation, isDictationSupported } from '../utils/speech.js'
import { useGroupMembership } from '../hooks/useGroupMembership.js'
import { useSimilarPosts } from '../hooks/useSimilarPosts.js'

const DRAFT_SAVE_DELAY_MS = 400

const sameId = (a, b) => a != null && b != null && String(a) === String(b)
const isBusyUpload = (a) => a.status === 'compressing' || a.status === 'uploading'

// Pencere açılırken başlangıç metni/türü: hazır şablon > uygun taslak > boş.
function initialText({ initialTitle, initialContent, initialPostType, draft }) {
  if (initialTitle || initialContent) {
    // Hazır şablonla açıldı (ör. karşılamadaki "Kendini tanıt") - taslağı ezme.
    return { title: initialTitle, content: initialContent, postType: initialPostType || 'DISCUSSION', pollOptions: [...EMPTY_POLL_OPTIONS], restored: false }
  }
  if (draft && (draft.title || draft.content)) {
    return {
      title: draft.title || '',
      content: draft.content || '',
      postType: isKnownPostType(draft.postType) ? draft.postType : 'DISCUSSION',
      pollOptions: Array.isArray(draft.pollOptions) && draft.pollOptions.length >= 2
        ? draft.pollOptions.slice(0, POLL_MAX_OPTIONS)
        : [...EMPTY_POLL_OPTIONS],
      restored: true
    }
  }
  return { title: '', content: '', postType: initialPostType || 'DISCUSSION', pollOptions: [...EMPTY_POLL_OPTIONS], restored: false }
}

/**
 * Tek gönderi oluşturma penceresi - ana sayfa, grup ve alt grup sayfaları ile
 * karşılama akışı aynı bileşeni kullanır.
 *
 * - presetSubGroup verilirse hedef sabittir (alt grup sayfasından açılınca).
 * - presetDiseaseGroupId verilirse hastalık grubu sabit, alt grup seçilir.
 * - Hiçbiri yoksa kullanıcı üye olduğu gruplardan seçer; son hedef hatırlanır.
 *
 * Yazılan metin cihazda taslak olarak tutulur (bkz. postDraftStorage).
 * Mobilde tam ekran ve "Paylaş" butonu ÜSTTE - klavye açıkken alttaki
 * butonlar ekranın dışında kalıyordu.
 */
export default function NewPostDialog({
  open, onClose, onCreated, presetSubGroup = null, presetDiseaseGroupId = null, presetDiseaseGroupName = '',
  initialTitle = '', initialContent = '', initialPostType = 'DISCUSSION'
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
  const [postType, setPostType] = useState('DISCUSSION')
  const [pollOptions, setPollOptions] = useState([...EMPTY_POLL_OPTIONS])
  const initializedRef = useRef(false)

  const fixedDgId = presetSubGroup?.diseaseGroupId ?? presetDiseaseGroupId ?? null
  const fixedDgName = presetSubGroup?.diseaseGroupName || presetDiseaseGroupName || ''
  const photosBusy = attachments.some(isBusyUpload)

  const resetAttachments = useCallback(() => {
    setAttachments(prev => {
      prev.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl) })
      return []
    })
  }, [])

  const resetText = () => {
    setTitle(''); setContent(''); setDraftRestored(false)
    setPostType('DISCUSSION'); setPollOptions([...EMPTY_POLL_OPTIONS])
  }

  /* Açılışta: metni/taslağı ve hedefi belirle. */
  useEffect(() => {
    if (!open) { initializedRef.current = false; return undefined }
    if (initializedRef.current) return undefined
    initializedRef.current = true

    const storedDraft = loadDraft()
    const draftFits = !!storedDraft && (
      presetSubGroup ? sameId(storedDraft.subGroupId, presetSubGroup.id)
        : fixedDgId != null ? sameId(storedDraft.diseaseGroupId, fixedDgId)
          : true
    )
    const text = initialText({ initialTitle, initialContent, initialPostType, draft: draftFits ? storedDraft : null })
    setTitle(text.title); setContent(text.content); setPostType(text.postType)
    setPollOptions(text.pollOptions); setDraftRestored(text.restored)

    if (presetSubGroup) {
      setDiseaseGroupId(presetSubGroup.diseaseGroupId)
      setSubGroupId(presetSubGroup.id)
    } else {
      const source = draftFits && storedDraft?.diseaseGroupId ? storedDraft : loadLastTarget()
      const dg = fixedDgId ?? source?.diseaseGroupId ?? null
      setDiseaseGroupId(dg)
      setSubGroupId(dg != null && source && sameId(source.diseaseGroupId, dg) ? source.subGroupId ?? null : null)
    }
    return undefined
    // Yalnızca pencere açıldığında bir kez çalışır (initializedRef); şablon
    // prop'larının sonraki değişimleri yazılanı ezmemeli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetSubGroup, fixedDgId])

  /* Sabit hedef (alt grup sayfası) pencere açıkken gelirse ona geç: sayfa
     bilgisi yüklenmeden açılan pencere aksi halde son kullanılan başka bir
     gruba paylaşım yapardı. */
  const presetSubGroupId = presetSubGroup?.id ?? null
  const presetSubGroupDgId = presetSubGroup?.diseaseGroupId ?? null
  useEffect(() => {
    if (!open || presetSubGroupId == null) return
    setDiseaseGroupId(presetSubGroupDgId)
    setSubGroupId(presetSubGroupId)
  }, [open, presetSubGroupId, presetSubGroupDgId])

  /* Her açılışta üye olunan grupları (taze) çek. */
  useEffect(() => {
    if (!open) return undefined
    let alive = true
    setMyGroups(null)
    getMyDiseaseGroups(token)
      .then(list => { if (alive) setMyGroups(Array.isArray(list) ? list : []) })
      .catch(() => { if (alive) setMyGroups([]) })
    return () => { alive = false }
  }, [open, token])

  /* Grup listesi gelince: seçili grup artık üyelikte yoksa ya da hiç seçim
     yoksa ve tek grup varsa, otomatik düzelt. */
  useEffect(() => {
    if (!open || !myGroups || fixedDgId != null) return
    const isStillMember = myGroups.some(g => sameId(g.id, diseaseGroupId))
    if (diseaseGroupId != null && !isStillMember) {
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

  const currentDraft = useMemo(
    () => ({ title, content, diseaseGroupId, subGroupId, postType, pollOptions }),
    [title, content, diseaseGroupId, subGroupId, postType, pollOptions]
  )

  /* Taslağı kaydet (kısa gecikmeyle). */
  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => {
      if (currentDraft.title.trim() || currentDraft.content.trim()) saveDraft(currentDraft)
      else clearDraft()
    }, DRAFT_SAVE_DELAY_MS)
    return () => clearTimeout(t)
  }, [open, currentDraft])

  const similar = useSimilarPosts(title, { enabled: open, diseaseGroupId })

  const isMember = myGroups && diseaseGroupId != null
    ? myGroups.some(g => sameId(g.id, diseaseGroupId))
    : null
  const selectedDg = myGroups?.find(g => sameId(g.id, diseaseGroupId))
  const selectedSub = Array.isArray(subGroups) ? subGroups.find(s => sameId(s.id, subGroupId)) : null
  const poll = normalizePollOptions(pollOptions)
  const typeMeta = postTypeMeta(postType)
  const hasText = !!(title.trim() || content.trim())

  const close = () => {
    if (submitting) return
    if (hasText) showSuccess('Taslağın kaydedildi, kaldığın yerden devam edebilirsin.')
    resetAttachments()
    onClose()
  }

  const discardDraft = () => {
    resetText()
    clearDraft()
  }

  const openSimilar = (postId) => {
    // Taslak saklanır; gönderiyi okuyup geri dönülebilir.
    saveDraft(currentDraft)
    resetAttachments()
    onClose()
    navigate(`/post/${postId}`)
  }

  const exploreGroups = () => {
    onClose()
    navigate('/groups')
  }

  const joinFixedGroup = async () => {
    const ok = await join({ id: diseaseGroupId, name: fixedDgName || 'Bu' })
    if (ok) setMyGroups(prev => [...(prev || []), { id: diseaseGroupId, name: fixedDgName }])
  }

  const canSubmit = !submitting && !photosBusy && subGroupId != null && isMember !== false
    && title.trim().length > 0 && content.trim().length > 0 && (postType !== 'POLL' || poll.valid)

  const validationError = () => {
    if (subGroupId == null) return 'Paylaşacağın grubu seç.'
    if (!title.trim()) return 'Başlık zorunludur.'
    if (!content.trim()) return 'İçerik zorunludur.'
    if (photosBusy) return 'Fotoğraflar hâlâ yükleniyor, birazdan tekrar dene.'
    if (postType === 'POLL' && !poll.valid) return 'Ankette en az 2 farklı seçenek olmalı.'
    return null
  }

  const submit = async (e) => {
    e?.preventDefault()
    const problem = validationError()
    if (problem) { showError(problem); return }
    const attachmentKeys = attachments.filter(a => a.status === 'done').map(a => a.storageKey)
    setSubmitting(true)
    try {
      const created = await createPost(token, subGroupId, {
        title: title.trim(), content: content.trim(), attachmentKeys,
        postType, pollOptions: postType === 'POLL' ? poll.clean : undefined
      })
      clearDraft()
      saveLastTarget({ diseaseGroupId, subGroupId })
      showSuccess('Gönderi oluşturuldu.')
      resetText()
      resetAttachments()
      onCreated?.(created, { diseaseGroupId, subGroupId })
      onClose()
    } catch (err) {
      showError(err.message || 'Gönderi oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  const targetGroupName = selectedDg?.name || fixedDgName

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth fullScreen={isSmallScreen} aria-labelledby="new-post-title">
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
          <Button type="submit" variant="contained" disabled={!canSubmit} sx={{ borderRadius: 999, minHeight: 40, minWidth: 88, mr: 0.5 }}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : 'Paylaş'}
          </Button>
        </Stack>

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <Stack spacing={2.25}>
            <PostTargetPicker
              presetSubGroup={presetSubGroup}
              myGroups={myGroups}
              fixedDgId={fixedDgId}
              fixedDgName={fixedDgName}
              diseaseGroupId={diseaseGroupId}
              onDiseaseGroupChange={(id) => { if (!sameId(id, diseaseGroupId)) { setDiseaseGroupId(id); setSubGroupId(null) } }}
              subGroups={subGroups}
              subGroupId={subGroupId}
              onSubGroupChange={setSubGroupId}
              onExploreGroups={exploreGroups}
            />

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

            <Box>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={postType}
                onChange={(_, v) => v && setPostType(v)}
                aria-label="Gönderi türü"
                sx={{ '& .MuiToggleButton-root': { minHeight: 44, gap: 0.75, textTransform: 'none', fontWeight: 600, px: 1 } }}
              >
                {POST_TYPES.map(t => {
                  const Icon = t.icon
                  return (
                    <ToggleButton key={t.value} value={t.value} aria-label={t.label}>
                      <Icon sx={{ fontSize: 18 }} />{t.label}
                    </ToggleButton>
                  )
                })}
              </ToggleButtonGroup>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.75, px: 0.5 }}>
                {typeMeta.hint}
              </Typography>
            </Box>

            {draftRestored && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 0.75, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary' }}>Kaydedilmiş taslağın yüklendi.</Typography>
                <Button size="small" onClick={discardDraft} sx={{ minHeight: 32 }}>Temizle</Button>
              </Stack>
            )}

            <TextField
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
              required
              fullWidth
              label={typeMeta.titleLabel}
              placeholder={typeMeta.titlePlaceholder}
              helperText={title.length > TITLE_MAX - 40 ? `${title.length}/${TITLE_MAX}` : ' '}
              slotProps={{
                htmlInput: { maxLength: TITLE_MAX, 'data-testid': 'post-title', enterKeyHint: 'next' },
                formHelperText: { sx: { textAlign: 'right', mr: 0, minHeight: 0 } }
              }}
            />
            <SimilarPostsHint posts={similar} isQuestion={postType === 'QUESTION'} onOpen={openSimilar} />

            {postType === 'POLL' && <PollOptionsEditor options={pollOptions} onChange={setPollOptions} />}

            <TextField
              label={typeMeta.contentLabel}
              value={content}
              onChange={e => setContent(e.target.value.slice(0, CONTENT_MAX))}
              required
              fullWidth
              multiline
              minRows={postType === 'POLL' ? 3 : (isSmallScreen ? 8 : 5)}
              placeholder={typeMeta.contentPlaceholder}
              helperText={content.length > CONTENT_MAX - 500 ? `${content.length}/${CONTENT_MAX}` : ' '}
              slotProps={{
                htmlInput: { maxLength: CONTENT_MAX, 'data-testid': 'post-content' },
                formHelperText: { sx: { textAlign: 'right', mr: 0, minHeight: 0 } }
              }}
            />
            {isDictationSupported() && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: -2, color: 'text.secondary' }}>
                <DictationButton
                  label="Konuşarak yaz"
                  disabled={submitting}
                  onText={(piece) => setContent(c => appendDictation(c, piece).slice(0, CONTENT_MAX))}
                />
                <Typography variant="caption">Konuşarak yaz - mikrofona dokun, bitince tekrar dokun.</Typography>
              </Stack>
            )}
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
                  {targetGroupName ? `${targetGroupName} › ` : ''}{selectedSub.name} bölümünde paylaşılacak
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </Dialog>
  )
}
