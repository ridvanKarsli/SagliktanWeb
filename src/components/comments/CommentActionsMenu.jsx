import { useState } from 'react'
import { CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { DeleteOutline, EditOutlined, FlagOutlined, MoreHorizRounded } from '@mui/icons-material'

// Yorumun "⋯" menüsü: yönetebilene düzenle/sil, başkasının yorumunda şikayet et.
export default function CommentActionsMenu({ canManage, canReport, deleting, onEdit, onDelete, onReport }) {
  const [anchor, setAnchor] = useState(null)
  const runAndClose = (action) => () => { setAnchor(null); action() }

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Yorum seçenekleri"
        aria-haspopup="menu"
        sx={{ flexShrink: 0, color: 'text.secondary', mr: -1 }}
      >
        <MoreHorizRounded fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {canManage && (
          <MenuItem onClick={runAndClose(onEdit)}>
            <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
            <ListItemText>Düzenle</ListItemText>
          </MenuItem>
        )}
        {canManage && (
          <MenuItem onClick={runAndClose(onDelete)} disabled={deleting}>
            <ListItemIcon>
              {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
            </ListItemIcon>
            <ListItemText>Sil</ListItemText>
          </MenuItem>
        )}
        {canReport && (
          <MenuItem onClick={runAndClose(onReport)}>
            <ListItemIcon><FlagOutlined fontSize="small" /></ListItemIcon>
            <ListItemText>Şikayet et</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
