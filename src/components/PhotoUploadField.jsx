import { useEffect, useRef, useState } from 'react'
import { Box, ButtonBase, FormHelperText, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded'
import { alpha } from '@mui/material/styles'
import { paletteFor } from '../design/tokens.js'
import { prepareUploadablePhoto } from '../utils/compressImage.js'
import { requestPresignedUpload, uploadToPresignedUrl } from '../services/api.js'
import { LIMITS, photoInputError } from '../utils/validation.js'

// Backend'deki MediaConstraints.MAX_ATTACHMENTS_PER_POST ile aynı - burada
// tekrarlanmasının sebebi kullanıcıya limiti aşmadan ÖNCE (istek atmadan)
// geri bildirim verebilmek; gerçek doğrulama zaten sunucuda da var.
const MAX_PHOTOS = LIMITS.PHOTOS_MAX

/**
 * Gönderi oluşturma formunda çoklu fotoğraf seçici.
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
  // Seçimde elenen dosyalar için alanın altında gösterilen açıklama.
  const [notice, setNotice] = useState(null)

  // Sıkıştırma/yükleme sürerken kullanıcı fotoğrafı kaldırabilir ya da
  // pencereyi kapatabilir; o durumda önizleme URL'i hiç oluşturulmamalı
  // (oluşursa kimse serbest bırakmaz - bellek sızıntısı).
  const liveIdsRef = useRef(new Set())
  liveIdsRef.current = new Set(value.map(e => e.id))
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  const isLive = (id) => mountedRef.current && liveIdsRef.current.has(id)

  const handleFiles = (fileList) => {
    const picked = Array.from(fileList || [])
    const problems = []
    const valid = []
    for (const file of picked) {
      const problem = photoInputError(file)
      if (problem) problems.push(problem)
      else valid.push(file)
    }
    const files = valid.slice(0, Math.max(0, remainingSlots))
    if (valid.length > files.length) {
      problems.push(`En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsin; ${valid.length - files.length} tanesi eklenmedi.`)
    }
    setNotice(problems.length ? [...new Set(problems)].join(' ') : null)
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
      const compressed = await prepareUploadablePhoto(file)
      if (!isLive(id)) return
      const previewUrl = URL.createObjectURL(compressed)
      onChange(prev => prev.map(e => (e.id === id ? { ...e, status: 'uploading', previewUrl } : e)))

      const presigned = await requestPresignedUpload(token, compressed.type)
      await uploadToPresignedUrl(presigned.uploadUrl, compressed, compressed.type)
      if (!mountedRef.current) return

      onChange(prev => prev.map(e => (e.id === id ? { ...e, status: 'done', storageKey: presigned.storageKey } : e)))
    } catch (err) {
      console.error('Fotoğraf yüklenemedi:', err)
      if (!mountedRef.current) return
      onChange(prev => prev.map(e => (
        e.id === id ? { ...e, status: 'error', errorMessage: err.message || 'Fotoğraf yüklenemedi. Kaldırıp yeniden dene.' } : e
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
              <LinearProgress
                aria-label={entry.status === 'compressing' ? 'Sıkıştırılıyor' : 'Yükleniyor'}
                sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
              />
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
                width: { xs: 30, sm: 24 }, height: { xs: 30, sm: 24 },
                bgcolor: () => alpha(paletteFor('dark').background, 0.7), color: paletteFor('dark').ink,
                '&:hover': { bgcolor: () => alpha(paletteFor('dark').background, 0.88), color: paletteFor('dark').ink }
              }}
            >
              <CloseRounded sx={{ fontSize: { xs: 16, sm: 14 } }} />
            </IconButton>
          </Box>
        ))}
        {remainingSlots > 0 && (
          <ButtonBase
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            aria-label="Fotoğraf ekle"
            className="tap-scale"
            sx={{
              width: 84, height: 84, borderRadius: 2, border: '1px dashed', borderColor: 'divider',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: 'text.secondary',
              '&.Mui-focusVisible': { borderColor: 'primary.main', borderStyle: 'solid' }
            }}
          >
            <AddPhotoAlternateRoundedIcon />
          </ButtonBase>
        )}
      </Stack>
      {value.length > 0 && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {value.length}/{MAX_PHOTOS} fotoğraf
        </Typography>
      )}
      {value.filter(e => e.status === 'error').map(e => e.errorMessage).filter(Boolean).slice(0, 1).map(msg => (
        <FormHelperText key="upload-error" error sx={{ mx: 0 }}>{msg}</FormHelperText>
      ))}
      {notice && <FormHelperText error sx={{ mx: 0 }} role="status">{notice}</FormHelperText>}
    </Box>
  )
}
