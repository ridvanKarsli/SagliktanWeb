import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Slide, Stack, Typography } from '@mui/material'
import { CloseRounded, InstallMobileRounded, IosShareRounded } from '@mui/icons-material'

// PWA zaten kurulabilir durumda (manifest.webmanifest + kayıtlı service
// worker, bkz. public/sw.js ve main.jsx) - tarayıcı bunu kendi menüsünden
// de sunuyor. Ama kullanıcı bunu fark etmeyebilir, bu yüzden görünür bir
// "uygulama olarak ekle" daveti gösteriyoruz:
// - Android/Chrome/Edge: native `beforeinstallprompt` olayını yakalayıp tek
//   tıkla kurulum sunuyoruz.
// - iOS Safari: bu olay hiç desteklenmiyor (Apple kısıtı), o yüzden sadece
//   "Paylaş > Ana Ekrana Ekle" adımını gösteriyoruz.
const DISMISS_KEY = 'sagliktan_install_prompt_dismissed_at'
const DISMISS_DAYS = 14

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream
}

function recentlyDismissed() {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (!dismissedAt) return false
  const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return days < DISMISS_DAYS
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState(null) // 'android' | 'ios'

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return

    if (isIos()) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('android')
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    try { await deferredPrompt.userChoice } catch { /* kullanıcı kapattı, önemli değil */ }
    setDeferredPrompt(null)
    dismiss()
  }

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          left: 12,
          right: 12,
          bottom: { xs: 'calc(64px + env(safe-area-inset-bottom) + 12px)', md: 16 },
          zIndex: (theme) => theme.zIndex.appBar + 2,
          maxWidth: 420,
          mx: 'auto',
          p: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 32px rgba(0,0,0,0.28)'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ display: 'flex', color: 'primary.main', pt: 0.25, flexShrink: 0 }}>
            <InstallMobileRounded />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Sağlıktan'ı uygulama olarak ekle
            </Typography>
            {platform === 'ios' ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Paylaş <IosShareRounded sx={{ fontSize: 14, verticalAlign: 'middle' }} /> simgesine, ardından
                "Ana Ekrana Ekle"ye dokun.
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Ana ekranına ekle, tek dokunuşla aç.
                </Typography>
                <Button size="small" variant="contained" onClick={install}>
                  Yükle
                </Button>
              </>
            )}
          </Box>
          <IconButton size="small" onClick={dismiss} sx={{ color: 'text.secondary', flexShrink: 0 }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Slide>
  )
}
