import { Box, Fab } from '@mui/material'
import { Add } from '@mui/icons-material'

const MOBILE_NAV_OFFSET = 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)'

// Akış sayfalarındaki "Yeni gönderi" yüzen butonu. Mobilde listenin sonuna
// FAB yüksekliği kadar boşluk bırakır: aksi halde son kartın sağ alttaki
// eylem ikonları (kaydet/gönder/şikayet) FAB'ın arkasında kalıyordu.
export default function CreatePostFab({ onClick }) {
  return (
    <>
      <Box aria-hidden sx={{ height: { xs: 72, md: 0 } }} />
      <Fab
        color="primary"
        aria-label="Yeni gönderi"
        onClick={onClick}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: { xs: MOBILE_NAV_OFFSET, md: 24 },
          zIndex: (t) => t.zIndex.appBar + 3
        }}
      >
        <Add />
      </Fab>
    </>
  )
}
