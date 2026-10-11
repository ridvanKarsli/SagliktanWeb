// Sağlıktan Mahalle giriş noktası (/game/*). App.jsx bunu React.lazy ile
// yükler: oyun kodu, çizim seti ve sahne motoru yalnızca bu rotada iner,
// uygulamanın ana paketine girmez.
//
// Dünya hep gündüz ışığında; uygulama koyu temada olsa bile oyun açık
// temayla (yüksek kontrast tercihi korunarak) çizilir ki HUD ve sayfalar
// sahneyle uyumlu kalsın.
import { useMemo } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Box, Button, ThemeProvider, Typography } from '@mui/material'
import { lightTheme, createAccessibleTheme } from '../theme.js'
import { useAccessibility } from '../context/AccessibilityContext.jsx'
import PageLoader from '../components/common/PageLoader.jsx'
import RouteErrorBoundary from '../components/RouteErrorBoundary.jsx'
import { GameProvider, useGame } from './state/GameContext.jsx'
import CharacterCreator from './screens/CharacterCreator.jsx'
import WorldScreen from './screens/WorldScreen.jsx'
import RoomScreen from './screens/RoomScreen.jsx'
import './art/styles.js'
import './render/gameStyles.js'

function GameRoutes() {
  const { status, error, reload } = useGame()
  const navigate = useNavigate()
  if (status === 'loading') return <PageLoader fullScreen caption="Mahalleye yürüyoruz…" />
  if (status === 'error') {
    return (
      <Box sx={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 380 }} role="alert">
          <Typography variant="h6" component="h1" sx={{ fontWeight: 800, mb: 1 }}>Mahalle şu an açılamadı</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2 }}>{error}</Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button variant="contained" onClick={reload} sx={{ minHeight: 48, borderRadius: 999 }}>Tekrar dene</Button>
            <Button onClick={() => navigate('/home')} sx={{ minHeight: 48 }}>Sağlıktan’a dön</Button>
          </Box>
        </Box>
      </Box>
    )
  }
  if (status === 'needsProfile') {
    return (
      <Routes>
        <Route index element={<CharacterCreator mode="create" />} />
        <Route path="*" element={<Navigate to="/game" replace />} />
      </Routes>
    )
  }
  return (
    <Routes>
      <Route index element={<WorldScreen />} />
      <Route path="ev" element={<RoomScreen />} />
      <Route path="ev/:publicId" element={<RoomScreen />} />
      <Route path="karakter" element={<CharacterCreator mode="edit" />} />
      <Route path="*" element={<Navigate to="/game" replace />} />
    </Routes>
  )
}

export default function GameRoot() {
  const { highContrast } = useAccessibility()
  const theme = useMemo(() => createAccessibleTheme(lightTheme, { highContrast }), [highContrast])
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', color: 'text.primary', colorScheme: 'light' }}>
        <RouteErrorBoundary>
          <GameProvider>
            <GameRoutes />
          </GameProvider>
        </RouteErrorBoundary>
      </Box>
    </ThemeProvider>
  )
}
