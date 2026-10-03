import { useState } from 'react'
import { Box, Button, CircularProgress, Collapse } from '@mui/material'
import CommentRow from './CommentRow.jsx'
import CommentRowSkeleton from './CommentRowSkeleton.jsx'
import LoadMoreButton from '../common/LoadMoreButton.jsx'
import { flattenThread } from '../../hooks/usePostComments.js'

// Bir kök yorumun yanıt bloğu: açılıp kapanırken yumuşakça genişler/daralır.
// Kapanırken son görülen yanıtlar animasyon bitene kadar yerinde kalır.
function ThreadReplies({ items, renderItem }) {
  // Açıkken her zaman taze `items` çizilir; kapanırken (items boşalınca)
  // son açık hâl animasyon boyunca gösterilir.
  const [last, setLast] = useState({ sig: '', items: [] })
  const sig = items.map(i => i.key).join('|')
  if (items.length > 0 && sig !== last.sig) setLast({ sig, items })
  const shown = items.length > 0 ? items : last.items
  return (
    <Collapse in={items.length > 0} timeout={260} unmountOnExit onExited={() => setLast({ sig: '', items: [] })}>
      <Box
        sx={{
          ml: '19px', pl: { xs: 2, sm: 3 }, mb: 1.25,
          borderLeft: '2px solid', borderColor: 'brand.primarySoft'
        }}
      >
        {shown.map(renderItem)}
      </Box>
    </Collapse>
  )
}

// Kök yorumlar ve her birinin altında açılan yanıt bloğu. Yanıt bloğu TEK
// girintilidir (kök avatarının altından başlayan ince bir çizgi); derinliği
// ne olursa olsun tüm yanıtlar aynı hizada durur.
//
// rowProps: her CommentRow'a ortak geçen etkileşim prop'ları (yanıtla,
// şikayet et, en iyi cevap vb.) - bkz. PostDetail.
export default function CommentThreadList({
  comments, threads, acceptedCommentId, rowProps,
  onLoadMoreReplies, hasMore, loadingMore, onLoadMore
}) {
  const renderRow = (comment, extra = {}) => (
    <CommentRow
      comment={comment}
      accepted={acceptedCommentId === comment.id}
      thread={threads[comment.id]}
      {...rowProps}
      {...extra}
    />
  )

  const renderItem = (item) => {
    if (item.kind === 'loading') {
      return <CommentRowSkeleton key={item.key} compact />
    }
    if (item.kind === 'more') {
      return (
        <Button
          key={item.key}
          size="small"
          onClick={() => onLoadMoreReplies(item.parent)}
          disabled={item.loadingMore}
          sx={{ color: 'primary.main', my: 0.25, minHeight: 44, ml: -1 }}
        >
          {item.loadingMore ? <CircularProgress size={14} aria-label="Yükleniyor" /> : 'Daha fazla yanıt'}
        </Button>
      )
    }
    return (
      <Box key={item.key} className="sg-stagger">
        <Box>{renderRow(item.comment, { isReply: true, replyingTo: item.replyingTo })}</Box>
      </Box>
    )
  }

  return (
    <Box>
      {comments.map(c => (
        <Box key={c.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
          {renderRow(c)}
          <ThreadReplies items={flattenThread(c, threads)} renderItem={renderItem} />
        </Box>
      ))}

      {hasMore && <LoadMoreButton loading={loadingMore} onClick={onLoadMore} label="Daha fazla yorum" sx={{ py: 2 }} />}
    </Box>
  )
}
