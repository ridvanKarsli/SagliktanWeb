import { useCallback } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ReportDialog from '../components/comments/ReportDialog.jsx'
import CommentRowSkeleton from '../components/comments/CommentRowSkeleton.jsx'
import CommentComposer from '../components/comments/CommentComposer.jsx'
import CommentThreadList from '../components/comments/CommentThreadList.jsx'
import EmptyState from '../components/EmptyState.jsx'
import BackLink from '../components/common/BackLink.jsx'
import PostDetailSkeleton from '../components/post/PostDetailSkeleton.jsx'
import MedicalDisclaimer from '../components/post/MedicalDisclaimer.jsx'
import PostDetailHeader from '../components/post/PostDetailHeader.jsx'
import PostEditForm from '../components/post/PostEditForm.jsx'
import PostContent from '../components/post/PostContent.jsx'
import PostActionBar from '../components/post/PostActionBar.jsx'
import { detailSurfaceSx } from '../components/post/detailSurface.js'
import LeafBurst from '../components/celebration/LeafBurst.jsx'
import { reportComment, reportPost } from '../services/api.js'
import { canManage } from '../utils/permissions.js'
import { goToUserProfile } from '../utils/navigation.js'
import { usePost } from '../hooks/usePost.js'
import { usePostComments } from '../hooks/usePostComments.js'
import { useMyDiseaseGroups } from '../hooks/useMyDiseaseGroups.js'
import { useAcceptedAnswer } from '../hooks/useAcceptedAnswer.js'
import { useReportDialog } from '../hooks/useReportDialog.js'

// Gönderi detay sayfası: veri ve iş kuralları hook'larda (usePost,
// usePostComments, useAcceptedAnswer, useReportDialog), görünüm parçaları
// components/post ve components/comments altında. Bu dosya yalnızca sayfa
// düzenini ve parçaların birbirine bağlanmasını taşır.
export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const postState = usePost(postId)
  const { post, setPost, loading, error, adjustCommentCount } = postState
  const comments = usePostComments(postId, { onCountChange: adjustCommentCount })
  const answer = useAcceptedAnswer(post, setPost)
  // Backend, gruba üye olmayanın yorum yapmasını reddeder; kutuyu baştan
  // göstermemek "yaz, gönder, yetkin yok" hayal kırıklığını önler.
  const myGroups = useMyDiseaseGroups()

  const report = useReportDialog(({ type, id }, reason) => (
    type === 'post' ? reportPost(token, id, reason) : reportComment(token, id, reason)
  ))

  const goToProfile = useCallback((authorId) => goToUserProfile(navigate, user, authorId), [navigate, user])

  if (loading) return <PostDetailSkeleton />

  if (error || !post) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <BackLink label="Geri dön" />
        <EmptyState
          companion="bulut"
          title="Bu gönderiyi açamadık"
          description={`${error || 'Gönderi bulunamadı.'} Silinmiş olabilir ya da bağlantı kopmuş olabilir; biraz sonra yeniden deneyebilirsin.`}
          actionLabel="Akışa dön"
          onAction={() => navigate('/home')}
        />
      </Box>
    )
  }

  const isOwnPost = user?.id === post.authorId
  const membershipKnown = myGroups != null
  const isMember = membershipKnown && myGroups.some(g => String(g.id) === String(post.diseaseGroupId))
  const canAcceptAnswers = isOwnPost && post.postType === 'QUESTION'

  const commentRowProps = {
    canAccept: canAcceptAnswers,
    onAccept: answer.accept,
    onUnaccept: answer.clear,
    acceptPending: answer.pending,
    canReply: isMember,
    onUpdated: comments.saveCommentUpdate,
    onReplySubmitted: comments.submitReply,
    onReport: (id) => report.open({ type: 'comment', id }),
    onAuthorClick: goToProfile,
    onToggleThread: comments.toggleThread,
    celebrateId: answer.celebration?.commentId ?? null,
  }
  const isQuestion = post.postType === 'QUESTION'
  const commentTotal = post.commentCount ?? comments.comments.length

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <BackLink to={`/sub-groups/${post.subGroupId}`} label={post.subGroupName || 'Alt gruba dön'} />

      <Box component="article" aria-label={post.title || "Gönderi"} sx={{ ...detailSurfaceSx, mb: 3.5 }}>
        <PostDetailHeader
          post={post}
          isOwnPost={isOwnPost}
          canManagePost={canManage(user, post.authorId)}
          showActions={!postState.editingPost}
          onAuthorClick={goToProfile}
          onTogglePin={postState.togglePin}
          togglingPin={postState.togglingPin}
          onEdit={postState.startEditing}
          onDelete={() => postState.removePost((deleted) => navigate(`/sub-groups/${deleted.subGroupId}`))}
          deleting={postState.deletingPost}
          onReport={() => report.open({ type: 'post', id: post.id })}
        />

        {postState.editingPost ? (
          <PostEditForm
            title={postState.editTitle}
            onTitleChange={postState.setEditTitle}
            content={postState.editContent}
            onContentChange={postState.setEditContent}
            saving={postState.savingPost}
            onSave={postState.savePostEdit}
            onCancel={postState.cancelEditing}
          />
        ) : (
          <Box>
            <PostContent
              post={post}
              isOwnPost={isOwnPost}
              onPollChange={(poll) => setPost(p => ({ ...p, poll }))}
            />
            <MedicalDisclaimer sx={{ mt: 2.5 }} />
          </Box>
        )}

        {!postState.editingPost && <PostActionBar post={post} />}
      </Box>

      <Box component="section" aria-labelledby="comments-title">
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 0.5, px: 0.5 }}>
          <Typography id="comments-title" variant="h4" component="h2">
            {isQuestion ? 'Cevaplar' : 'Yorumlar'}
          </Typography>
          {commentTotal > 0 && (
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 800 }}>{commentTotal}</Typography>
          )}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.75, px: 0.5 }}>
          {isQuestion
            ? 'Deneyimini paylaş; soruyu soran, en çok işine yarayan cevabı seçebilir.'
            : 'Nazik ve destekleyici bir dil, burayı herkes için güvenli tutar.'}
        </Typography>

        <Box sx={{ ...detailSurfaceSx, px: { xs: 1.75, sm: 3 }, pt: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
          {membershipKnown && !isMember ? (
            <Alert
              severity="info"
              sx={{ mb: 1.5 }}
              action={
                <Button color="inherit" size="small" onClick={() => navigate(`/groups/${post.diseaseGroupId}`)} sx={{ minHeight: 44 }}>
                  Gruba git
                </Button>
              }
            >
              Yorum yapmak için bu hastalık grubuna katılman gerekiyor.
            </Alert>
          ) : (
            <CommentComposer
              value={comments.newComment}
              onChange={comments.setNewComment}
              onSubmit={comments.submitComment}
              submitting={comments.postingComment}
              errorText={comments.commentError}
              disabled={!isMember}
            />
          )}

          {comments.commentsLoading ? (
            <Box role="status" aria-label="Yorumlar yükleniyor">
              <CommentRowSkeleton />
              <CommentRowSkeleton />
              <CommentRowSkeleton />
            </Box>
          ) : comments.comments.length === 0 ? (
            <EmptyState
              companion={isQuestion ? 'baykus' : 'serce'}
              title={isQuestion ? 'Henüz cevap yok' : 'Henüz yorum yok'}
              description={isMember
                ? 'İlk yazan sen ol; küçük bir deneyim bile birinin yolunu aydınlatabilir.'
                : 'Gruba katılınca ilk yazan sen olabilirsin.'}
              dense
            />
          ) : (
            <CommentThreadList
              comments={comments.comments}
              threads={comments.threads}
              acceptedCommentId={post.acceptedCommentId}
              rowProps={commentRowProps}
              onLoadMoreReplies={comments.loadMoreReplies}
              hasMore={!comments.last}
              loadingMore={comments.commentsLoadingMore}
              onLoadMore={comments.loadMoreComments}
            />
          )}
        </Box>
      </Box>

      <LeafBurst trigger={answer.celebration?.at} />
      <ReportDialog {...report.dialogProps} />
    </Box>
  )
}
