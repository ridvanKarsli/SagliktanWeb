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
      <Typography variant="h3" component="h1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
        {post.title}
      </Typography>
      <ReadAloudButton text={`${post.title}. ${post.content || ''}`} sx={{ ml: -1, mb: 1 }} />
      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word', color: 'text.primary', fontSize: { sm: '1.125rem' }, mb: post.attachments?.length ? 1.5 : 0 }}
      >
        {post.content}
      </Typography>
      {post.flaggedSensitive && <SensitiveContentBanner />}
      {post.postType === 'POLL' && (
        <PollView postId={post.id} poll={post.poll} isOwner={!!isOwnPost} onChange={onPollChange} sx={{ mt: 1.5 }} />
      )}
      <PostGallery attachments={post.attachments} eagerFirst />
      {isQuestion && solved && (
        <Button
          size="small"
          startIcon={<CheckCircleRounded />}
          onClick={() => scrollToComment(post.acceptedCommentId)}
          sx={{ mt: 1.5, minHeight: 44, px: 2, bgcolor: 'brand.primarySoft', color: 'primary.main', '&:hover': { bgcolor: 'brand.primarySoft', color: 'primary.dark' } }}
        >
          Çözüldü · en iyi cevaba git
        </Button>
      )}
      {isQuestion && !solved && isOwnPost && post.commentCount > 0 && (
        <Typography variant="body2" sx={{ display: 'block', mt: 1.5, p: 1.5, borderRadius: '14px', bgcolor: 'brand.skySoft', color: 'text.primary' }}>
          İşine yarayan cevabın altındaki <b>En iyi cevap</b> düğmesine dokun. Hem yazana teşekkür etmiş olursun hem de sorun çözüldü olarak işaretlenir.
        </Typography>
      )}
    </>
  )
}
