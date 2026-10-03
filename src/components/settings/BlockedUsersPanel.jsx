import { useState } from 'react'
import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import LazyListPanel from './LazyListPanel.jsx'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useLazyResource } from '../../hooks/useLazyResource.js'
import { listBlockedUsers, unblockUser } from '../../services/api.js'

// Engellenen kullanıcılar listesi + engeli kaldırma. Panel ilk açıldığında yüklenir.
export default function BlockedUsersPanel() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const blocked = useLazyResource(
    () => listBlockedUsers(token).then(res => (Array.isArray(res) ? res : [])),
    { enabled: !!token }
  )
  const [unblockingId, setUnblockingId] = useState(null)

  const handleUnblock = async (userId) => {
    setUnblockingId(userId)
    try {
      await unblockUser(token, userId)
      blocked.setData(prev => (prev || []).filter(b => b.userId !== userId))
      showSuccess('Engel kaldırıldı.')
    } catch (err) {
      showError(err.message || 'Engel kaldırılamadı.')
    } finally {
      setUnblockingId(null)
    }
  }

  return (
    <LazyListPanel
      loading={blocked.loading}
      error={blocked.error && 'Engellenen kullanıcılar alınamadı.'}
      onRetry={blocked.reload}
      items={blocked.data}
      emptyText="Engellediğin kimse yok."
      skeletonAvatar
      renderItem={(b) => (
        <Stack key={b.id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
          <UserAvatar avatarKey={b.avatarKey} name={b.userName} size={40} />
          <Typography variant="body1" sx={{ flex: 1, minWidth: 0, fontWeight: 700 }} noWrap>{b.userName}</Typography>
          <Button
            size="small" variant="outlined"
            disabled={unblockingId === b.userId}
            onClick={() => handleUnblock(b.userId)}
            sx={{ flexShrink: 0 }}
          >
            {unblockingId === b.userId ? <CircularProgress size={14} color="inherit" /> : 'Engeli Kaldır'}
          </Button>
        </Stack>
      )}
    />
  )
}
