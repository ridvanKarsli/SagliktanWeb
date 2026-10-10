// Mobil uyum raporu roadmap: "PWA manifest ikon setini tamamla ve service
// worker precache listesine dahil et". Önceki sw.js sadece kabuğu (/,
// index.html) install sırasında önbelleğe alıyordu; asıl JS/CSS bundle'ları
// yalnızca kullanıcı onları bir kez indirdikten SONRA fetch handler'daki
// cache-first mantığıyla fırsatçı şekilde önbelleğe giriyordu - yani ilk
// ziyarette offline garantisi yoktu.
//
// Route bazlı code splitting'den (App.jsx, bkz. 261a403) sonra dist/assets
// altında 100'den fazla küçük lazy-route chunk'ı var (AdminPanel, Chat,
// PostDetail...). Bunların TAMAMINI install sırasında precache etmek code
// splitting'in tüm amacını (ilk yüklemede sadece gerekeni indirmek) boşa
// çıkarır. Bu yüzden burada SADECE her sayfada kullanılan kritik giriş
// dosyalarını precache listesine ekliyoruz; lazy route chunk'ları önceden
// olduğu gibi ilk ziyaret edildiklerinde fetch handler'ın cache-first
// dalıyla fırsatçı şekilde önbelleğe girmeye devam ediyor.
//
// Kritik dosyalar dist/assets'i regex'le taramak yerine dist/index.html'den
// okunur: önceden `/^index-.*\.(js|css)$/` deseni, main.jsx'teki dinamik
// import()'tan doğan Sentry chunk'ını da (o da index-HASH.js adıyla üretilir,
// ~160 KB gz) yakalayıp ilk ziyarette indirtiyordu. index.html'deki
// <script type="module">, <link rel="modulepreload"> ve <link rel="stylesheet">
// etiketleri tam olarak "ilk boyama için gereken" kümedir - başka hiçbir
// şey değil.
//
// `vite build`'den SONRA çalışır (bkz. package.json "build" script'i),
// dist/sw.js içine yazar ve CACHE_NAME'i giriş hash'inden türetir ki eski
// cache geçersiz olsun (sw.js'teki v3/v4/v5 geçmişindeki aynı gerekçeyle).

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const htmlPath = path.join(distDir, 'index.html')
const swPath = path.join(distDir, 'sw.js')

const html = readFileSync(htmlPath, 'utf8')

// Bir etiketin attribute'unu (src/href) çek - sırası ne olursa olsun.
function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`))?.[1] ?? null
}

const scriptTags = html.match(/<script\b[^>]*>/g) ?? []
const linkTags = html.match(/<link\b[^>]*>/g) ?? []

const entryScripts = scriptTags
  .filter(t => /\stype=["']module["']/.test(t))
  .map(t => attr(t, 'src'))
  .filter(Boolean)
const preloads = linkTags
  .filter(t => /\srel=["']modulepreload["']/.test(t))
  .map(t => attr(t, 'href'))
  .filter(Boolean)
const stylesheets = linkTags
  .filter(t => /\srel=["']stylesheet["']/.test(t))
  .map(t => attr(t, 'href'))
  .filter(Boolean)
  // Sadece vite'ın ürettiği (hash'li) giriş CSS'i; harici bir stylesheet
  // (olursa) SW cache kapsamı dışında kalsın.
  .filter(h => h.startsWith('/assets/'))

if (entryScripts.length === 0) {
  console.error('generate-sw-precache: dist/index.html içinde <script type="module"> bulunamadı, sw.js değiştirilmedi.')
  process.exit(1)
}

// Aynı origin, kök-göreli yollar; tekrarlar ayıklanır.
const criticalAssets = [...new Set([...entryScripts, ...preloads, ...stylesheets])]
  .filter(p => p.startsWith('/'))

let sw = readFileSync(swPath, 'utf8')

// İki ayrı liste: CRITICAL_ASSETS başarısız olursa install başarısız olur
// (eksik bir giriş dosyasıyla "offline açılır" sözü tutulamaz), OPTIONAL_
// ASSETS (küçük marka görselleri) ise toleranslı - biri 404 dönse bile SW
// kurulur (bkz. sw.js install handler'ındaki Promise.allSettled).
const toBlock = (list) => list.map(f => `  '${f}',`).join('\n')
sw = sw.replace(
  /const CRITICAL_ASSETS = \[[\s\S]*?\];/,
  `const CRITICAL_ASSETS = [\n  '/',\n  '/index.html',\n${toBlock(criticalAssets)}\n];`
)

// Cache adını build'e özgü hale getir (giriş script'inin hash'inden türet) -
// yeni bir deploy her zaman yeni bir CACHE_NAME demek, activate handler'daki
// temizlik eski cache'i otomatik siler. Hash CSS'ten değil JS'ten alınır:
// sadece-JS değişen deploy'da CSS hash'i aynı kalabilir.
const buildHash = entryScripts[0].match(/-([\w-]+)\.js$/)?.[1] ?? Date.now().toString(36)
sw = sw.replace(/const CACHE_NAME = '[^']*';/, `const CACHE_NAME = 'sagliktan-pwa-${buildHash}';`)

writeFileSync(swPath, sw)
console.log(`generate-sw-precache: ${criticalAssets.length} kritik giriş dosyası precache listesine eklendi (${criticalAssets.join(', ')}), CACHE_NAME=sagliktan-pwa-${buildHash}`)
