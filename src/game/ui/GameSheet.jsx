// Alttan açılan sayfa (bottom sheet): mobilde başparmak erişiminde, masaüstünde
// ortalanmış dar kart. Android "Geri" tuşu sayfayı kapatır (useDialogHistory).
import { Box, Drawer, IconButton, Typography } from '@mui/material'
import { CloseRounded } from '@mui/icons-material'
import { useId } from 'react'
import { useDialogHistory } from '../../hooks/useDialogHistory.js'
import { focusRingSx } from '../../design/focus.js'

export default function GameSheet({ open, onClose, title, subtitle, icon, children, actions, maxWidth = 560, height, contentRef, disablePadding }) {
  const titleId = useId()
  useDialogHistory(open, onClose)
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          'aria-labelledby': titleId,
          role: 'dialog',
          sx: {
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxWidth, mx: 'auto', width: '100%',
            maxHeight: 'min(86dvh, 860px)', height,
            pb: 'env(safe-area-inset-bottom)',
            display: 'flex', flexDirection: 'column',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }} aria-hidden="true">
        <Box sx={{ width: 40, height: 5, borderRadius: 3, bgcolor: 'divider' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, pt: 1, pb: 1.25 }}>
        {icon && <Box sx={{ display: 'flex', color: 'primary.main' }} aria-hidden="true">{icon}</Box>}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={titleId} variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.25 }}>{title}</Typography>
          {subtitle && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
        </Box>
        <IconButton onClick={onClose} aria-label="Kapat" sx={{ width: 44, height: 44, '&.Mui-focusVisible': focusRingSx }}>
          <CloseRounded />
        </IconButton>
      </Box>
      <Box ref={contentRef} sx={{ flex: 1, overflowY: 'auto', px: disablePadding ? 0 : 2.5, pb: 2.5, overscrollBehavior: 'contain' }}>
        {children}
      </Box>
      {actions && (
        <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {actions}
        </Box>
      )}
    </Drawer>
  )
}
