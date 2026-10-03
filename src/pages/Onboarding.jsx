import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, ButtonBase, CircularProgress, InputAdornment, Skeleton, Stack, TextField, Typography
} from '@mui/material'
import {
  ArrowBackRounded, CheckRounded, EditNoteRounded, GroupsRounded, PeopleAltRounded, SearchRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import {
  completeOnboarding, getMyDiseaseGroups, joinDiseaseGroup, listDiseaseGroups, updateHealthProfile
} from '../services/api.js'
import HealthProfileFields, { RolePicker } from '../components/profile/HealthProfileFields.jsx'
import NewPostDialog from '../components/NewPostDialog.jsx'
import Companion from '../components/avatars/Companion.jsx'
import LeafBurst from '../components/celebration/LeafBurst.jsx'
import { LIMITS, cleanHealthProfile, filterPrefixFirst } from '../utils/validation.js'
import { radius } from '../design/tokens.js'
import '../styles/companions.css'

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

// Üstteki yumuşak ilerleme: her adım için bir yaprak-nokta, şu anki uzar.
function StepDots({ step, total }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      role="progressbar"
      aria-label={`Adım ${step + 1} / ${total}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step + 1}
      sx={{ alignItems: 'center' }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          sx={{
            height: 8, width: i === step ? 28 : 8, borderRadius: `${radius.pill}px`,
            bgcolor: i <= step ? 'primary.main' : 'brand.borderStrong',
            transition: 'width 420ms var(--ease-spring), background-color 300ms ease',
          }}
        />
      ))}
    </Stack>
  )
}

// Adım başlığındaki küçük yol arkadaşı grubu; her biri sırayla "gelir".
function CompanionTrio({ names }) {
  return (
    <Stack direction="row" sx={{ mb: 2 }} aria-hidden>
      {names.map((n, i) => (
        <Box key={n} className="sg-arrive" sx={{ ml: i ? -1.25 : 0, animationDelay: `${i * 90}ms`, borderRadius: '50%', border: '3px solid', borderColor: 'background.default' }}>
          <Companion name={n} size={i === 1 ? 60 : 52} />
        </Box>
      ))}
    </Stack>
  )
}

function StepHeading({ title, children }) {
  return (
    <Box>
      <Typography variant="h2" component="h1" sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>{children}</Typography>
    </Box>
  )
}

function GroupSkeletonList() {
  return (
    <Stack spacing={1} aria-busy="true" aria-label="Gruplar yükleniyor">
      {[0, 1, 2, 3].map(i => (
        <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: `${radius.lg}px`, bgcolor: 'background.paper', border: '2px solid', borderColor: 'brand.border' }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="25%" sx={{ fontSize: '0.75rem' }} />
          </Box>
          <Skeleton variant="circular" width={26} height={26} />
        </Stack>
      ))}
    </Stack>
  )
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
  // Kayıtlı değerler geçerli kümeye indirgenir (listede olmayan eski şehir boş görünür).
  const [profile, setProfile] = useState(() => cleanHealthProfile(user || {}))
  const [groups, setGroups] = useState(null)
  const [joinedIds, setJoinedIds] = useState(new Set())
  const [selected, setSelected] = useState(new Set())
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [burst, setBurst] = useState(0)

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

  // Türkçe duyarlı (İ/ı, aksanlar), adı aramayla başlayanlar önce.
  const filteredGroups = useMemo(() => {
    if (!groups) return []
    return filterPrefixFirst(groups, query, { getLabel: g => `${g.name} ${g.description || ''}` })
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
      const clean = cleanHealthProfile(profile)
      if (saveProfile && (clean.communityRole || clean.diagnosisYear || clean.city || clean.discoverable)) {
        await updateHealthProfile(token, clean)
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
      setBurst(Date.now())
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
      <LeafBurst trigger={burst} />
      {/* Üst bar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.default', pt: 'env(safe-area-inset-top)' }}>
        <Stack direction="row" alignItems="center" sx={{ px: 1, py: 1, maxWidth: 640, mx: 'auto', width: '100%', minHeight: 60 }}>
          <Box sx={{ flex: 1, display: 'flex' }}>
            {step > 0 && stepKey !== 'done' && (
              <Button onClick={() => setStep(s => s - 1)} startIcon={<ArrowBackRounded />} disabled={busy}>
                Geri
              </Button>
            )}
          </Box>
          {stepKey !== 'done' && <StepDots step={step} total={STEPS.length - 1} />}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {stepKey !== 'done' && (
              <Button onClick={skipAll} disabled={busy}>
                Şimdilik geç
              </Button>
            )}
          </Box>
        </Stack>
      </Box>

      <Box key={stepKey} className="sg-step-in" sx={{ flex: 1, px: 2, pt: { xs: 2, md: 5 }, pb: 4, maxWidth: 640, mx: 'auto', width: '100%' }}>
        {stepKey === 'role' && (
          <Stack spacing={3}>
            <Box>
              <CompanionTrio names={['damla', 'filiz', 'bulut']} />
              <StepHeading title={`Hoş geldin${user?.firstName ? `, ${user.firstName}` : ''}`}>
                Sağlıktan, aynı yoldan geçen insanların birbirine deneyimiyle eşlik ettiği bir topluluk.
                Sana uygun grupları ve insanları gösterebilmemiz için üç kısa soru soracağız.
              </StepHeading>
            </Box>
            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 1.25 }}>Toplulukta kim olarak bulunuyorsun?</Typography>
              <RolePicker value={profile.communityRole} onChange={(communityRole) => setProfile(p => ({ ...p, communityRole }))} />
            </Box>
          </Stack>
        )}

        {stepKey === 'groups' && (
          <Stack spacing={2.5}>
            <StepHeading title="Hangi gruplar sana yakın?">
              Her grup, bir hastalıkla yaşayanları ve yakınlarını bir araya getirir. Katıldığın grupların
              paylaşımları ana sayfanda görünür; birden fazla seçebilirsin.
            </StepHeading>
            {groups && groups.length > 6 && (
              <TextField
                type="search"
                placeholder="Hastalık ara…"
                value={query}
                onChange={e => setQuery(e.target.value.slice(0, LIMITS.SEARCH_MAX))}
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> },
                  htmlInput: { 'aria-label': 'Hastalık ara', maxLength: LIMITS.SEARCH_MAX, enterKeyHint: 'search', autoComplete: 'off' }
                }}
              />
            )}
            {groups === null ? <GroupSkeletonList /> : (
              <Stack spacing={1} role="group" aria-label="Hastalık grupları" className="sg-stagger">
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
                        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, minHeight: 72, borderRadius: `${radius.lg}px`, textAlign: 'left', justifyContent: 'flex-start',
                        border: '2px solid', borderColor: isSel ? 'primary.main' : 'brand.border',
                        bgcolor: isSel ? 'brand.primarySoft' : 'background.paper',
                        transition: 'border-color 200ms ease, background-color 200ms ease, transform 160ms var(--ease-spring)',
                        '&:active': { transform: 'scale(0.985)' },
                        '&.Mui-disabled': { opacity: 1 }
                      }}
                    >
                      <Box sx={{ width: 44, height: 44, borderRadius: `${radius.sm}px`, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: isSel ? 'background.paper' : 'brand.surfaceAlt', color: 'primary.main' }}>
                        <GroupsRounded />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" component="span" sx={{ display: 'block', lineHeight: 1.3 }}>{g.name}</Typography>
                        <Typography variant="body2" component="span" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleAltRounded sx={{ fontSize: 16 }} /> {g.memberCount ?? 0} üye{already ? ' · zaten üyesin' : ''}
                        </Typography>
                      </Box>
                      <Box
                        key={isSel ? 'on' : 'off'}
                        className={isSel ? 'sg-pop' : undefined}
                        aria-hidden
                        sx={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                          border: '2px solid', borderColor: isSel ? 'primary.main' : 'brand.borderStrong',
                          bgcolor: isSel ? 'primary.main' : 'transparent', color: 'primary.contrastText'
                        }}
                      >
                        {isSel && <CheckRounded sx={{ fontSize: 18 }} />}
                      </Box>
                    </ButtonBase>
                  )
                })}
                {filteredGroups.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                    Aradığın grubu bulamadık. Daha sonra Gruplar sayfasından da bakabilirsin.
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        )}

        {stepKey === 'details' && (
          <Stack spacing={3}>
            <Box>
              <CompanionTrio names={['kaplumbaga', 'papatya']} />
              <StepHeading title="Senin gibi olanları bulalım">
                Hepsi isteğe bağlı. Paylaşırsan, benzer süreçten geçen üyeleri sana önerebiliriz.
              </StepHeading>
            </Box>
            <HealthProfileFields value={profile} onChange={setProfile} />
          </Stack>
        )}

        {stepKey === 'done' && (
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', pt: { xs: 4, md: 6 } }}>
            <Box className="sg-arrive" sx={{ borderRadius: '50%', boxShadow: 3, mb: 1 }}>
              <Companion name="filiz" size={128} />
            </Box>
            <Typography variant="h2" component="h1">Hazırsın{user?.firstName ? `, ${user.firstName}` : ''}!</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 440 }}>
              İlk yol arkadaşın Filiz seninle. Paylaşımların başkalarına faydalı geldikçe yeni yol arkadaşları açılır.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 440 }}>
              Kısaca kendini tanıtmak ister misin? İlk paylaşımlara genelde sıcak karşılamalar gelir.
            </Typography>
            <Stack spacing={1.25} sx={{ width: '100%', maxWidth: 360, pt: 1.5 }}>
              {joinedIds.size > 0 && (
                <Button variant="contained" size="large" startIcon={<EditNoteRounded />} onClick={() => setComposerOpen(true)}>
                  Kendini tanıt
                </Button>
              )}
              <Button
                variant={joinedIds.size > 0 ? 'outlined' : 'contained'}
                size="large"
                onClick={() => navigate('/home', { replace: true })}
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
            position: 'sticky', bottom: 0, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'brand.border',
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
