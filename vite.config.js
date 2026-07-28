import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
