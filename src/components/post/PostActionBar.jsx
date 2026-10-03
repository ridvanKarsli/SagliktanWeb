import { useState } from 'react'
import { Box, IconButton, Stack } from '@mui/material'
import { IosShareRounded, SendOutlined } from '@mui/icons-material'
import ReactionButtons from '../ReactionButtons.jsx'
import SaveButton from '../SaveButton.jsx'
import ShareStoryCardDialog from '../ShareStoryCardDialog.jsx'
import SendPostDialog from '../SendPostDialog.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { reactToPost, removePostReaction, savePost, unsavePost } from '../../services/api.js'

// Gönderi detayındaki eylem çubuğu: faydalı/değil, kaydet, hikaye olarak
// paylaş, mesajla gönder. Gönderi kartının alt kenarında, ince bir çizgiyle.
export default function PostActionBar({ post }) {
  const { token } = useAuth()
  const [shareCardOpen, setShareCardOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  return (
    <>
      <Box
        sx={{
          mx: { xs: -1, sm: -1.5 }, mt: 2, pt: 0.75,
          borderTop: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'
        }}
      >
        <ReactionButtons
          helpfulCount={post.helpfulCount}
          notHelpfulCount={post.notHelpfulCount}
          myReaction={post.myReaction}
          onReact={(value) => reactToPost(token, post.id, value)}
          onRemove={() => removePostReaction(token, post.id)}
          size="medium"
        />
        <Stack direction="row" spacing={0.25} alignItems="center">
          <SaveButton
            saved={!!post.saved}
            count={post.savedCount}
            onSave={() => savePost(token, post.id)}
            onUnsave={() => unsavePost(token, post.id)}
            size="medium"
          />
          <IconButton onClick={() => setShareCardOpen(true)} title="Hikaye olarak paylaş" aria-label="Hikaye olarak paylaş" sx={{ width: 44, height: 44 }}>
            <IosShareRounded fontSize="small" />
          </IconButton>
          <IconButton onClick={() => setSendDialogOpen(true)} title="Mesajla gönder" aria-label="Mesajla gönder" sx={{ width: 44, height: 44 }}>
            <SendOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <ShareStoryCardDialog open={shareCardOpen} onClose={() => setShareCardOpen(false)} post={post} />
      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />
    </>
  )
}
