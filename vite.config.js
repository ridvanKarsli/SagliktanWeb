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
});
