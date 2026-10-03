import { useCallback } from 'react'
import { Alert, Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { ArrowBack, ChatBubbleOutlineRounded } from '@mui/icons-material'
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
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }} aria-label="Geri dön">
          <ArrowBack />
        </IconButton>
        <Alert severity="error">{error || 'Gönderi bulunamadı.'}</Alert>
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
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <BackLink to={`/sub-groups/${post.subGroupId}`} ariaLabel="Alt gruba dön" label="Alt Gruba Dön" />
      <MedicalDisclaimer />

      <Box sx={{ mb: 1 }}>
        <Box sx={{ pb: { xs: 2, md: 2.5 } }}>
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
            <PostContent
              post={post}
              isOwnPost={isOwnPost}
              onPollChange={(poll) => setPost(p => ({ ...p, poll }))}
            />
          )}
        </Box>

        {!postState.editingPost && <PostActionBar post={post} />}
      </Box>

      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Yorumlar
      </Typography>

      {membershipKnown && !isMember ? (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate(`/groups/${post.diseaseGroupId}`)}>
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
          disabled={!isMember}
        />
      )}

      {comments.commentsLoading ? (
        <Stack>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
      ) : comments.comments.length === 0 ? (
        <EmptyState
          icon={ChatBubbleOutlineRounded}
          title="Henüz yorum yok"
          description={isMember ? 'İlk yorumu sen yaz; deneyimin başka birine yol gösterebilir.' : 'Gruba katılınca ilk yorumu sen yazabilirsin.'}
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

      <ReportDialog {...report.dialogProps} />
    </Box>
  )
}
