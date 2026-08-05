import { useRef } from 'react'
import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded'
import { compressImage } from '../utils/compressImage.js'
import { requestPresignedUpload, uploadToPresignedUrl } from '../services/api.js'

// Backend'deki MediaConstraints.MAX_ATTACHMENTS_PER_POST ile aynı - burada
// tekrarlanmasının sebebi kullanıcıya limiti aşmadan ÖNCE (istek atmadan)
// geri bildirim verebilmek; gerçek doğrulama zaten sunucuda da var.
const MAX_PHOTOS = 6

/**
 * Gönderi oluşturma formunda çoklu fotoğraf seçici - Faz 2 adım 4.
 *
 * Kontrollü bileşen: `value` mevcut ek listesi, `onChange` bir React state
 * setter'ı GİBİ davranan fonksiyon (functional update - `prev => next` -
 * destekliyor). Kullanım yerinde doğrudan `useState`'in setter'ı
 * verilebilir (bkz. Posts.jsx) - böylece aynı anda birden fazla dosya
 * sıkıştırılıp/yüklenirken (her biri kendi Promise zincirinde ilerliyor,
 * birbirini beklemiyor) state güncellemeleri eşzamanlılık sorunu
 * yaşamadan (stale closure/birbirinin üstüne yazma) doğru şekilde birikir.
 *
 * Her giriş: { id, status: 'compressing'|'uploading'|'done'|'error',
 * previewUrl, storageKey, errorMessage }. Sadece status==='done' olanlar
 * gönderi oluşturma isteğine dahil edilmeli (bkz. Posts.jsx onSubmit).
 */
export default function PhotoUploadField({ value = [], onChange, token, disabled = false }) {
  const inputRef = useRef(null)
  const remainingSlots = MAX_PHOTOS - value.length

  const handleFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, Math.max(0, remainingSlots))
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      onChange(prev => [
        ...prev,
        { id, status: 'compressing', previewUrl: null, storageKey: null, errorMessage: null }
      ])
      processFile(id, file)
    }
  }

  const processFile = async (id, file) => {
    try {
      const compressed = await compressImage(file)
      const previewUrl = URL.createObjectURL(compressed)
      onChange(prev => prev.map(e => (e.id === id ? { ...e, status: 'uploading', previewUrl } : e)))

      const presigned = await requestPresignedUpload(token, compressed.type)
      await uploadToPresignedUrl(presigned.uploadUrl, compressed, compressed.type)

      onChange(prev => prev.map(e => (e.id === id ? { ...e, status: 'done', storageKey: presigned.storageKey } : e)))
    } catch (err) {
      console.error('Fotoğraf yüklenemedi:', err)
      onChange(prev => prev.map(e => (
        e.id === id ? { ...e, status: 'error', errorMessage: err.message || 'Yüklenemedi' } : e
      )))
    }
  }

  // Yüklemeden vazgeçilen (henüz posta bağlanmamış) bir fotoğraf R2'de
  // orphan kalabilir - bunu backend'den açıkça silmek için bir uç yok
  // (bkz. tasarım notu: MediaStorageService sadece post'a bağlıyken silme
  // destekliyor). Kabul edilebilir bir maliyet: ücretsiz kotanın (10GB)
  // çok altında kalacak kadar nadir bir senaryo.
  const removeEntry = (id) => {
    onChange(prev => {
      const entry = prev.find(e => e.id === id)
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl)
      return prev.filter(e => e.id !== id)
    })
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {value.map(entry => (
          <Box
            key={entry.id}
            sx={{
              position: 'relative', width: 84, height: 84, borderRadius: 2,
              overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0
            }}
          >
            {entry.previewUrl && (
              <Box
                component="img"
                src={entry.previewUrl}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: entry.status === 'error' ? 0.35 : 1 }}
              />
            )}
            {(entry.status === 'compressing' || entry.status === 'uploading') && (
              <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
            )}
            {entry.status === 'error' && (
              <ErrorOutlineRounded
                color="error"
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => removeEntry(entry.id)}
              disabled={disabled}
              aria-label="Fotoğrafı kaldır"
              sx={{
                position: 'absolute', top: 2, right: 2,
                width: { xs: 26, sm: 20 }, height: { xs: 26, sm: 20 },
                bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
              }}
            >
              <CloseRounded sx={{ fontSize: { xs: 16, sm: 14 } }} />
            </IconButton>
          </Box>
        ))}
        {remainingSlots > 0 && (
          <Box
            onClick={() => !disabled && inputRef.current?.click()}
            className="tap-scale"
            sx={{
              width: 84, height: 84, borderRadius: 2, border: '1px dashed', borderColor: 'divider',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              cursor: disabled ? 'default' : 'pointer', color: 'text.secondary'
            }}
          >
            <AddPhotoAlternateRoundedIcon />
          </Box>
        )}
      </Stack>
      {value.length > 0 && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {value.length}/{MAX_PHOTOS} fotoğraf
        </Typography>
      )}
    </Box>
  )
}
