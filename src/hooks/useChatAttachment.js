import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotification } from '../context/NotificationContext.jsx'
import { prepareUploadablePhoto } from '../utils/compressImage.js'
import { photoInputError } from '../utils/validation.js'
import { requestPresignedUpload, uploadToPresignedUrl } from '../services/api.js'

// Sohbete tek fotoğraf eki: sıkıştır -> önizleme -> R2'ye yükle.
// attachment: null | { status: 'compressing'|'uploading'|'done', previewUrl, storageKey }
//
// Yükleme sürerken ek kaldırılır ya da yenisi seçilirse eski işlemin sonucu
// yok sayılır; önizleme URL'leri kaldırmada ve unmount'ta serbest bırakılır.
export function useChatAttachment(token) {
  const { showError } = useNotification()
  const [attachment, setAttachment] = useState(null)
  const jobRef = useRef(0)
  const previewUrlRef = useRef(null)

  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
  }, [])

  useEffect(() => () => {
    jobRef.current += 1
    releasePreview()
  }, [releasePreview])

  const clear = useCallback(() => {
    jobRef.current += 1
    releasePreview()
    setAttachment(null)
  }, [releasePreview])

  const attach = useCallback(async (file) => {
    if (!file) return
    const problem = photoInputError(file)
    if (problem) { showError(problem); return }
    const job = ++jobRef.current
    const isCurrent = () => job === jobRef.current
    releasePreview()
    setAttachment({ status: 'compressing', previewUrl: null, storageKey: null })
    try {
      const compressed = await prepareUploadablePhoto(file)
      if (!isCurrent()) return
      const previewUrl = URL.createObjectURL(compressed)
      previewUrlRef.current = previewUrl
      setAttachment({ status: 'uploading', previewUrl, storageKey: null })
      const presigned = await requestPresignedUpload(token, compressed.type)
      await uploadToPresignedUrl(presigned.uploadUrl, compressed, compressed.type)
      if (!isCurrent()) return
      setAttachment({ status: 'done', previewUrl, storageKey: presigned.storageKey })
    } catch (err) {
      if (!isCurrent()) return
      showError(err.message || 'Fotoğraf yüklenemedi.')
      releasePreview()
      setAttachment(null)
    }
  }, [token, showError, releasePreview])

  return { attachment, attach, clear }
}
