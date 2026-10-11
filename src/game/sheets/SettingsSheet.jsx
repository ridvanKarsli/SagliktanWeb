// Mahalle ayarları: evin kimlere açık, takma ad (7 günde bir), yol arkadaşı,
// görünüm. Her bölüm kendi "Kaydet"iyle; yanlışlıkla toplu değişiklik olmasın.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Divider, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material'
import { BlockRounded, CheckroomRounded, SettingsRounded } from '@mui/icons-material'
import { CharacterBust } from '../art/index.js'
import Companion from '../../components/avatars/Companion.jsx'
import { AVATAR_ART } from '../../components/avatars/avatarArt.jsx'
import SaglikLoader from '../../components/common/SaglikLoader.jsx'
import { getAvatarOptions, isAbortError } from '../../services/api.js'
import { parseServerDate, relativeTime } from '../../utils/format.js'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useGame } from '../state/GameContext.jsx'
import * as api from '../api/gameApi.js'
import { ROOM_VISIBILITY_OPTIONS } from '../data/catalog.js'
import GameSheet from '../ui/GameSheet.jsx'
import RadioTiles from '../ui/RadioTiles.jsx'
import { validateNickname, nicknameServerError } from '../ui/nickname.js'

function H({ children, id }) {
  return <Typography id={id} component="h3" sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 1 }}>{children}</Typography>
}

export default function SettingsSheet({ open, onClose }) {
  const navigate = useNavigate()
  const { token, profile, setProfile } = useGame()
  const { showSuccess, showError } = useNotification()
  const [visibility, setVisibility] = useState(profile?.roomVisibility || 'EVERYONE')
  const [nick, setNick] = useState(profile?.nickname || '')
  const [nickErr, setNickErr] = useState(null)
  const [busy, setBusy] = useState(null)
  const [pets, setPets] = useState(null)
  const [blocked, setBlocked] = useState(null) // null = yükleniyor
  const [blockedError, setBlockedError] = useState(null)
  const [unblocking, setUnblocking] = useState(null)
  const confirm = useConfirm()

  useEffect(() => {
    if (!open) return undefined
    setVisibility(profile?.roomVisibility || 'EVERYONE')
    setNick(profile?.nickname || '')
    setNickErr(null)
    const ctrl = new AbortController()
    getAvatarOptions(token)
      .then((r) => { if (!ctrl.signal.aborted) setPets((r?.avatars || []).filter((a) => a.unlocked && AVATAR_ART[a.key])) })
      .catch((err) => { if (!isAbortError(err)) setPets([]) }) // isteğe bağlı liste: gelmezse yalnızca "yok"
    setBlocked(null)
    setBlockedError(null)
    api.getBlockedPlayers(token, { signal: ctrl.signal })
      .then((r) => { if (!ctrl.signal.aborted) setBlocked(Array.isArray(r) ? r : []) })
      .catch((err) => { if (!isAbortError(err)) setBlockedError(err?.message || 'Liste yüklenemedi.') })
    return () => ctrl.abort()
    // profil alanları yalnızca açılışta forma kopyalanır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token])

  if (!profile) return null
  const changeAt = parseServerDate(profile.nicknameChangeableAt)
  const nickLocked = changeAt && changeAt > new Date()

  const run = async (key, fn, ok) => {
    setBusy(key)
    try {
      const p = await fn()
      if (p) setProfile(p)
      showSuccess(ok)
      return true
    } catch (err) {
      if (key === 'nick') {
        const m = nicknameServerError(err) || err?.message
        setNickErr(m || 'Kaydedilemedi.')
      } else showError(err?.message || 'Kaydedilemedi.')
      return false
    } finally {
      setBusy(null)
    }
  }

  const unblock = async (player) => {
    const ok = await confirm(
      `${player.nickname} seni yeniden görebilecek; evine uğrayabilir, hediye bırakabilir.`,
      { title: 'Engel kaldırılsın mı?', confirmLabel: 'Engeli kaldır', danger: false },
    )
    if (!ok) return
    setUnblocking(player.publicId)
    try {
      await api.unblockPlayer(token, player.publicId)
      setBlocked((list) => (list || []).filter((b) => b.player.publicId !== player.publicId))
      showSuccess(`${player.nickname} için engel kaldırıldı.`)
    } catch (err) {
      showError(err?.message || 'Engel kaldırılamadı, tekrar dene.')
    } finally {
      setUnblocking(null)
    }
  }

  const saveNick = () => {
    const v = validateNickname(nick)
    if (v) return setNickErr(v)
    run('nick', () => api.updateNickname(token, nick.trim()), 'Takma adın güncellendi.')
  }

  return (
    <GameSheet open={open} onClose={onClose} title="Mahalle ayarları" icon={<SettingsRounded />}>
      <Box component="section" sx={{ mb: 3 }}>
        <H id="vis-h">Evime kimler girebilir?</H>
        <RadioGroup aria-labelledby="vis-h" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          {ROOM_VISIBILITY_OPTIONS.map((o) => (
            <FormControlLabel
              key={o.value}
              value={o.value}
              control={<Radio />}
              sx={{ alignItems: 'flex-start', mx: 0, py: 0.5, '& .MuiRadio-root': { mt: -0.5 } }}
              label={(
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{o.label}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{o.help}</Typography>
                </Box>
              )}
            />
          ))}
        </RadioGroup>
        <Button
          variant="contained" disabled={visibility === profile.roomVisibility || busy === 'vis'}
          onClick={() => run('vis', () => api.updateSettings(token, visibility), 'Ev ayarın kaydedildi.')}
          sx={{ mt: 1, minHeight: 48, borderRadius: 999, fontWeight: 800 }}
        >
          Kaydet
        </Button>
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      <Box component="section" sx={{ mb: 3 }}>
        <H>Takma adın</H>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {nickLocked
            ? `Takma adını ${changeAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} tarihinden sonra değiştirebilirsin.`
            : 'Takma adını 7 günde bir değiştirebilirsin.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
          <TextField
            fullWidth value={nick} disabled={nickLocked}
            onChange={(e) => { setNick(e.target.value); setNickErr(null) }}
            label="Takma ad" error={!!nickErr} helperText={nickErr || ' '}
            slotProps={{ htmlInput: { maxLength: 20, autoComplete: 'off' } }}
          />
          <Button
            variant="outlined" disabled={nickLocked || nick.trim() === profile.nickname || busy === 'nick'}
            onClick={saveNick}
            sx={{ minHeight: 56, borderRadius: '14px', fontWeight: 800, flexShrink: 0 }}
          >
            Değiştir
          </Button>
        </Stack>
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      <Box component="section" sx={{ mb: 3 }}>
        <H id="pet-h">Yol arkadaşın</H>
        {pets === null ? <SaglikLoader size="md" label="Yükleniyor" /> : (
          <RadioTiles
            labelId="pet-h" size={52} value={profile.petKey ?? null}
            onChange={(v) => { if (busy !== 'pet') run('pet', () => api.updatePet(token, v), v ? 'Yol arkadaşın yanında.' : 'Yol arkadaşın evde dinleniyor.') }}
            options={[
              { value: null, label: 'Yok', render: <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed', borderColor: 'divider' }} /> },
              ...pets.map((p) => ({ value: p.key, label: p.name, render: <Companion name={p.key} size={48} /> })),
            ]}
          />
        )}
        {pets && pets.length === 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>Sağlıktan’da başkalarına faydalı oldukça yeni yol arkadaşları açılır.</Alert>
        )}
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      <Box component="section" sx={{ mb: 3 }}>
        <H>Engellediklerin</H>
        {blockedError && <Alert severity="warning">{blockedError}</Alert>}
        {!blockedError && blocked === null && <SaglikLoader size="md" label="Yükleniyor" />}
        {blocked && blocked.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Kimseyi engellemedin. Biri seni rahatsız ederse kartından “Engelle”yi seçebilirsin.
          </Typography>
        )}
        {blocked && blocked.length > 0 && (
          <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {blocked.map(({ player, blockedAt }) => (
              <Box component="li" key={player.publicId} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                <CharacterBust appearance={player.appearance} size={44} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800 }} noWrap>{player.nickname}</Typography>
                  {blockedAt && <Typography variant="caption" sx={{ color: 'text.secondary' }}>Engellendi · {relativeTime(blockedAt)}</Typography>}
                </Box>
                <Button
                  size="small" variant="outlined" startIcon={<BlockRounded />}
                  disabled={unblocking === player.publicId}
                  onClick={() => unblock(player)}
                  aria-label={`${player.nickname} için engeli kaldır`}
                  sx={{ minHeight: 44, borderRadius: 999, fontWeight: 800, flexShrink: 0 }}
                >
                  Engeli kaldır
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      <Box component="section">
        <H>Görünümün</H>
        <Button
          variant="outlined" startIcon={<CheckroomRounded />}
          onClick={() => { onClose(); navigate('/game/karakter') }}
          sx={{ minHeight: 48, borderRadius: 999, fontWeight: 800 }}
        >
          Görünümünü değiştir
        </Button>
      </Box>
    </GameSheet>
  )
}
