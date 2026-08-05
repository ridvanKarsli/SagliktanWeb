// Faz 2 adım 4: gönderi fotoğrafları yüklenmeden önce tarayıcıda otomatik
// olarak yeniden boyutlandırılıp sıkıştırılıyor (bkz.
// PLAN_faz2_ozellikler.md adım 4) - hem R2 depolama maliyetini hem
// yükleme/gösterim süresini düşürür, backend'e ekstra iş bindirmez.
//
// Mobil uyum raporu roadmap: "Görsel işleme hattına AVIF/WebP üretimi ekle".
// Yükleme mimarisi BİLEREK backend'i atlıyor (bkz. MediaController.java -
// presigned URL ile doğrudan client -> R2) - bu yüzden WebP üretimi de
// SUNUCU TARAFINDA değil, tıpkı JPEG sıkıştırması gibi burada, tarayıcıda
// yapılıyor: mevcut mimariye ek bir bileşen (backend işleme adımı veya
// Cloudflare Images gibi ücretli bir edge transform ürünü) eklemeden aynı
// kazancı sağlıyor. Backend zaten "image/webp" içeriğini kabul ediyor (bkz.
// MediaConstraints.ALLOWED_CONTENT_TYPES) - eksik olan sadece istemcinin
// bunu üretmesiydi.
//
// WebP ENCODE desteği tarayıcıya göre değişebiliyor (ör. çok eski Safari
// sürümleri canvas.toBlob'da 'image/webp' isteğini sessizce PNG'ye
// düşürebiliyor - hata FIRLATMIYOR, bu yüzden blob.type kontrolü şart).
// Gösterim tarafında (WebP'yi <img> ile AÇMA) bunun aksine praktik olarak
// evrensel destek var, bu yüzden sadece üretim tarafını feature-detect
// ediyoruz. Desteklenmiyorsa JPEG'e (eski davranış) sorunsuzca düşer.
const DEFAULT_MAX_DIMENSION = 1920
const DEFAULT_QUALITY = 0.8

let webpSupportCache = null
function supportsWebpEncoding() {
  if (webpSupportCache !== null) return webpSupportCache
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  webpSupportCache = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  return webpSupportCache
}

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

    const useWebp = supportsWebpEncoding()
    const mimeType = useWebp ? 'image/webp' : 'image/jpeg'

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Görsel sıkıştırılamadı'))),
        mimeType,
        quality
      )
    })

    // Tarayıcı sessizce farklı bir formata düştüyse (yukarıdaki teşhis
    // yanlış pozitif verdiyse) gerçek blob.type'a güven, varsayılan olarak
    // WebP iddia etme.
    const finalMime = blob.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
    const extension = finalMime === 'image/webp' ? 'webp' : 'jpg'

    return new File([blob], toFileName(file.name, extension), { type: finalMime })
  } finally {
    bitmap.close?.()
  }
}

function toFileName(originalName, extension) {
  const base = (originalName || 'foto').replace(/\.[^./]+$/, '')
  return `${base}.${extension}`
}
