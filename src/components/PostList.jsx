import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PostCard from './PostCard.jsx'

// Gönderi kartları akışı - ana sayfa, alt grup, arama ve profil listeleri
// aynı yerleşimi kullanır: kartlar arasında nefes alan boşluk, ilk
// yüklemede tek seferlik kademeli giriş (.sg-stagger). renderAfter(post,
// index) bir kartın hemen altına ek içerik (ör. "Senin gibi üyeler") koyar.
export default function PostList({ posts, token, highlightQuery, showPinnedBadge = false, renderAfter }) {
  const navigate = useNavigate()
  return (
    <Box className="sg-stagger" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
      {posts.map((post, i) => (
        <Box key={post.id} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          <PostCard
            post={post}
            token={token}
            onClick={() => navigate(`/post/${post.id}`)}
            highlightQuery={highlightQuery}
            showPinnedBadge={showPinnedBadge}
          />
          {renderAfter?.(post, i)}
        </Box>
      ))}
    </Box>
  )
}
