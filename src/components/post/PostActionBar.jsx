import { useState } from 'react'
import { Box, Divider, IconButton, Stack } from '@mui/material'
import { IosShareRounded, SendOutlined } from '@mui/icons-material'
import ReactionButtons from '../ReactionButtons.jsx'
import SaveButton from '../SaveButton.jsx'
import ShareStoryCardDialog from '../ShareStoryCardDialog.jsx'
import SendPostDialog from '../SendPostDialog.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { reactToPost, removePostReaction, savePost, unsavePost } from '../../services/api.js'

// Gönderi detayındaki eylem çubuğu: faydalı/değil, kaydet, hikaye olarak
// paylaş, mesajla gönder. İçerikten bir bölücüyle ayrılıp tam genişliğe yayılır.
export default function PostActionBar({ post }) {
  const { token } = useAuth()
  const [shareCardOpen, setShareCardOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  return (
    <>
      <Divider />
      <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ReactionButtons
          helpfulCount={post.helpfulCount}
          notHelpfulCount={post.notHelpfulCount}
          myReaction={post.myReaction}
          onReact={(value) => reactToPost(token, post.id, value)}
          onRemove={() => removePostReaction(token, post.id)}
          size="medium"
        />
        <Stack direction="row" spacing={0.5} alignItems="center">
          <SaveButton
            saved={!!post.saved}
            count={post.savedCount}
            onSave={() => savePost(token, post.id)}
            onUnsave={() => unsavePost(token, post.id)}
            size="medium"
          />
          <IconButton onClick={() => setShareCardOpen(true)} title="Hikaye olarak paylaş" aria-label="Hikaye olarak paylaş">
            <IosShareRounded fontSize="small" />
          </IconButton>
          <IconButton onClick={() => setSendDialogOpen(true)} title="Mesajla gönder" aria-label="Mesajla gönder">
            <SendOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <ShareStoryCardDialog open={shareCardOpen} onClose={() => setShareCardOpen(false)} post={post} />
      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />
    </>
  )
}
