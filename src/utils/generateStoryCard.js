import QRCode from 'qrcode'

// Faz 2 adım 5: "hikaye kartı" - bir gönderiyi Instagram/WhatsApp story
// olarak paylaşılabilecek, Sağlıktan markalı bir görsele dönüştürür.
// Bilerek backend'de değil, tamamen tarayıcıda (Canvas API) üretiliyor -
// PLAN_faz2_ozellikler.md'de karar verildiği gibi, sunucu tarafında görsel
// üretmek için ekstra bir servis/kütüphane (ör. headless browser, ImageMagick)
// kurmaya gerek bırakmıyor; kart sadece paylaşılacağı an, o kullanıcının
// cihazında oluşturuluyor.

// 1080x1920: Instagram/WhatsApp story'nin standart 9:16 oranı - bu boyutta
// üretilen bir PNG her iki platformda da kırpılmadan tam ekran görünür.
const WIDTH = 1080
const HEIGHT = 1920

// theme.js'teki renk paletiyle birebir aynı - kart, uygulamanın geri kalanıyla
// aynı "sıcak dark" kimliğini taşısın diye burada string olarak tekrarlandı
// (theme.js bir MUI temasıdır, canvas'a doğrudan bağlanmıyor).
const COLORS = {
  background: '#1E1A16',
  primary: '#4CB89F',
  secondary: '#E08B6D',
  tertiary: '#2C7562',
  textPrimary: '#F2EDE6',
  textSecondary: '#B3A99C',
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Canvas'ta yerleşik metin kaydırma olmadığı için: verilen metni kelime
// kelime maxWidth'e göre satırlara bölüyor, maxLines'ı aşarsa son satırı
// "..." ile kesiyor (kartın taşmasını önlemek için - başlık/içerik ne kadar
// uzun olursa olsun kart her zaman sabit boyutta kalmalı).
function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = word
      if (lines.length === maxLines) break
    } else {
      current = candidate
    }
  }
  if (lines.length < maxLines && current) lines.push(current)

  if (lines.length === maxLines) {
    const wordsUsed = lines.join(' ').split(/\s+/).length
    const truncated = wordsUsed < words.length
    if (truncated) {
      let last = lines[maxLines - 1]
      while (ctx.measureText(`${last}…`).width > maxWidth && last.includes(' ')) {
        last = last.slice(0, last.lastIndexOf(' '))
      }
      lines[maxLines - 1] = `${last}…`
    }
  }
  return lines
}

// Ambient arkaplan: theme.js'teki radial-gradient katmanlarının (bkz.
// index.css/App'teki ana arkaplan) canvas karşılığı - düz bir renk yerine
// köşelerde yumuşak, "ilgi çekici" yeşil/mercan lekeler.
function drawBackground(ctx) {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const blobs = [
    { x: WIDTH * 0.1, y: HEIGHT * 0.05, r: 650, color: 'rgba(76, 184, 159, 0.22)' },
    { x: WIDTH * 0.95, y: HEIGHT * 0.18, r: 560, color: 'rgba(224, 139, 109, 0.16)' },
    { x: WIDTH * 0.9, y: HEIGHT * 0.95, r: 700, color: 'rgba(44, 117, 98, 0.24)' },
    { x: WIDTH * 0.05, y: HEIGHT * 0.85, r: 520, color: 'rgba(224, 139, 109, 0.12)' },
  ]
  for (const b of blobs) {
    const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
    gradient.addColorStop(0, b.color)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
  }
}

function drawRoundedImage(ctx, img, x, y, size, radius) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + size, y, x + size, y + size, radius)
  ctx.arcTo(x + size, y + size, x, y + size, radius)
  ctx.arcTo(x, y + size, x, y, radius)
  ctx.arcTo(x, y, x + size, y, radius)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()
}

// post: { id, title, content } yeterli - fotoğraf/yazar bilgisi kartta
// bilerek kullanılmıyor (adım 4'ün fotoğrafını da içeren "zengin" versiyon
// PLAN_faz2_ozellikler.md'de bir sonraki iyileştirme olarak bırakıldı, bu
// ilk sürüm her gönderi için -fotoğraflı ya da değil- aynı şekilde çalışır).
export async function generateStoryCardBlob(post) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  drawBackground(ctx)

  const postUrl = `https://sagliktan.com/post/${post.id}`
  const [logoImg, qrDataUrl] = await Promise.all([
    loadImage('/sagliktanLogo.png'),
    QRCode.toDataURL(postUrl, {
      width: 260,
      margin: 1,
      color: { dark: COLORS.background, light: '#FFFFFF' },
    }),
    // Canvas 2D API kullanılan fontu OTOMATİK yüklemiyor - CSS'te bir yerde
    // kullanılmadıysa (ör. sayfa henüz Inter gerektiren bir metin
    // render etmediyse) sessizce tarayıcının varsayılan fontuna düşer.
    // document.fonts.load ile aşağıda çizilecek ağırlık/boyutları açıkça
    // isteyip bitmesini bekliyoruz ki kart her zaman Inter ile çizilsin.
    Promise.all([
      document.fonts.load('700 72px Inter'),
      document.fonts.load('700 44px Inter'),
      document.fonts.load('700 40px Inter'),
      document.fonts.load('400 42px Inter'),
      document.fonts.load('400 34px Inter'),
    ]),
  ])
  const qrImg = await loadImage(qrDataUrl)

  // --- Üst: logo + marka adı ---
  const logoSize = 96
  const logoX = 80
  const logoY = 96
  drawRoundedImage(ctx, logoImg, logoX, logoY, logoSize, 22)
  ctx.fillStyle = COLORS.textPrimary
  ctx.font = '700 44px Inter, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('Sağlıktan', logoX + logoSize + 28, logoY + logoSize / 2)

  // --- Orta: başlık + içerik alıntısı ---
  const contentX = 80
  const maxTextWidth = WIDTH - contentX * 2
  let cursorY = 420

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = COLORS.textPrimary
  ctx.font = '700 72px Inter, sans-serif'
  const titleLines = wrapText(ctx, post.title || '', maxTextWidth, 4)
  for (const line of titleLines) {
    ctx.fillText(line, contentX, cursorY)
    cursorY += 86
  }

  cursorY += 36
  ctx.fillStyle = COLORS.textSecondary
  ctx.font = '400 42px Inter, sans-serif'
  const contentLines = wrapText(ctx, post.content || '', maxTextWidth, 8)
  for (const line of contentLines) {
    ctx.fillText(line, contentX, cursorY)
    cursorY += 60
  }

  // --- Alt: ayraç + QR kod + çağrı metni ---
  const footerY = HEIGHT - 340
  ctx.strokeStyle = 'rgba(242, 237, 230, 0.14)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(contentX, footerY)
  ctx.lineTo(WIDTH - contentX, footerY)
  ctx.stroke()

  const qrSize = 180
  const qrBoxPad = 18
  const qrBoxSize = qrSize + qrBoxPad * 2
  const qrX = contentX
  const qrY = footerY + 56
  // QR'ın etrafında beyaz bir kutu: koyu zeminde QR okunurluğu için gerekli
  // kontrast (siyah/beyaz QR doğrudan koyu arkaplana basılırsa taramak
  // zorlaşır ya da imkansız hale gelir).
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 20)
  ctx.fill()
  ctx.drawImage(qrImg, qrX + qrBoxPad, qrY + qrBoxPad, qrSize, qrSize)

  const textX = qrX + qrBoxSize + 40
  const textMaxWidth = WIDTH - contentX - textX
  ctx.fillStyle = COLORS.textPrimary
  ctx.font = '700 40px Inter, sans-serif'
  ctx.fillText('Tüm hikayeyi', textX, qrY + 66)
  ctx.fillText('okumak için', textX, qrY + 114)
  ctx.fillStyle = COLORS.primary
  ctx.font = '700 40px Inter, sans-serif'
  ctx.fillText('QR kodu okut', textX, qrY + 162)
  void textMaxWidth // metin iki sabit kısa satıra bölündüğü için ayrıca kaydırmaya gerek kalmadı, genişlik yine de gelecekte üçüncü bir satır eklenirse hazır dursun diye tutuluyor.

  ctx.fillStyle = COLORS.textSecondary
  ctx.font = '400 34px Inter, sans-serif'
  ctx.fillText('sagliktan.com', contentX, HEIGHT - 72)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95))
}
