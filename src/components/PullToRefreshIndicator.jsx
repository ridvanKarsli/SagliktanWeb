import { Box, CircularProgress } from '@mui/material'
import { usePullToRefresh } from '../hooks/usePullToRefresh.js'

// Akış sayfalarının en üstündeki "aşağı çek, yenile" göstergesi: parmak
// çekildikçe yükseklik açılır; eşik geçilip bırakılınca onRefresh() bitene
// kadar dönen bir spinner kalır.
export default function PullToRefreshIndicator({ onRefresh, disabled = false }) {
  const { pullDistance, refreshing, threshold } = usePullToRefresh(onRefresh, { disabled })
  return (
    <Box
      sx={{
        height: pullDistance,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', color: 'primary.main',
        transition: pullDistance === 0 ? 'height 0.2s ease' : 'none'
      }}
    >
      {pullDistance > 0 && (
        <CircularProgress
          size={22}
          thickness={5}
          variant={refreshing ? 'indeterminate' : 'determinate'}
          value={Math.min(100, (pullDistance / threshold) * 100)}
        />
      )}
    </Box>
  )
}
