import { useCallback, useState } from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PostCard from './PostCard.jsx'
import SendPostDialog from './SendPostDialog.jsx'
import ReportDialog from './comments/ReportDialog.jsx'
import { useReportDialog } from '../hooks/useReportDialog.js'
import { reportPost } from '../services/api.js'

// Gönderi kartları akışı - ana sayfa, alt grup, arama ve profil listeleri
// aynı yerleşimi kullanır: kartlar arasında nefes alan boşluk, ilk
// yüklemede tek seferlik kademeli giriş (.sg-stagger). renderAfter(post,
// index) bir kartın hemen altına ek içerik (ör. "Senin gibi üyeler") koyar.
//
// "Mesajla gönder" ve "Şikayet et" dialogları liste başına TEK örnek:
// activeSendPost / rapor hedefi hangi kart için açıldığını tutar (bkz.
// PostCard üstündeki not). Kartlara giden callback'ler useCallback ile
// sabit ki React.memo(PostCard) işe yarasın.
export default function PostList({ posts, token, highlightQuery, showPinnedBadge = false, renderAfter }) {
  const navigate = useNavigate()
  const [activeSendPost, setActiveSendPost] = useState(null)
  const report = useReportDialog((postId, reason) => reportPost(token, postId, reason))

  const openPost = useCallback((id) => navigate(`/post/${id}`), [navigate])
  const openSend = useCallback((post) => setActiveSendPost(post), [])
  const closeSend = useCallback(() => setActiveSendPost(null), [])
  const { open: openReport } = report
  const onReport = useCallback((id) => openReport(id), [openReport])

  return (
    <>
      <Box className="sg-stagger" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
        {posts.map((post, i) => (
          <Box key={post.id} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
            <PostCard
              post={post}
              token={token}
              onOpen={openPost}
              onSend={token ? openSend : undefined}
              onReport={token ? onReport : undefined}
              highlightQuery={highlightQuery}
              showPinnedBadge={showPinnedBadge}
            />
            {renderAfter?.(post, i)}
          </Box>
        ))}
      </Box>

      {/* Dialoglar kart ağacının DIŞINDA: portal olsalar da React olayları
          bileşen ağacında kabarcıklandığı için kartın içindeyken dialogdaki
          her tıklama kartın onClick'ini tetikleyip detay sayfasına gidiyordu. */}
      {token && (
        <>
          <SendPostDialog open={activeSendPost != null} onClose={closeSend} post={activeSendPost} />
          <ReportDialog {...report.dialogProps} />
        </>
      )}
    </>
  )
}
