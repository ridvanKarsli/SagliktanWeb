import { Box, Button, ButtonBase, IconButton, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { CloseRounded, HistoryRounded } from '@mui/icons-material'
import HighlightText from '../HighlightText.jsx'
import UserAvatar from '../avatars/UserAvatar.jsx'
import { fullNameOf, truncate } from '../../utils/text.js'

const rowSx = (active) => ({
  display: 'flex', width: '100%', justifyContent: 'flex-start', textAlign: 'left',
  p: 1, minHeight: 44, borderRadius: '12px', cursor: 'pointer',
  bgcolor: active ? 'action.selected' : undefined,
  '&:hover': { bgcolor: 'action.hover' }
})

function GroupLabel({ children }) {
  return (
    <Typography variant="caption" component="p" sx={{ color: 'text.secondary', fontWeight: 800, px: 1, mb: 0.25 }}>
      {children}
    </Typography>
  )
}

function RecentSearches({ items, onPick, onRemove, onClear }) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, mb: 0.5 }}>
        <GroupLabel>Son aramalar</GroupLabel>
        <Typography
          component="button"
          type="button"
          variant="caption"
          onClick={onClear}
          sx={{
            color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' },
            bgcolor: 'transparent', border: 0, font: 'inherit', fontWeight: 700, p: 1.25, m: -1, minHeight: 44
          }}
        >
          Tümünü temizle
        </Typography>
      </Stack>
      {items.map(term => (
        <Stack key={term} direction="row" alignItems="center" spacing={0.5}>
          <ButtonBase onClick={() => onPick(term)} sx={{ ...rowSx(false), flex: 1, minWidth: 0, gap: 1.25 }}>
            <HistoryRounded sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
            <Typography variant="body2" component="span" sx={{ color: 'text.primary', flex: 1 }} noWrap>{term}</Typography>
          </ButtonBase>
          <IconButton aria-label="Bu aramayı kaldır" onClick={() => onRemove(term)} sx={{ width: 44, height: 44 }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      ))}
    </Box>
  )
}

/**
 * Arama kutusunun altındaki açılır panel: kutu boşken son aramalar, yazarken
 * gönderi/yorum/kişi önerileri. activeIndex klavye (ok tuşları) ile seçili
 * öneriyi vurgular; sıra gönderiler → yorumlar → kişiler.
 */
export default function SearchSuggestions({
  term, recentSearches, onPickRecent, onRemoveRecent, onClearRecent,
  suggestions, loading, hasAny, activeIndex, onOpenPost, onOpenProfile, onSeeAll
}) {
  const clean = term.trim()
  const showRecent = clean.length === 0 && recentSearches.length > 0
  const hasPadding = showRecent || (clean.length > 0 && (loading || hasAny))
  const posts = suggestions?.posts || []
  const comments = suggestions?.comments || []
  const users = suggestions?.users || []

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
        zIndex: 20, borderRadius: '20px', border: '1px solid', borderColor: 'brand.border',
        maxHeight: 420, overflowY: 'auto', p: hasPadding ? 1.5 : 0
      }}
    >
      {showRecent && (
        <RecentSearches items={recentSearches} onPick={onPickRecent} onRemove={onRemoveRecent} onClear={onClearRecent} />
      )}

      {clean.length > 0 && loading && (
        <Box role="status" aria-label="Öneriler yükleniyor">
          {[0, 1, 2].map(i => (
            <Stack key={i} direction="row" spacing={1.25} alignItems="center" sx={{ p: 1 }} aria-hidden>
              <Skeleton variant="circular" width={28} height={28} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={`${70 - i * 15}%`} />
                <Skeleton variant="text" width="40%" sx={{ fontSize: '0.75rem' }} />
              </Box>
            </Stack>
          ))}
        </Box>
      )}

      {!loading && suggestions && !hasAny && (
        <Typography variant="body2" sx={{ color: 'text.secondary', p: 1.5 }}>
          Henüz eşleşen bir şey yok. Yazmaya devam et ya da Enter'a bas.
        </Typography>
      )}

      {!loading && posts.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <GroupLabel>Gönderiler</GroupLabel>
          {posts.map((post, i) => (
            <ButtonBase key={post.id} onClick={() => onOpenPost(post.id)} sx={{ ...rowSx(activeIndex === i), flexDirection: 'column', alignItems: 'stretch' }}>
              <Typography variant="body2" component="span" sx={{ display: 'block', fontWeight: 600, color: 'text.primary' }} noWrap>
                <HighlightText text={post.title} query={term} />
              </Typography>
              <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary' }} noWrap>
                <HighlightText text={truncate(post.content, 90)} query={term} />
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      )}

      {!loading && comments.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <GroupLabel>Yorumlar</GroupLabel>
          {comments.map((c, i) => (
            <ButtonBase key={c.id} onClick={() => onOpenPost(c.postId)} sx={{ ...rowSx(activeIndex === posts.length + i), flexDirection: 'column', alignItems: 'stretch' }}>
              <Typography variant="body2" component="span" sx={{ display: 'block', color: 'text.primary' }} noWrap>
                <HighlightText text={truncate(c.content, 90)} query={term} />
              </Typography>
              <Typography variant="caption" component="span" sx={{ display: 'block', color: 'text.secondary' }} noWrap>{c.authorName}</Typography>
            </ButtonBase>
          ))}
        </Box>
      )}

      {!loading && users.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <GroupLabel>Kişiler</GroupLabel>
          {users.map((u, i) => (
            <ButtonBase
              key={u.id}
              onClick={() => onOpenProfile(u.id)}
              sx={{ ...rowSx(activeIndex === posts.length + comments.length + i), alignItems: 'center', gap: 1.25 }}
            >
              <UserAvatar avatarKey={u.avatarKey} name={fullNameOf(u)} size={32} />
              <Typography variant="body2" component="span" sx={{ display: 'block', color: 'text.primary' }} noWrap>
                <HighlightText text={fullNameOf(u)} query={term} />
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      )}

      {!loading && hasAny && (
        <Button fullWidth size="small" onClick={onSeeAll} sx={{ mt: 0.5, minHeight: 44, bgcolor: 'brand.primarySoft', color: 'primary.main' }}>
          “{clean}” için tüm sonuçları gör
        </Button>
      )}
    </Paper>
  )
}
