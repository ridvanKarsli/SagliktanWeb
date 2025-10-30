import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost',
    open: true, // İsteğe bağlı
    strictPort: true, // 3000 doluysa hata versin, başka bir porta geçmesin
    hmr: {
      clientPort: 3000,
      host: 'localhost',
      protocol: 'ws',
    },
  },
});
