import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, ChevronRightRounded } from '@mui/icons-material'
import HighlightText from '../HighlightText.jsx'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { relativeTime } from '../../utils/format.js'
import { cardActivationProps } from '../../utils/clickable.js'
import { fullNameOf } from '../../utils/text.js'
import { focusRingSx } from '../../design/focus.js'

const surfaceSx = {
  p: { xs: 2, sm: 2.25 },
  borderRadius: '20px',
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'brand.border',
  boxShadow: 1,
}

const cardSx = {
  ...surfaceSx,
  cursor: 'pointer',
  transition: 'border-color 200ms ease, box-shadow 240ms ease, transform 160ms var(--ease-spring)',
  '@media (hover: hover)': { '&:hover': { boxShadow: 3, borderColor: 'brand.borderStrong' } },
  '&:focus-visible': focusRingSx
}

// Yorum arama sonucu: kart yorumun gönderisini açar, yazar adı profiline gider.
export function CommentResultCard({ comment, onClick, onAuthorClick, query }) {
  const authorName = comment.authorName || 'Kullanıcı'
  return (
    <Box {...cardActivationProps(onClick, `Yorum: ${authorName}`)} className="tap-scale" sx={cardSx}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
        <UserAvatar avatarKey={comment.authorAvatarKey} name={authorName} size={32} />
        <Typography
          variant="body2"
          component="button"
          type="button"
          onClick={(e) => { e.stopPropagation(); onAuthorClick?.(comment.authorId) }}
          sx={{
            color: 'text.primary', fontWeight: 800, cursor: 'pointer', p: 0, border: 0, bgcolor: 'transparent',
            font: 'inherit', minHeight: 32, '&:hover': { textDecoration: 'underline' },
            '&:focus-visible': { ...focusRingSx, borderRadius: '6px' }
          }}
        >
          {authorName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          · {relativeTime(comment.createdAt)}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <ChatBubbleOutlineRounded sx={{ fontSize: 16, color: "text.secondary" }} aria-hidden />
      </Stack>
      <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
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
    <Box {...cardActivationProps(onClick, fullName)} className="tap-scale" sx={{ ...cardSx, py: { xs: 1.5, sm: 1.75 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <UserAvatar avatarKey={person.avatarKey} name={fullName} size={48} sx={{ flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.35 }} noWrap>
            {query ? <HighlightText text={fullName} query={query} /> : fullName}
          </Typography>
          {person.bio && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {person.bio}
            </Typography>
          )}
        </Box>
        <ChevronRightRounded sx={{ color: 'text.secondary' }} aria-hidden />
      </Stack>
    </Box>
  )
}

// Sonuçlar yüklenirken yorum/kişi kartlarının taslağı.
export function ResultCardSkeleton({ kind = 'comment' }) {
  if (kind === 'person') {
    return (
      <Box aria-hidden sx={{ ...surfaceSx, py: { xs: 1.5, sm: 1.75 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="45%" sx={{ fontSize: '1.05rem' }} />
            <Skeleton variant="text" width="70%" />
          </Box>
        </Stack>
      </Box>
    )
  }
  return (
    <Box aria-hidden sx={surfaceSx}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width="35%" />
      </Stack>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
    </Box>
  )
}
