import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import theme from './theme.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { NotificationsFeedProvider } from './context/NotificationsFeedContext.jsx'
import { MessagingProvider } from './context/MessagingContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
// Inter fontu artık Google Fonts'tan değil, yerelden (bkz. index.html'deki not).
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import './index.css'

// Hata izleme (Sentry, LAUNCH_ROADMAP.md #1). VITE_SENTRY_DSN sadece
// Vercel'in prod build ortamında set edilecek - lokalde/preview'de bu
// değişken yoksa Sentry hiç başlatılmıyor, geliştirme sırasındaki hatalar
// prod projesine karışmıyor. userInfo/httpBodies bilerek kapalı - backend
// tarafındaki send-default-pii=false kararıyla tutarlı, KVKK incelemesi
// tamamlanana kadar kullanıcı verisi üçüncü tarafa gitmiyor.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <ConfirmProvider>
                <NotificationsFeedProvider>
                  <MessagingProvider>
                    <App />
                  </MessagingProvider>
                </NotificationsFeedProvider>
              </ConfirmProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
)

// Service Worker sadece production'da aktif olsun
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js'
    navigator.serviceWorker.register(swUrl).catch(console.error)
  })
}
