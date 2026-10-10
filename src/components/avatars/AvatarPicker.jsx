import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, ButtonBase, Dialog, IconButton, Skeleton, Stack, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { CheckRounded, CloseRounded, LockRounded, ThumbUpAltRounded } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { getAvatarOptions, selectAvatar } from '../../services/api.js'
import { radius } from '../../design/tokens.js'
import { useDialogHistory } from '../../hooks/useDialogHistory.js'
import LeafBurst from '../celebration/LeafBurst.jsx'
import UserAvatar from './UserAvatar.jsx'
import Companion from './Companion.jsx'
import { hasAvatarArt } from './avatarArt.jsx'
import { clearFresh, nextCompanion, readUnlockMemory, setAvatarOptions, syncUnlockMemory } from './avatarUnlocks.js'
import '../../styles/companions.css'

const GRID = { display: 'grid', gridTemplateColumns: { xs: 'repeat(4, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 0.5, sm: 1 } }

function Badge({ children, sx }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%',
        display: 'grid', placeItems: 'center', ...sx
      }}
    >
      {children}
    </Box>
  )
}

function Tile({ option, selected, isNew, onPick, disabled, justPicked }) {
  const locked = !option.unlocked
  return (
    <ButtonBase
      onClick={() => onPick(option)}
      disabled={disabled}
      aria-pressed={locked ? undefined : selected}
      aria-label={locked
        ? `${option.name}, kilitli: ${option.requiredHelpful} faydalı oyda açılır`
        : `${option.name}${isNew ? ' (yeni)' : ''}${selected ? ', seçili' : ' avatarını seç'}`}
      className={locked ? undefined : 'sg-sway-on-hover'}
      sx={{
        position: 'relative', flexDirection: 'column', gap: 0.75, px: 0.5, pt: 1.5, pb: 1.25, minWidth: 0,
        borderRadius: `${radius.md}px`,
        border: '2px solid', borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: selected ? 'brand.primarySoft' : 'transparent',
        transition: 'transform 160ms var(--ease-spring), background-color 200ms ease, border-color 200ms ease',
        '&:active': { transform: locked ? 'none' : 'scale(0.94)' },
        '&:hover': { bgcolor: selected ? 'brand.primarySoft' : 'action.hover' },
        '&.Mui-focusVisible': { borderColor: 'primary.light' },
      }}
    >
      <Box
        key={justPicked ? 'picked' : 'idle'}
        className={justPicked ? 'sg-ring-out' : undefined}
        sx={{
          borderRadius: '50%',
          filter: locked ? 'grayscale(0.9)' : 'none',
          opacity: locked ? 0.42 : 1,
          transition: 'opacity 200ms ease',
        }}
      >
        <Box className="sg-sway-target">
          <UserAvatar avatarKey={option.key} name={option.name} size={58} aria-hidden />
        </Box>
      </Box>
      {locked && (
        <Badge sx={{ bgcolor: 'background.paper', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}>
          <LockRounded sx={{ fontSize: 13 }} />
        </Badge>
      )}
      {selected && (
        <Badge sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CheckRounded className="sg-pop" sx={{ fontSize: 16 }} />
        </Badge>
      )}
      {isNew && !selected && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute', top: 4, left: 4, px: 0.75, borderRadius: `${radius.pill}px`,
            bgcolor: 'secondary.main', color: 'secondary.contrastText', fontSize: '0.68rem', fontWeight: 800, lineHeight: '18px'
          }}
        >
          Yeni
        </Box>
      )}
      <Typography
        variant="caption"
        component="span"
        sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '0.76rem', sm: '0.8125rem' }, maxWidth: '100%', overflowWrap: 'anywhere', color: locked ? 'text.secondary' : 'text.primary' }}
      >
        {option.name}
      </Typography>
      {locked && (
        <Typography variant="caption" component="span" sx={{ color: 'text.secondary', lineHeight: 1, fontSize: '0.72rem', fontWeight: 700 }}>
          {option.requiredHelpful} oy
        </Typography>
      )}
    </ButtonBase>
  )
}

function SectionTitle({ children, count }) {
  return (
    <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1, mt: 2.5 }}>
      <Typography variant="h5" component="h3" sx={{ fontSize: '1.125rem' }}>{children}</Typography>
      {count != null && <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>{count}</Typography>}
    </Stack>
  )
}

function ProgressCard({ data, fullName }) {
  const helpful = data?.helpfulReceived ?? 0
  const next = nextCompanion(data)
  const currentKey = hasAvatarArt(data?.selectedKey) ? data.selectedKey : null
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: `${radius.lg}px`, bgcolor: 'brand.apricotSoft' }}
    >
      <Box key={currentKey || 'initials'} className="sg-arrive" sx={{ flexShrink: 0 }}>
        <UserAvatar
          avatarKey={currentKey}
          name={fullName}
          size={76}
          sx={{ border: '3px solid', borderColor: 'background.paper', boxShadow: 2 }}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <ThumbUpAltRounded sx={{ fontSize: 18, color: 'brand.apricotInk' }} />
          {data ? (
            <Typography variant="subtitle1" component="p" sx={{ color: 'brand.apricotInk', fontWeight: 800 }}>
              {helpful} faydalı oy
            </Typography>
          ) : <Skeleton width={110} />}
        </Stack>
        {!data ? (
          <>
            <Skeleton width="80%" />
            <Skeleton variant="rounded" height={10} sx={{ mt: 1, borderRadius: `${radius.pill}px` }} />
          </>
        ) : next ? (
          <>
            <Typography variant="body2" sx={{ mt: 0.25 }}>
              Sıradaki yol arkadaşın <b>{next.avatar.name}</b>, {next.remaining} oy kaldı.
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <Box
                role="progressbar"
                aria-label={`${next.avatar.name} için ilerleme`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(next.progress)}
                sx={{ flex: 1, height: 10, borderRadius: `${radius.pill}px`, bgcolor: 'background.paper', overflow: 'hidden' }}
              >
                <Box className="sg-grow" sx={{ height: '100%', width: `${Math.max(6, next.progress)}%`, bgcolor: 'secondary.main', borderRadius: `${radius.pill}px` }} />
              </Box>
              <Companion name={next.avatar.key} size={30} sx={{ filter: 'grayscale(0.9)', opacity: 0.55 }} />
            </Stack>
          </>
        ) : (
          <Typography variant="body2" sx={{ mt: 0.25 }}>
            Bütün yol arkadaşlarını açtın. Bu toplulukta bıraktığın iz için teşekkürler!
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

/**
 * Avatar seçici: kişinin aldığı "Faydalı" oylarla açılan yol arkadaşları.
 * Açık olanlar üstte, sıradakiler altta soluk ve kilitli; yeni açılan bir
 * yol arkadaşını ilk kez seçmek küçük bir yaprak yağmuruyla kutlanır.
 */
export default function AvatarPicker({ open, onClose }) {
  const { token, user, applyServerUser } = useAuth()
  const { showError, showSuccess, showInfo } = useNotification()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  useDialogHistory(open && fullScreen, onClose)
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [fresh, setFresh] = useState([])
  const [burst, setBurst] = useState(0)
  const [justPicked, setJustPicked] = useState(null)
  const userId = user?.id

  useEffect(() => {
    if (!open || !token) return undefined
    let alive = true
    getAvatarOptions(token)
      .then(res => {
        if (!alive) return
        if (userId != null) {
          setAvatarOptions(userId, res)
          // Seçici açıkken yeni açılanlar kutlanmaz, yalnızca "Yeni" rozeti alır.
          syncUnlockMemory(userId, res)
          setFresh(readUnlockMemory(userId).fresh)
        }
        setData(res)
      })
      .catch(err => { if (alive) { showError(err.message || 'Yol arkadaşları yüklenemedi. Bağlantını kontrol edip tekrar dener misin?'); onClose() } })
    return () => { alive = false }
  }, [open, token, userId, showError, onClose])

  const { unlocked, locked } = useMemo(() => {
    const all = data?.avatars || []
    return {
      unlocked: all.filter(a => a.unlocked),
      locked: all.filter(a => !a.unlocked).sort((a, b) => a.requiredHelpful - b.requiredHelpful),
    }
  }, [data])

  const pick = async (option) => {
    if (!option.unlocked) {
      const left = option.requiredHelpful - (data?.helpfulReceived || 0)
      showInfo(`${option.name} için ${left} faydalı oy daha gerekiyor. Paylaşımların ve yorumların faydalı bulundukça açılır.`)
      return
    }
    if (option.key === data?.selectedKey) return
    setSaving(true)
    try {
      applyServerUser(await selectAvatar(token, option.key))
      const nextData = { ...data, selectedKey: option.key }
      setData(nextData)
      if (userId != null) setAvatarOptions(userId, nextData)
      setJustPicked(option.key)
      if (fresh.includes(option.key)) {
        setBurst(Date.now())
        if (userId != null) clearFresh(userId, option.key)
        setFresh(f => f.filter(k => k !== option.key))
        showSuccess(`Hoş geldin ${option.name}! Artık yol arkadaşın.`)
      } else {
        showSuccess(`Yeni yol arkadaşın: ${option.name}`)
      }
    } catch (err) {
      showError(err.message || 'Yol arkadaşın değiştirilemedi. Tekrar dener misin?')
    } finally {
      setSaving(false)
    }
  }

  const resetToInitials = async () => {
    setSaving(true)
    try {
      applyServerUser(await selectAvatar(token, null))
      const nextData = { ...data, selectedKey: null }
      setData(nextData)
      if (userId != null) setAvatarOptions(userId, nextData)
    } catch (err) {
      showError(err.message || 'Değiştirilemedi. Tekrar dener misin?')
    } finally {
      setSaving(false)
    }
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="avatar-picker-title"
      aria-describedby="avatar-picker-desc"
    >
      <LeafBurst trigger={burst} />
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1, pt: fullScreen ? 'calc(env(safe-area-inset-top) + 8px)' : 1.5, pb: 0.5 }}>
        <IconButton onClick={onClose} aria-label="Kapat" sx={{ width: 44, height: 44 }}><CloseRounded /></IconButton>
        <Typography id="avatar-picker-title" variant="h4" component="h2" sx={{ flex: 1 }}>Yol arkadaşını seç</Typography>
      </Stack>

      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 'calc(24px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
        <Typography id="avatar-picker-desc" variant="body2" sx={{ color: 'text.secondary', mb: 2, mt: 0.5 }}>
          Profilinde seni yol arkadaşın temsil eder. Paylaşımların ve yorumların başkalarına faydalı geldikçe
          yenileri açılır.
        </Typography>

        <ProgressCard data={data} fullName={fullName} />

        {!data ? (
          <>
            <SectionTitle>Seçebileceklerin</SectionTitle>
            <Box sx={GRID}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Stack key={i} alignItems="center" spacing={0.75} sx={{ pt: 1.5, pb: 1.25 }}>
                  <Skeleton variant="circular" width={58} height={58} />
                  <Skeleton variant="text" width={44} />
                </Stack>
              ))}
            </Box>
          </>
        ) : (
          <>
            <SectionTitle count={unlocked.length}>Seçebileceklerin</SectionTitle>
            <Box sx={GRID} className="sg-stagger">
              {unlocked.map(o => (
                <Tile
                  key={o.key}
                  option={o}
                  selected={o.key === data.selectedKey}
                  isNew={fresh.includes(o.key)}
                  justPicked={justPicked === o.key}
                  onPick={pick}
                  disabled={saving}
                />
              ))}
            </Box>
            {locked.length > 0 && (
              <>
                <SectionTitle count={locked.length}>Yolda seni bekleyenler</SectionTitle>
                <Box sx={GRID}>
                  {locked.map(o => (
                    <Tile key={o.key} option={o} selected={false} isNew={false} onPick={pick} disabled={saving} />
                  ))}
                </Box>
              </>
            )}
            {data.selectedKey && (
              <Button onClick={resetToInitials} disabled={saving} sx={{ mt: 2.5 }}>
                Baş harflerimi kullan
              </Button>
            )}
          </>
        )}
      </Box>
    </Dialog>
  )
}
