import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import App from './App.jsx'
import theme from './theme.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
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
