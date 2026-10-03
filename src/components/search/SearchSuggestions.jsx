import { Avatar, Box, Button, ButtonBase, CircularProgress, IconButton, Paper, Stack, Typography } from '@mui/material'
import { CloseRounded, HistoryRounded } from '@mui/icons-material'
import HighlightText from '../HighlightText.jsx'
import { initialsFrom } from '../../utils/format.js'
import { fullNameOf, truncate } from '../../utils/text.js'

const rowSx = (active) => ({
  display: 'flex', width: '100%', justifyContent: 'flex-start', textAlign: 'left',
  p: 1, borderRadius: 1.5, cursor: 'pointer',
  bgcolor: active ? 'action.selected' : undefined,
  '&:hover': { bgcolor: 'action.hover' }
})

function GroupLabel({ children }) {
  return (
    <Typography variant="caption" component="p" sx={{ color: 'text.secondary', fontWeight: 700, px: 1 }}>
      {children}
    </Typography>
  )
}

function RecentSearches({ items, onPick, onRemove, onClear }) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, mb: 0.5 }}>
        <GroupLabel>SON ARAMALAR</GroupLabel>
        <Typography
          component="button"
          type="button"
          variant="caption"
          onClick={onClear}
          sx={{
            color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' },
            bgcolor: 'transparent', border: 0, font: 'inherit', p: 1, m: -1
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
          <IconButton size="small" aria-label="Bu aramayı kaldır" onClick={() => onRemove(term)}>
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
        zIndex: 20, borderRadius: 2, border: '1px solid', borderColor: 'divider',
        maxHeight: 420, overflowY: 'auto', p: hasPadding ? 1.5 : 0
      }}
    >
      {showRecent && (
        <RecentSearches items={recentSearches} onPick={onPickRecent} onRemove={onRemoveRecent} onClear={onClearRecent} />
      )}

      {clean.length > 0 && loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} aria-label="Öneriler yükleniyor" />
        </Box>
      )}

      {!loading && suggestions && !hasAny && (
        <Typography variant="body2" sx={{ color: 'text.secondary', p: 1.5 }}>Sonuç bulunamadı</Typography>
      )}

      {!loading && posts.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <GroupLabel>GÖNDERİLER</GroupLabel>
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
          <GroupLabel>YORUMLAR</GroupLabel>
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
          <GroupLabel>KİŞİLER</GroupLabel>
          {users.map((u, i) => (
            <ButtonBase
              key={u.id}
              onClick={() => onOpenProfile(u.id)}
              sx={{ ...rowSx(activeIndex === posts.length + comments.length + i), alignItems: 'center', gap: 1.25 }}
            >
              <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}>{initialsFrom(fullNameOf(u))}</Avatar>
              <Typography variant="body2" component="span" sx={{ display: 'block', color: 'text.primary' }} noWrap>
                <HighlightText text={fullNameOf(u)} query={term} />
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      )}

      {!loading && hasAny && (
        <Button fullWidth size="small" onClick={onSeeAll} sx={{ mt: 0.5 }}>
          "{clean}" için tüm sonuçları gör
        </Button>
      )}
    </Paper>
  )
}
