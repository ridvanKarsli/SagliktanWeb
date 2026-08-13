import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Bundle analizi (rollup-plugin-visualizer ile bir kerelik ölçüldü,
        // bkz. commit mesajı): route bazlı code-splitting (#243) sayesinde
        // sayfa/özellik başına chunk'lar zaten küçüktü, ama React+React
        // Router+MUI+Emotion hepsi TEK bir ~570KB'lık ana chunk'ta
        // birleşiyordu - her sayfa ziyaretinde/deploy'da yeniden indiriliyor.
        // Bunları ayrı "vendor" chunk'larına ayırmak toplam byte'ı
        // azaltmıyor ama: (1) tarayıcı bunları paralel indirebiliyor,
        // (2) uygulama kodu (sık değişen) değiştiğinde vendor chunk'ları
        // (nadiren değişen) kullanıcının önbelleğinde kalmaya devam ediyor.
        // Sentry zaten main.jsx'te dynamic import() ile ayrı bir chunk
        // (ilk yüklemeyi bloklamıyor) - ayrıca elle bölünmesine gerek yok.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': [
            '@mui/material', '@mui/icons-material', '@mui/x-date-pickers',
            '@emotion/react', '@emotion/styled'
          ]
        }
      }
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    strictPort: false,
    proxy: {
      // Yeni SagliktanApi backend'i (Spring Boot) - endpoint'ler zaten /api ile
      // başlıyor, bu yüzden eski projeden farklı olarak path rewrite YOK.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // "vite preview" (derlenmiş dist/ paketini sunar) - Playwright E2E testleri
  // CI'da bunu kullanıyor (bkz. playwright.config.js), çünkü "vite dev"
  // soğuk bir CI ortamında ilk açılışta bağımlılıkları arka planda
  // pre-bundle ederken sayfa render'ı 30+ saniye gecikebiliyor. server.proxy
  // burada otomatik uygulanmıyor, bu yüzden aynı /api proxy'sini elle
  // tekrarlıyoruz - yoksa preview modunda tüm API çağrıları 404 döner.
  preview: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
