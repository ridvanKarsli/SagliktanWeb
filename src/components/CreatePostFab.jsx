import { Box, Fab } from '@mui/material'
import { EditRounded } from '@mui/icons-material'

const MOBILE_NAV_OFFSET = 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)'

// Akış sayfalarındaki "Yeni gönderi" yüzen butonu: sayfaya yaylanarak gelir
// (.sg-fab-in), basınca hafifçe içe göçer (tema). Masaüstünde metinli
// (extended) - ne yaptığı tek bakışta anlaşılsın. Mobilde listenin sonuna
// FAB yüksekliği kadar boşluk bırakır ki son kartın eylemleri arkada kalmasın.
export default function CreatePostFab({ onClick }) {
  return (
    <>
      <Box aria-hidden sx={{ height: { xs: 72, md: 0 } }} />
      <Box
        className="sg-fab-in"
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 32 },
          bottom: { xs: MOBILE_NAV_OFFSET, md: 32 },
          zIndex: (t) => t.zIndex.appBar + 3
        }}
      >
          <Fab
            color="primary"
            aria-label="Yeni gönderi"
            onClick={onClick}
            variant="circular"
            sx={{
              width: { xs: 60, md: 'auto' }, height: { xs: 60, md: 56 }, borderRadius: '999px',
              px: { md: 2.75 }, gap: 1, textTransform: 'none', fontWeight: 800, fontSize: '1rem',
              '&:hover .sg-fab-icon': { transform: 'rotate(-12deg)' }
            }}
          >
            <EditRounded className="sg-fab-icon" sx={{ transition: 'transform 240ms var(--ease-spring)' }} />
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Yeni gönderi</Box>
          </Fab>
      </Box>
    </>
  )
}
