import { useEffect, useRef, useState } from 'react'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'
import { CloseRounded, DownloadRounded, IosShareRounded } from '@mui/icons-material'
import { generateStoryCardBlob } from '../utils/generateStoryCard.js'
import { useNotification } from '../context/NotificationContext.jsx'

// Faz 2 adım 5: gönderiyi Instagram/WhatsApp story olarak paylaşılabilir bir
// görsele çeviren dialog. Kart üretimi (canvas -> PNG blob) burada değil
// generateStoryCard.js'te - bu bileşen sadece onu tetikleyip önizleme +
// paylaşma/indirme arayüzünü sağlıyor (tek sorumluluk ayrımı).
export default function ShareStoryCardDialog({ open, onClose, post }) {
  const [loading, setLoading] = useState(true)
  const [blob, setBlob] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [sharing, setSharing] = useState(false)
  const { showError } = useNotification()
  // Dialog kapanırken önizleme URL'ini serbest bırakmak için (bkz. aşağıdaki
  // cleanup effect) - object URL'ler tarayıcı tarafından otomatik toplanmıyor.
  const urlRef = useRef(null)

  useEffect(() => {
    if (!open || !post) return
    let cancelled = false
    setLoading(true)
    setBlob(null)
    generateStoryCardBlob(post)
      .then(generated => {
        if (cancelled) return
        const url = URL.createObjectURL(generated)
        urlRef.current = url
        setBlob(generated)
        setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) showError('Hikaye kartı oluşturulamadı.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open, post, showError])

  useEffect(() => {
    if (!open && urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
      setPreviewUrl(null)
    }
  }, [open])

  const share = async () => {
    if (!blob) return
    const file = new File([blob], `sagliktan-${post.id}.png`, { type: 'image/png' })
    // navigator.canShare({files}) desteklenmiyorsa (çoğu masaüstü tarayıcısı)
    // native paylaşım menüsü hiç açılamaz - bu durumda kullanıcıyı sessizce
    // "İndir" butonuna yönlendirmek yerine burada erken çıkıp indirmesini
    // söylüyoruz, boş/hatalı bir paylaşım denemesi yerine.
    if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
      showError('Bu cihazda doğrudan paylaşım desteklenmiyor, görseli indirip paylaşabilirsin.')
      return
    }
    setSharing(true)
    try {
      await navigator.share({
        files: [file],
        title: post.title,
        text: `${post.title} - Sağlıktan'da oku`,
      })
    } catch (err) {
      // AbortError: kullanıcı paylaşım menüsünü kapattı - bu bir hata değil.
      if (err?.name !== 'AbortError') showError('Paylaşılamadı.')
    } finally {
      setSharing(false)
    }
  }

  const download = () => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `sagliktan-${post.id}.png`
    a.click()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Hikaye Kartı
        <IconButton size="small" onClick={onClose}><CloseRounded fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            width: '100%', aspectRatio: '9 / 16', borderRadius: 3, overflow: 'hidden',
            bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid', borderColor: 'divider'
          }}
        >
          {loading ? (
            <CircularProgress size={28} />
          ) : previewUrl ? (
            <Box component="img" src={previewUrl} alt="Hikaye kartı önizlemesi" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Önizleme oluşturulamadı.</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
          <Button
            fullWidth variant="outlined" startIcon={<DownloadRounded />}
            onClick={download} disabled={loading || !blob} sx={{ minHeight: 44 }}
          >
            İndir
          </Button>
          <Button
            fullWidth variant="contained" startIcon={sharing ? <CircularProgress size={16} color="inherit" /> : <IosShareRounded />}
            onClick={share} disabled={loading || !blob || sharing} sx={{ minHeight: 44 }}
          >
            Paylaş
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
