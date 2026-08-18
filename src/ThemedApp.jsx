import { useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import theme, { createAccessibleTheme } from './theme.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { NotificationsFeedProvider } from './context/NotificationsFeedContext.jsx'
import { MessagingProvider } from './context/MessagingContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import { useAccessibility } from './context/AccessibilityContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// main.jsx'ten ayrı bir dosyaya taşındı: react-refresh/only-export-components
// kuralı entry dosyasında export edilmeyen bir bileşen tanımına izin
// vermiyor (bkz. diğer context dosyalarındaki aynı kısıtlama). Ayrıca
// useAccessibility() burada çağrılabilmesi için AccessibilityProvider'ın
// DIŞINDA değil İÇİNDE render edilmesi gerekiyor - main.jsx bu yüzden
// AccessibilityProvider'ı en dışta tutup ThemedApp'i onun içine koyuyor.
export default function ThemedApp() {
  const { highContrast } = useAccessibility()
  const activeTheme = useMemo(() => createAccessibleTheme(theme, { highContrast }), [highContrast])

  return (
    <ThemeProvider theme={activeTheme}>
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
  )
}
