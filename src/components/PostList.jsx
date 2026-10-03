import { Box, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PostCard from './PostCard.jsx'

// İnce bölücülerle ayrılmış PostCard akışı - ana sayfa, alt grup, arama ve
// profil listeleri aynı yerleşimi kullanır. renderAfter(post, index) bir
// kartın hemen altına ek içerik (ör. "Senin gibi üyeler") koymak için.
export default function PostList({ posts, token, highlightQuery, showPinnedBadge = false, renderAfter }) {
  const navigate = useNavigate()
  return posts.map((post, i) => (
    <Box key={post.id}>
      {i > 0 && <Divider />}
      <PostCard
        post={post}
        token={token}
        onClick={() => navigate(`/post/${post.id}`)}
        highlightQuery={highlightQuery}
        showPinnedBadge={showPinnedBadge}
      />
      {renderAfter?.(post, i)}
    </Box>
  ))
}
