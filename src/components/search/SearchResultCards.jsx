import { Avatar, Box, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded } from '@mui/icons-material'
import HighlightText from '../HighlightText.jsx'
import { initialsFrom, prettyDate } from '../../utils/format.js'
import { cardActivationProps } from '../../utils/clickable.js'
import { fullNameOf } from '../../utils/text.js'

const cardSx = {
  p: { xs: 2, md: 2.5 },
  mb: 1.5,
  borderRadius: 2,
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
}

// Yorum arama sonucu: kart yorumun gönderisini açar, yazar adı profiline gider.
export function CommentResultCard({ comment, onClick, onAuthorClick, query }) {
  const authorName = comment.authorName || 'Kullanıcı'
  return (
    <Box {...cardActivationProps(onClick, `Yorum: ${authorName}`)} className="tap-scale" sx={cardSx}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <ChatBubbleOutlineRounded sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography
          variant="caption"
          component="button"
          type="button"
          onClick={(e) => { e.stopPropagation(); onAuthorClick?.(comment.authorId) }}
          sx={{
            color: 'text.secondary', fontWeight: 600, cursor: 'pointer', p: 0, border: 0, bgcolor: 'transparent',
            font: 'inherit', '&:hover': { textDecoration: 'underline' }
          }}
        >
          {authorName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          · {prettyDate(comment.createdAt) || ''}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
        {query ? <HighlightText text={comment.content} query={query} /> : comment.content}
      </Typography>
    </Box>
  )
}

// Kişi arama sonucu: kart profile gider. İsim bir başlık (heading) olarak
// kalır - kart bu yüzden <button> değil, klavyeyle de açılabilen bir makale.
export function PersonResultCard({ person, onClick, query }) {
  const fullName = fullNameOf(person, 'Kullanıcı')
  return (
    <Box {...cardActivationProps(onClick, fullName)} className="tap-scale" sx={cardSx}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 40, height: 40, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initialsFrom(fullName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
            {query ? <HighlightText text={fullName} query={query} /> : fullName}
          </Typography>
          {person.bio && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {person.bio}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
