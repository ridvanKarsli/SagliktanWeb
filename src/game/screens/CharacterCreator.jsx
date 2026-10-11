// Karakter oluşturma (ilk giriş) ve görünüm düzenleme ekranı.
// Solda/üstte canlı büyük önizleme (önden/arkadan), altta etiketli radyo
// grupları. Yalnızca sahip olunan (ya da ücretsiz) parçalar seçilebilir;
// diğerleri kilitli ve fiyatıyla merak uyandırsın diye gösterilir.
import { useEffect, useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material'
import { ArrowBackRounded, ThreeSixtyRounded, LockRounded } from '@mui/icons-material'
import {
  Character, CharacterBust, ClothingSwatch, SKINS, HAIR_COLORS, HAIR_STYLES, DEFAULT_APPEARANCE, DEFAULT_LOOK_BY_BODY, BODIES,
} from '../art/index.js'
import { getAvatarOptions, isAbortError } from '../../services/api.js'
import Companion from '../../components/avatars/Companion.jsx'
import { AVATAR_ART } from '../../components/avatars/avatarArt.jsx'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { focusRingSx } from '../../design/focus.js'
import { useGame, ownedCount } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import RadioTiles from '../ui/RadioTiles.jsx'
import { validateNickname, nicknameServerError } from '../ui/nickname.js'
import { PetSprite } from '../render/Actor.jsx'

function Section({ title, children, hint }) {
  const id = useId()
  return (
    <Box component="section" aria-labelledby={id} sx={{ mb: 3 }}>
      <Typography id={id} variant="subtitle1" component="h2" sx={{ fontWeight: 800, mb: hint ? 0.25 : 1 }}>{title}</Typography>
      {hint && <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{hint}</Typography>}
      {typeof children === 'function' ? children(id) : children}
    </Box>
  )
}

function Dot({ color }) {
  return <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: color, boxShadow: 'inset 0 0 0 2px rgba(35,48,46,.15)' }} />
}

// Büyük önizleme: ayak noktası (0,0), ~76 px boy -> 2.6x ölçek.
function Preview({ appearance, petKey, facing, onRotate, compact }) {
  const h = compact ? 170 : 300
  return (
    <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: 'radial-gradient(110% 90% at 50% 0%, #FFFFFF 0%, #D7EEF3 60%, #C6E9A6 100%)', height: h }}>
      <svg width="100%" height="100%" viewBox="-50 -90 100 98" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Karakterinin önizlemesi">
        <ellipse cx={0} cy={2} rx={40} ry={8} fill="#97CC78" opacity="0.8" />
        {petKey && <g transform="translate(-30 3)"><PetSprite petKey={petKey} /></g>}
        <Character appearance={appearance} facing={facing} />
      </svg>
      <Button
        onClick={onRotate}
        startIcon={<ThreeSixtyRounded />}
        variant="contained"
        color="inherit"
        sx={{ position: 'absolute', right: 10, bottom: 10, minHeight: 44, borderRadius: 999, bgcolor: 'rgba(255,253,248,.92)', color: '#23302E', fontWeight: 800, boxShadow: 1, '&:hover': { bgcolor: '#fff' } }}
      >
        {facing === 'front' ? 'Arkanı dön' : 'Önüne dön'}
      </Button>
    </Box>
  )
}

export default function CharacterCreator({ mode = 'create' }) {
  const navigate = useNavigate()
  const { token, profile, catalog, setProfile } = useGame()
  const { showError, showSuccess } = useNotification()
  const editing = mode === 'edit' && profile
  const [appearance, setAppearance] = useState(() => (editing
    ? { ...DEFAULT_APPEARANCE, ...profile.appearance, body: profile.appearance?.body || 'female' }
    : { ...DEFAULT_APPEARANCE, ...DEFAULT_LOOK_BY_BODY.female }))
  // Kullanıcının elle seçtiği alanlar: beden değişince yalnızca dokunulmamış
  // alanlara o bedenin önerilen görünümü uygulanır (kısıtlama yok, öneri).
  // Düzenlemede mevcut görünüm zaten kişinin seçimi: hiçbir alan ezilmez.
  const [lookTouched, setLookTouched] = useState(() => new Set(editing ? ['skin', 'hair', 'hairColor', 'top', 'bottom', 'accessory'] : []))
  const [petKey, setPetKey] = useState(editing ? profile.petKey : null)
  const [nickname, setNickname] = useState('')
  const [touched, setTouched] = useState(false)
  const [serverNickError, setServerNickError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [facing, setFacing] = useState('front')
  const [busy, setBusy] = useState(false)
  const [pets, setPets] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    getAvatarOptions(token)
      .then((r) => { if (!ctrl.signal.aborted) setPets((r?.avatars || []).filter((a) => a.unlocked && AVATAR_ART[a.key])) })
      .catch((err) => { if (!isAbortError(err)) setPets([]) }) // yol arkadaşı listesi isteğe bağlı: gelmezse "yok" seçeneği kalır
    return () => ctrl.abort()
  }, [token])

  const isOwned = (item) => item.starter || item.price === 0 || ownedCount(profile, item.key) > 0
  const options = (slot, render) => catalog.clothing.filter((c) => c.slot === slot).map((c) => ({
    value: c.key, label: c.name, locked: !isOwned(c), price: c.price, render: render(c),
  }))
  const set = (slot) => (v) => {
    setLookTouched((t) => (t.has(slot) ? t : new Set(t).add(slot)))
    setAppearance((a) => ({ ...a, [slot]: v }))
  }
  const setBody = (body) => setAppearance((a) => {
    const look = DEFAULT_LOOK_BY_BODY[body] || {}
    const next = { ...a, body }
    for (const [k, v] of Object.entries(look)) if (k !== 'body' && !lookTouched.has(k)) next[k] = v
    return next
  })
  const bodyName = (k) => catalog.bodies?.find((b) => b.key === k)?.name || (k === 'male' ? 'Erkek' : 'Kadın')

  const nickError = validateNickname(nickname)
  const shownNickError = serverNickError || (touched && nickError)

  const submit = async (e) => {
    e?.preventDefault()
    setFormError(null)
    if (!editing) {
      setTouched(true)
      if (nickError) return
    }
    setBusy(true)
    try {
      if (editing) {
        let p = profile
        const changed = Object.keys(appearance).some((k) => (appearance[k] ?? null) !== (profile.appearance?.[k] ?? null))
        if (changed) p = await api.updateAppearance(token, appearance)
        if ((petKey ?? null) !== (profile.petKey ?? null)) p = await api.updatePet(token, petKey)
        setProfile(p)
        showSuccess('Görünümün güncellendi.')
        navigate(-1)
      } else {
        const p = await api.createMe(token, { nickname: nickname.trim(), appearance, petKey })
        setProfile(p)
        navigate('/mahalle', { replace: true })
      }
    } catch (err) {
      const nick = !editing && nicknameServerError(err)
      if (nick) setServerNickError(nick)
      else if (err?.status === 409 && !editing) {
        // profil zaten varmış (başka sekmede oluşturulmuş): baştan yükle
        window.location.reload()
      } else setFormError(err?.message || 'Kaydedilemedi, tekrar dene.')
      if (editing) showError(err?.message || 'Kaydedilemedi.')
    } finally {
      setBusy(false)
    }
  }

  const petOptions = useMemo(() => [
    { value: null, label: 'Yok', render: <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '2px dashed', borderColor: 'divider' }} /> },
    ...(pets || []).map((p) => ({ value: p.key, label: p.name, render: <Companion name={p.key} size={52} /> })),
  ], [pets])

  return (
    <Box sx={{ position: 'fixed', inset: 0, overflowY: 'auto', bgcolor: 'background.default' }}>
      <Box component="form" onSubmit={submit} noValidate sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 2, md: 4 }, pt: 'calc(env(safe-area-inset-top) + 12px)', pb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <IconButton
            onClick={() => (editing ? navigate(-1) : navigate('/home'))}
            aria-label={editing ? 'Vazgeç' : 'Sağlıktan’a dön'}
            sx={{ width: 44, height: 44, '&.Mui-focusVisible': focusRingSx }}
          >
            <ArrowBackRounded />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {editing ? 'Görünümünü değiştir' : 'Mahalle karakterini oluştur'}
            </Typography>
            {!editing && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Acele yok; istediğin zaman değiştirebilirsin.
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '380px 1fr' }, gap: { xs: 2, md: 4 }, alignItems: 'start' }}>
          <Box sx={{ position: 'sticky', top: { xs: 0, md: 16 }, zIndex: 2, pt: { xs: 0.5, md: 0 }, pb: { xs: 1, md: 0 }, bgcolor: 'background.default' }}>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Preview appearance={appearance} petKey={petKey} facing={facing} onRotate={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} compact />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Preview appearance={appearance} petKey={petKey} facing={facing} onRotate={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} />
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <LockRounded sx={{ fontSize: 18, mt: 0.2 }} aria-hidden="true" />
                Mahalle'de yalnızca takma adın görünür; gerçek adın ve grupların asla görünmez.
              </Typography>
            </Box>
          </Box>

          <Box>
            <Section title="Kadın mı, erkek mi?" hint="Tüm kıyafetler ikisinde de giyilebilir.">
              {(id) => (
                <RadioTiles
                  labelId={id} size={84} value={appearance.body || 'female'} onChange={setBody}
                  columns="repeat(2, minmax(0, 1fr))"
                  options={BODIES.map((b) => ({
                    value: b,
                    label: bodyName(b),
                    render: <CharacterBust appearance={{ ...appearance, ...(DEFAULT_LOOK_BY_BODY[b] && !lookTouched.has('hair') ? { hair: DEFAULT_LOOK_BY_BODY[b].hair } : {}), body: b }} size={84} bg={b === 'male' ? '#D5E9FA' : '#F9E0E4'} />,
                  }))}
                />
              )}
            </Section>
            <Section title="Ten rengi">
              {(id) => (
                <RadioTiles labelId={id} size={56} value={appearance.skin} onChange={set('skin')}
                  options={options('skin', (c) => <Dot color={SKINS[c.key]} />)} />
              )}
            </Section>
            <Section title="Saç modeli">
              {(id) => (
                <RadioTiles labelId={id} size={56} value={appearance.hair} onChange={set('hair')}
                  options={options('hair', (c) => <CharacterBust appearance={{ ...appearance, hair: c.key, accessory: null }} size={56} bg="#E6F1EC" />)
                    .filter((o) => HAIR_STYLES.includes(o.value))} />
              )}
            </Section>
            <Section title="Saç rengi">
              {(id) => (
                <RadioTiles labelId={id} size={56} value={appearance.hairColor} onChange={set('hairColor')}
                  options={options('hairColor', (c) => <Dot color={HAIR_COLORS[c.key]} />)} />
              )}
            </Section>
            <Section title="Üst" hint={!editing ? 'Kilitli olanları sonra Çarşı’dan alabilirsin.' : undefined}>
              {(id) => (
                <RadioTiles labelId={id} size={64} value={appearance.top} onChange={set('top')}
                  options={options('top', (c) => <ClothingSwatch slot="top" keyName={c.key} base={appearance} size={64} />)} />
              )}
            </Section>
            <Section title="Alt">
              {(id) => (
                <RadioTiles labelId={id} size={64} value={appearance.bottom} onChange={set('bottom')}
                  options={options('bottom', (c) => <ClothingSwatch slot="bottom" keyName={c.key} base={appearance} size={64} />)} />
              )}
            </Section>
            <Section title="Aksesuar">
              {(id) => (
                <RadioTiles labelId={id} size={64} value={appearance.accessory ?? null} onChange={set('accessory')}
                  options={[
                    { value: null, label: 'Yok', render: <ClothingSwatch slot="accessory" keyName={null} base={appearance} size={64} /> },
                    ...options('accessory', (c) => <ClothingSwatch slot="accessory" keyName={c.key} base={appearance} size={64} />),
                  ]} />
              )}
            </Section>
            <Section title="Yol arkadaşın" hint="Sağlıktan’da açtığın yol arkadaşları yanında yürür.">
              {(id) => (pets === null
                ? <SaglikLoader size="md" label="Yol arkadaşları yükleniyor" />
                : <RadioTiles labelId={id} size={56} value={petKey ?? null} onChange={setPetKey} options={petOptions} />)}
            </Section>

            {!editing && (
              <Section title="Takma adın">
                <TextField
                  fullWidth
                  value={nickname}
                  onChange={(e) => { setNickname(e.target.value); setServerNickError(null) }}
                  onBlur={() => setTouched(true)}
                  label="Takma ad"
                  placeholder="ör. Papatya_Teyze"
                  error={!!shownNickError}
                  helperText={shownNickError || '3–20 karakter: harf, rakam, boşluk ya da _'}
                  slotProps={{ htmlInput: { maxLength: 20, autoComplete: 'off', autoCapitalize: 'off', spellCheck: false } }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.25, display: { md: 'none' }, gap: 1, alignItems: 'flex-start' }}>
                  Mahalle'de yalnızca takma adın görünür; gerçek adın ve grupların asla görünmez.
                </Typography>
              </Section>
            )}

            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={busy}
              sx={{ minHeight: 56, fontSize: '1.1rem', fontWeight: 800, borderRadius: 999 }}
            >
              {busy ? <SaglikLoader size="sm" color="inherit" label="Kaydediliyor" /> : editing ? 'Kaydet' : 'Mahalleye çık'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
