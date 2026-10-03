import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import { TipsAndUpdatesOutlined } from '@mui/icons-material'

// Başlık yazılırken bulunan benzer gönderiler: belki sorunun cevabı zaten var.
export default function SimilarPostsHint({ posts, isQuestion, onOpen }) {
  if (posts.length === 0) return null
  return (
    <Box sx={{ mt: -1, p: 1.25, borderRadius: 2.5, bgcolor: 'action.hover' }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5, color: 'text.secondary' }}>
        <TipsAndUpdatesOutlined sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {isQuestion ? 'Belki cevabın burada' : 'Benzer gönderiler'}
        </Typography>
      </Stack>
      <Stack spacing={0.25}>
        {posts.map(p => (
          <ButtonBase
            key={p.id}
            onClick={() => onOpen(p.id)}
            sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 1.5, px: 0.75, py: 0.75, '&:hover': { bgcolor: 'action.selected' } }}
          >
            <Box component="span" sx={{ display: 'block', minWidth: 0 }}>
              <Typography variant="body2" component="span" sx={{ display: 'block', fontWeight: 600 }} noWrap>{p.title}</Typography>
              <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                {p.commentCount ? `${p.commentCount} yorum` : 'Henüz yorum yok'}
                {p.postType === 'QUESTION' && p.acceptedCommentId ? ' · Çözüldü' : ''}
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Stack>
    </Box>
  )
}
