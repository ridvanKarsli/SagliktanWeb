import { useState } from 'react'
import {
  Box, ButtonBase, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Stack, Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ChevronRightRounded, CloseRounded, LockOutlined, PeopleAltOutlined } from '@mui/icons-material'
import EmptyState from '../EmptyState.jsx'
import InfiniteScrollSentinel from '../common/InfiniteScrollSentinel.jsx'
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
// Mobilde tam ekran, alttan kayarak açılır. Listede yalnızca profilini üyelere
// açık tutanlar var; hiddenCount > 0 ise "N üye profilini gizli tutuyor" notu
// toplam üye sayısıyla listenin neden farklı olduğunu açıklar.
export default function GroupMembersDialog({ open, onClose, members, loading, loadingMore, hasMore, onLoadMore, onOpenProfile, hiddenCount = 0 }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  // Liste dialog içinde kayar: sonsuz kaydırma gözcüsü bu kabı izler.
  const [scrollEl, setScrollEl] = useState(null)
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
      <DialogContent ref={setScrollEl} dividers sx={{ p: 0 }}>
        {loading ? (
          <Box role="status" aria-label="Üyeler yükleniyor">
            {[0, 1, 2, 3, 4].map(i => <MemberRowSkeleton key={i} />)}
          </Box>
        ) : members.length === 0 ? (
          hiddenCount > 0
            ? <EmptyState icon={LockOutlined} title="Üyeler profillerini gizli tutuyor" description={`Bu grubun ${hiddenCount} üyesi profilini yalnızca kendine açık tutuyor.`} dense />
            : <EmptyState icon={PeopleAltOutlined} title="Henüz üye yok" description="İlk katılan sen olabilirsin." dense />
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
        {!loading && !hasMore && members.length > 0 && hiddenCount > 0 && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2.5, py: 1.75, color: 'text.secondary', borderTop: '1px solid', borderColor: 'divider' }}>
            <LockOutlined sx={{ fontSize: 18 }} aria-hidden />
            <Typography variant="body2">
              {hiddenCount === 1 ? '1 üye profilini gizli tutuyor.' : `${hiddenCount} üye profilini gizli tutuyor.`}
            </Typography>
          </Stack>
        )}
        {!loading && (
          <InfiniteScrollSentinel dense root={scrollEl} rootMargin="240px 0px" hasMore={hasMore} loading={loadingMore} onLoadMore={onLoadMore} itemCount={members.length} />
        )}
      </DialogContent>
    </Dialog>
  )
}
