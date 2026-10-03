import { Box, Typography } from '@mui/material'
import Companion from '../avatars/Companion.jsx'
import { radius } from '../../design/tokens.js'
import '../../styles/companions.css'

// Patika boyunca dizilmiş yol arkadaşları: Sağlıktan'ın en temel fikri -
// aynı yoldan geçen insanlar birbirine eşlik eder. Konumlar yüzde olarak
// (patika eğrisinin üstünde), boyutlar uzaklaştıkça küçülür.
const WALKERS = [
  { name: 'kaplumbaga', x: 12, y: 80, size: 84 },
  { name: 'damla', x: 34, y: 62, size: 72 },
  { name: 'filiz', x: 54, y: 50, size: 78 },
  { name: 'kirpi', x: 74, y: 33, size: 62 },
  { name: 'gunes', x: 89, y: 13, size: 54 },
]

function Bubble({ children, sx, delay }) {
  return (
    <Box
      className="sg-arrive"
      sx={{
        position: 'absolute', px: 1.5, py: 1, maxWidth: { xs: 150, sm: 190 },
        borderRadius: `${radius.md}px`, bgcolor: 'background.paper', boxShadow: 3,
        border: '1px solid', borderColor: 'brand.border',
        animationDelay: delay, ...sx
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.35, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
        {children}
      </Typography>
    </Box>
  )
}

export default function PathScene() {
  return (
    <Box
      role="img"
      aria-label="Bir patika boyunca yan yana yürüyen sevimli yol arkadaşları ve aralarında kısa destek mesajları"
      sx={{ position: 'relative', width: '100%', maxWidth: 520, mx: 'auto', aspectRatio: '6 / 5' }}
    >
      {/* Zemin: iki yumuşak tepe ve patika */}
      <Box component="svg" viewBox="0 0 480 400" aria-hidden sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <Box component="ellipse" cx="170" cy="370" rx="230" ry="70" sx={{ fill: theme => theme.palette.brand.surfaceAlt }} />
        <Box component="ellipse" cx="380" cy="150" rx="150" ry="120" sx={{ fill: theme => theme.palette.brand.primarySoft }} />
        <Box
          component="path"
          d="M10 372 C 120 352, 110 268, 190 246 S 320 196, 360 150 S 420 70, 470 30"
          sx={{ fill: 'none', stroke: theme => theme.palette.brand.primaryBright, strokeWidth: 7, strokeLinecap: 'round', strokeDasharray: '1 18', opacity: 0.85 }}
        />
        <g>
          <Box component="path" d="M44 300 C 50 286 62 282 70 286 C 64 296 54 302 44 300Z" sx={{ fill: theme => theme.palette.brand.primaryBright, opacity: 0.5 }} />
          <Box component="path" d="M300 300 C 308 290 320 288 326 292 C 320 300 310 304 300 300Z" sx={{ fill: theme => theme.palette.brand.apricot, opacity: 0.55 }} />
          <Box component="path" d="M420 230 C 426 220 436 218 442 222 C 436 230 428 234 420 230Z" sx={{ fill: theme => theme.palette.brand.primaryBright, opacity: 0.5 }} />
        </g>
      </Box>

      {WALKERS.map((w, i) => (
        <Box
          key={w.name}
          sx={{ position: 'absolute', left: `${w.x}%`, top: `${w.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <Box className="sg-arrive" sx={{ animationDelay: `${150 + i * 110}ms`, borderRadius: '50%', boxShadow: 2, border: '3px solid', borderColor: 'background.paper' }}>
            <Companion name={w.name} size={w.size} sx={{ width: { xs: w.size * 0.82, sm: w.size }, height: { xs: w.size * 0.82, sm: w.size } }} />
          </Box>
        </Box>
      ))}

      <Bubble delay="800ms" sx={{ left: 0, top: { xs: '6%', sm: '10%' }, borderBottomLeftRadius: 6 }}>
        Ben de aynısını yaşadım, yalnız değilsin.
      </Bubble>
      <Bubble delay="1000ms" sx={{ right: 0, bottom: { xs: '4%', sm: '8%' }, borderTopRightRadius: 6 }}>
        Önerin çok işime yaradı, teşekkürler!
      </Bubble>
    </Box>
  )
}
