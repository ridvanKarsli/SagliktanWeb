import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // LAN'dan erişim ve mobil cihazlarda test için
    open: true,
    // HMR ayarlarını varsayılan bırakmak, mobil/çapraz cihazlarda daha stabil çalışır
  },
});
