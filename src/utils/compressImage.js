// Faz 2 adım 4: gönderi fotoğrafları yüklenmeden önce tarayıcıda otomatik
// olarak yeniden boyutlandırılıp sıkıştırılıyor (bkz.
// PLAN_faz2_ozellikler.md adım 4) - hem R2 depolama maliyetini hem
// yükleme/gösterim süresini düşürür, backend'e ekstra iş bindirmez.
//
// Her zaman JPEG'e çevriliyor (PNG/WebP girişleri dahil) - basitlik için:
// tek bir çıktı formatı, hem sıkıştırma oranı hem backend doğrulaması
// (bkz. MediaConstraints.ALLOWED_CONTENT_TYPES) tarafında tutarlı.
// Şeffaflık gerektiren bir kullanım senaryosu yok (fotoğraf paylaşımı).

const DEFAULT_MAX_DIMENSION = 1920
const DEFAULT_QUALITY = 0.8

export async function compressImage(file, { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {}) {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale))
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Görsel sıkıştırılamadı'))),
        'image/jpeg',
        quality
      )
    })

    return new File([blob], toJpgFileName(file.name), { type: 'image/jpeg' })
  } finally {
    bitmap.close?.()
  }
}

function toJpgFileName(originalName) {
  const base = (originalName || 'foto').replace(/\.[^./]+$/, '')
  return `${base}.jpg`
}
