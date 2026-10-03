import { Avatar, Box, ButtonBase, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material'
import { CloseRounded, PeopleAltRounded } from '@mui/icons-material'
import EmptyState from '../EmptyState.jsx'
import CenteredSpinner from '../common/CenteredSpinner.jsx'
import LoadMoreButton from '../common/LoadMoreButton.jsx'
import { initialsFrom } from '../../utils/format.js'
import { fullNameOf } from '../../utils/text.js'

// Bir hastalık grubunun üye listesi (sayfalı). Satıra dokunmak profile gider.
export default function GroupMembersDialog({ open, onClose, members, loading, loadingMore, hasMore, onLoadMore, onOpenProfile }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Üyeler
        <IconButton size="small" onClick={onClose} aria-label="Kapat">
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <CenteredSpinner />
        ) : members.length === 0 ? (
          <EmptyState icon={PeopleAltRounded} title="Henüz üye yok." dense />
        ) : (
          <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
            {members.map(m => {
              const fullName = fullNameOf(m, 'Kullanıcı')
              return (
                <ButtonBase
                  key={m.id}
                  onClick={() => onOpenProfile(m.id)}
                  aria-label={`${fullName} profiline git`}
                  sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, px: 2, py: 1.25, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600 }}>{initialsFrom(fullName)}</Avatar>
                  <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>{fullName}</Typography>
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
