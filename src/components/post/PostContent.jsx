import { Button, Stack, Typography } from '@mui/material'
import { CheckCircleRounded, PushPinRounded } from '@mui/icons-material'
import PostTypeBadges from '../PostTypeBadges.jsx'
import ReadAloudButton from '../a11y/ReadAloudButton.jsx'
import SensitiveContentBanner from '../SensitiveContentBanner.jsx'
import PollView from '../PollView.jsx'
import PostGallery from '../PostGallery.jsx'

function scrollToComment(commentId) {
  document.getElementById(`comment-${commentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Gönderi detayının gövdesi: tür rozetleri, başlık, metin, anket, fotoğraflar
// ve soru gönderilerinde "çözüldü" bağlantısı / en iyi cevap ipucu.
export default function PostContent({ post, isOwnPost, onPollChange }) {
  const isQuestion = post.postType === 'QUESTION'
  const solved = post.acceptedCommentId != null

  return (
    <>
      {post.pinned && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1, color: 'primary.main' }}>
          <PushPinRounded sx={{ fontSize: 15 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
            Profile sabitlendi
          </Typography>
        </Stack>
      )}
      <PostTypeBadges postType={post.postType} solved={solved} />
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, wordBreak: 'break-word' }}>
        {post.title}
      </Typography>
      <ReadAloudButton text={`${post.title}. ${post.content || ''}`} sx={{ ml: -1, mb: 0.5 }} />
      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word', color: 'text.primary', mb: post.attachments?.length ? 1.5 : 0 }}
      >
        {post.content}
      </Typography>
      {post.flaggedSensitive && <SensitiveContentBanner />}
      {post.postType === 'POLL' && (
        <PollView postId={post.id} poll={post.poll} isOwner={!!isOwnPost} onChange={onPollChange} sx={{ mt: 1.5 }} />
      )}
      <PostGallery attachments={post.attachments} />
      {isQuestion && solved && (
        <Button
          size="small"
          color="success"
          startIcon={<CheckCircleRounded />}
          onClick={() => scrollToComment(post.acceptedCommentId)}
          sx={{ mt: 1, ml: -1, fontWeight: 700, minHeight: 36 }}
        >
          Çözüldü - en iyi cevaba git
        </Button>
      )}
      {isQuestion && !solved && isOwnPost && post.commentCount > 0 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          İşine yarayan cevabın altındaki <b>En iyi cevap</b> düğmesine dokun - hem yazana teşekkür etmiş olursun hem de soru çözüldü olarak işaretlenir.
        </Typography>
      )}
    </>
  )
}
