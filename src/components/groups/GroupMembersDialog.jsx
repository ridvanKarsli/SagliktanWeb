import {
  Box, ButtonBase, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Stack, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ChevronRightRounded, CloseRounded } from '@mui/icons-material'
import EmptyState from '../EmptyState.jsx'
import LoadMoreButton from '../common/LoadMoreButton.jsx'
import UserAvatar from '../avatars/UserAvatar.jsx'
import SlideUp from '../shell/SlideUp.jsx'
import { useDialogHistory } from '../../hooks/useDialogHistory.js'
import { fullNameOf } from '../../utils/text.js'

function MemberRowSkeleton() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2.5, py: 1.25 }}>
      <Skeleton variant="circular" width={44} height={44} />
      <Skeleton variant="text" width="50%" />
    </Stack>
  )
}

// Bir hastalık grubunun üye listesi (sayfalı). Satıra dokunmak profile gider.
// Mobilde tam ekran, alttan kayarak açılır.
export default function GroupMembersDialog({ open, onClose, members, loading, loadingMore, hasMore, onLoadMore, onOpenProfile }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  useDialogHistory(open && fullScreen, onClose)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      fullScreen={fullScreen}
      slots={fullScreen ? { transition: SlideUp } : undefined}
      aria-labelledby="group-members-title"
    >
      <DialogTitle
        id="group-members-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: fullScreen ? 'calc(env(safe-area-inset-top) + 16px)' : 2 }}
      >
        Üyeler
        <IconButton onClick={onClose} aria-label="Kapat" sx={{ width: 44, height: 44, mr: -1 }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box role="status" aria-label="Üyeler yükleniyor">
            {[0, 1, 2, 3, 4].map(i => <MemberRowSkeleton key={i} />)}
          </Box>
        ) : members.length === 0 ? (
          <EmptyState companion="serce" title="Henüz üye yok" description="İlk katılan sen olabilirsin." dense />
        ) : (
          <Stack sx={{ py: 0.5 }}>
            {members.map(m => {
              const fullName = fullNameOf(m, 'Kullanıcı')
              return (
                <ButtonBase
                  key={m.id}
                  onClick={() => onOpenProfile(m.id)}
                  aria-label={`${fullName} profiline git`}
                  sx={{
                    display: 'flex', justifyContent: 'flex-start', gap: 1.5, px: 2.5, py: 1, minHeight: 60,
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-focusVisible': { bgcolor: 'action.focus' }
                  }}
                >
                  <UserAvatar avatarKey={m.avatarKey} name={fullName} size={44} />
                  <Typography variant="body1" component="span" sx={{ fontWeight: 700, color: 'text.primary', flex: 1, textAlign: 'left' }} noWrap>
                    {fullName}
                  </Typography>
                  <ChevronRightRounded sx={{ color: 'text.secondary' }} aria-hidden />
                </ButtonBase>
              )
            })}
          </Stack>
        )}
        {!loading && hasMore && <LoadMoreButton dense loading={loadingMore} onClick={onLoadMore} />}
      </DialogContent>
    </Dialog>
  )
}
