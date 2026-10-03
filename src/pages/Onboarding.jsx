import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, ButtonBase, CircularProgress, InputAdornment, LinearProgress, Stack, TextField, Typography
} from '@mui/material'
import {
  ArrowBackRounded, CheckCircleRounded, EditNoteRounded, GroupsRounded, PeopleAltRounded, SearchRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import {
  completeOnboarding, getMyDiseaseGroups, joinDiseaseGroup, listDiseaseGroups, updateHealthProfile
} from '../services/api.js'
import HealthProfileFields, { RolePicker } from '../components/profile/HealthProfileFields.jsx'
import NewPostDialog from '../components/NewPostDialog.jsx'

const STEPS = ['role', 'groups', 'details', 'done']

function introTemplate(user, role, groupNames) {
  const roleLine = {
    PATIENT: 'Ben de bu süreci yaşıyorum.',
    CAREGIVER: 'Bir yakınım bu süreçten geçiyor, ona destek olmak için buradayım.',
    PROFESSIONAL: 'Sağlık alanında çalışıyorum, deneyimlerimi paylaşmak ve öğrenmek için buradayım.',
  }[role] || 'Buraya öğrenmek ve paylaşmak için geldim.'
  return {
    title: `Merhaba, ben ${user?.firstName || ''}`.trim(),
    content: `Merhaba herkese! ${roleLine}${groupNames ? `\n\n${groupNames} hakkında` : '\n\nBu konuda'} en çok merak ettiğim şey: \n\nTanıştığıma memnun oldum.`
  }
}

/**
 * Karşılama akışı (kayıttan sonraki ilk giriş): rol → gruplar → isteğe bağlı
 * ayrıntılar → "Kendini tanıt". Her adım atlanabilir; amaç kişinin ilk
 * dakikada boş bir akış yerine kendi grubunu ve insanlarını bulması.
 * Mobil öncelikli: tam ekran, büyük dokunma alanları, alt sabit buton çubuğu.
 */
export default function Onboarding() {
  const { token, user, applyServerUser } = useAuth()
  const { showError } = useNotification()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({
    communityRole: user?.communityRole || null,
    diagnosisYear: user?.diagnosisYear || null,
    city: user?.city || '',
    discoverable: !!user?.discoverable,
  })
  const [groups, setGroups] = useState(null)
  const [joinedIds, setJoinedIds] = useState(new Set())
  const [selected, setSelected] = useState(new Set())
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)

  useEffect(() => {
    if (!token) return
    Promise.all([listDiseaseGroups(token), getMyDiseaseGroups(token).catch(() => [])])
      .then(([all, mine]) => {
        setGroups(Array.isArray(all) ? all : [])
        const mineIds = new Set((Array.isArray(mine) ? mine : []).map(g => g.id))
        setJoinedIds(mineIds)
        setSelected(new Set(mineIds))
      })
      .catch(() => setGroups([]))
  }, [token])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    if (!groups) return []
    if (!q) return groups
    return groups.filter(g => `${g.name} ${g.description || ''}`.toLocaleLowerCase('tr').includes(q))
  }, [groups, query])

  const selectedNames = (groups || []).filter(g => selected.has(g.id)).map(g => g.name).join(', ')
  const stepKey = STEPS[step]

  const toggleGroup = (id) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  // Seçilen yeni gruplara katıl (zaten üye olunanlara dokunma).
  const joinSelected = async () => {
    const toJoin = [...selected].filter(id => !joinedIds.has(id))
    for (const id of toJoin) {
      try {
        await joinDiseaseGroup(token, id)
        setJoinedIds(prev => new Set(prev).add(id))
      } catch (err) {
        showError(err.message || 'Bir gruba katılınamadı.')
      }
    }
  }

  const finish = async ({ saveProfile = true } = {}) => {
    setBusy(true)
    try {
      if (saveProfile && (profile.communityRole || profile.diagnosisYear || profile.city || profile.discoverable)) {
        await updateHealthProfile(token, profile)
      }
      applyServerUser(await completeOnboarding(token))
      return true
    } catch (err) {
      showError(err.message || 'Kaydedilemedi, tekrar dener misin?')
      return false
    } finally {
      setBusy(false)
    }
  }

  const next = async () => {
    if (stepKey === 'groups') {
      setBusy(true)
      await joinSelected()
      setBusy(false)
    }
    if (stepKey === 'details') {
      if (!(await finish())) return
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const skipAll = async () => {
    if (await finish({ saveProfile: false })) navigate('/home', { replace: true })
  }

  const primaryLabel = {
    role: 'Devam',
    groups: selected.size > joinedIds.size ? `${selected.size - joinedIds.size} gruba katıl` : 'Devam',
    details: 'Kaydet ve bitir',
  }[stepKey]

  const intro = introTemplate(user, profile.communityRole, selectedNames)

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Üst bar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.default', pt: 'env(safe-area-inset-top)' }}>
        <Stack direction="row" alignItems="center" sx={{ px: 1, py: 1, maxWidth: 640, mx: 'auto', width: '100%' }}>
          {step > 0 && stepKey !== 'done' ? (
            <Button onClick={() => setStep(s => s - 1)} startIcon={<ArrowBackRounded />} sx={{ minHeight: 44 }} disabled={busy}>
              Geri
            </Button>
          ) : <Box sx={{ width: 44 }} />}
          <Box sx={{ flex: 1 }} />
          {stepKey !== 'done' && (
            <Button onClick={skipAll} disabled={busy} sx={{ minHeight: 44, color: 'text.secondary' }}>
              Şimdilik geç
            </Button>
          )}
        </Stack>
        <LinearProgress
          variant="determinate"
          value={((step + 1) / STEPS.length) * 100}
          aria-label={`Adım ${step + 1} / ${STEPS.length}`}
          sx={{ height: 3 }}
        />
      </Box>

      <Box sx={{ flex: 1, px: 2, py: 3, maxWidth: 640, mx: 'auto', width: '100%' }}>
        {stepKey === 'role' && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                Hoş geldin{user?.firstName ? `, ${user.firstName}` : ''} 👋
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Sağlıktan, aynı süreçten geçen insanların deneyim paylaştığı bir topluluk.
                Sana uygun içerikleri ve insanları gösterebilmemiz için birkaç kısa soru.
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Toplulukta kim olarak bulunuyorsun?</Typography>
            <RolePicker value={profile.communityRole} onChange={(communityRole) => setProfile(p => ({ ...p, communityRole }))} />
          </Stack>
        )}

        {stepKey === 'groups' && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>Hangi gruplar seni ilgilendiriyor?</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Katıldığın grupların paylaşımları ana sayfanda görünür. Birden fazla seçebilirsin.
              </Typography>
            </Box>
            {groups && groups.length > 6 && (
              <TextField
                size="small"
                placeholder="Hastalık ara…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> } }}
              />
            )}
            {groups === null ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}><CircularProgress size={26} /></Box>
            ) : (
              <Stack spacing={1} role="group" aria-label="Hastalık grupları">
                {filteredGroups.map(g => {
                  const isSel = selected.has(g.id)
                  const already = joinedIds.has(g.id)
                  return (
                    <ButtonBase
                      key={g.id}
                      onClick={() => { if (!already) toggleGroup(g.id) }}
                      aria-pressed={isSel}
                      disabled={already}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 3, textAlign: 'left', justifyContent: 'flex-start',
                        border: '1.5px solid', borderColor: isSel ? 'primary.main' : 'divider',
                        bgcolor: isSel ? 'rgba(76,184,159,0.10)' : 'background.paper',
                        '&.Mui-disabled': { opacity: 1 }
                      }}
                    >
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(76,184,159,0.16)', color: 'primary.main' }}>
                        <GroupsRounded />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{g.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleAltRounded sx={{ fontSize: 14 }} /> {g.memberCount ?? 0} üye{already ? ' · zaten üyesin' : ''}
                        </Typography>
                      </Box>
                      {isSel
                        ? <CheckCircleRounded sx={{ color: 'primary.main', flexShrink: 0 }} />
                        : <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid', borderColor: 'divider', flexShrink: 0 }} />}
                    </ButtonBase>
                  )
                })}
                {filteredGroups.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                    Aradığın grubu bulamadık. Daha sonra Gruplar sayfasından bakabilirsin.
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        )}

        {stepKey === 'details' && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>Senin gibi olanları bulalım</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Hepsi isteğe bağlı. Benzer süreçteki üyeleri önerebilmemiz için yardımcı olur.
              </Typography>
            </Box>
            <HealthProfileFields value={profile} onChange={setProfile} />
          </Stack>
        )}

        {stepKey === 'done' && (
          <Stack spacing={2.5} alignItems="center" sx={{ textAlign: 'center', pt: 3 }}>
            <CheckCircleRounded sx={{ fontSize: 64, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>Hazırsın!</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 420 }}>
              Topluluğa kısaca kendini tanıtmak ister misin? İlk paylaşımlara genelde sıcak karşılamalar gelir.
            </Typography>
            <Stack spacing={1.25} sx={{ width: '100%', maxWidth: 360, pt: 1 }}>
              {joinedIds.size > 0 && (
                <Button variant="contained" size="large" startIcon={<EditNoteRounded />} onClick={() => setComposerOpen(true)} sx={{ minHeight: 52, borderRadius: 999 }}>
                  Kendini tanıt
                </Button>
              )}
              <Button
                variant={joinedIds.size > 0 ? 'outlined' : 'contained'}
                size="large"
                onClick={() => navigate('/home', { replace: true })}
                sx={{ minHeight: 52, borderRadius: 999 }}
              >
                Akışa git
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>

      {stepKey !== 'done' && (
        <Box
          sx={{
            position: 'sticky', bottom: 0, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider',
            px: 2, pt: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))'
          }}
        >
          <Box sx={{ maxWidth: 640, mx: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={next}
              disabled={busy}
              sx={{ minHeight: 52, borderRadius: 999, fontWeight: 700 }}
            >
              {busy ? <CircularProgress size={22} color="inherit" /> : primaryLabel}
            </Button>
          </Box>
        </Box>
      )}

      <NewPostDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        initialTitle={intro.title}
        initialContent={intro.content}
        onCreated={() => navigate('/home', { replace: true })}
      />
    </Box>
  )
}
