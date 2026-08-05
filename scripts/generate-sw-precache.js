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
// çıkarır. Bu yüzden burada SADECE her sayfada kullanılan ana giriş
// bundle'ını (index-HASH.js / index-HASH.css) precache listesine ekliyoruz;
// lazy route chunk'ları önceden olduğu gibi ilk ziyaret edildiklerinde
// fetch handler'ın cache-first dalıyla fırsatçı şekilde önbelleğe girmeye
// devam ediyor.
//
// `vite build`'den SONRA çalışır (bkz. package.json "build" script'i),
// dist/assets içindeki gerçek (hash'li) dosya adlarını okuyup dist/sw.js
// içine yazar ve CACHE_NAME'i otomatik artırır ki eski cache geçersiz olsun
// (sw.js'teki v3/v4/v5 geçmişindeki aynı gerekçeyle - bkz. dosya başındaki
// yorumlar).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const assetsDir = path.join(distDir, 'assets')
const swPath = path.join(distDir, 'sw.js')

const assetFiles = readdirSync(assetsDir)
const mainEntry = assetFiles.filter((f) => /^index-.*\.(js|css)$/.test(f))

if (mainEntry.length === 0) {
  console.error('generate-sw-precache: dist/assets içinde index-*.js/.css bulunamadı, sw.js değiştirilmedi.')
  process.exit(1)
}

let sw = readFileSync(swPath, 'utf8')

const precacheList = mainEntry.map((f) => `/assets/${f}`)
const assetsBlock = [
  "  '/',",
  "  '/index.html',",
  "  '/manifest.webmanifest',",
  "  '/sagliktanLogo.png',",
  ...precacheList.map((f) => `  '${f}',`),
].join('\n')

sw = sw.replace(
  /const ASSETS = \[[\s\S]*?\];/,
  `const ASSETS = [\n${assetsBlock}\n];`
)

// Cache adını build'e özgü hale getir (ana bundle hash'inden türet) - yeni
// bir deploy her zaman yeni bir CACHE_NAME demek, activate handler'daki
// temizlik eski cache'i otomatik siler (sw.js'teki v3/v4/v5 mantığının
// devamı, artık elle sürüm numarası artırmaya gerek yok).
const buildHash = mainEntry[0].match(/-([\w-]+)\.(js|css)$/)?.[1] ?? Date.now().toString(36)
sw = sw.replace(/const CACHE_NAME = '[^']*';/, `const CACHE_NAME = 'sagliktan-pwa-${buildHash}';`)

writeFileSync(swPath, sw)
console.log(`generate-sw-precache: ${precacheList.length} ana bundle dosyası precache listesine eklendi, CACHE_NAME=sagliktan-pwa-${buildHash}`)
