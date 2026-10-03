import { Box, Button, CircularProgress } from '@mui/material'
import CommentRow from './CommentRow.jsx'
import CommentRowSkeleton from './CommentRowSkeleton.jsx'
import LoadMoreButton from '../common/LoadMoreButton.jsx'
import { flattenThread } from '../../hooks/usePostComments.js'

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

  return (
    <Box>
      {comments.map(c => {
        const items = flattenThread(c, threads)
        return (
          <Box key={c.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
            {renderRow(c)}
            {items.length > 0 && (
              <Box sx={{ ml: '18px', pl: { xs: 2, sm: 3.25 }, borderLeft: '2px solid', borderColor: 'divider', mb: 1 }}>
                {items.map(item => {
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
                        sx={{ color: 'text.secondary', fontWeight: 600, my: 0.5, minHeight: 36 }}
                      >
                        {item.loadingMore ? <CircularProgress size={14} /> : 'Daha fazla yanıt'}
                      </Button>
                    )
                  }
                  return (
                    <Box key={item.key}>
                      {renderRow(item.comment, { isReply: true, replyingTo: item.replyingTo })}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )
      })}

      {hasMore && <LoadMoreButton loading={loadingMore} onClick={onLoadMore} label="Daha fazla yorum" sx={{ py: 2 }} />}
    </Box>
  )
}
