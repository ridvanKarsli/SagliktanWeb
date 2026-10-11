import { Box } from '@mui/material'
import { usePullToRefresh } from '../hooks/usePullToRefresh.js'
import SaglikLoader from './common/SaglikLoader.jsx'

// Akış sayfalarının en üstündeki "aşağı çek, yenile" göstergesi: parmak
// çekildikçe yükseklik açılır ve filiz eşik oranında büyüyüp belirir;
// eşik geçilip bırakılınca onRefresh() bitene kadar filiz canlanır.
export default function PullToRefreshIndicator({ onRefresh, disabled = false }) {
  const { pullDistance, refreshing, threshold } = usePullToRefresh(onRefresh, { disabled })
  const progress = Math.min(1, pullDistance / threshold)
  return (
    <Box
      sx={{
        height: pullDistance,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        transition: pullDistance === 0 ? 'height 0.2s ease' : 'none'
      }}
    >
      {pullDistance > 0 && (
        <Box sx={{ opacity: refreshing ? 1 : 0.35 + progress * 0.65, transform: refreshing ? 'none' : `scale(${0.6 + progress * 0.4})` }}>
          <SaglikLoader size={36} still={!refreshing} appear={false} label={refreshing ? 'Yenileniyor' : 'Yenilemek için çekin'} />
        </Box>
      )}
    </Box>
  )
}
