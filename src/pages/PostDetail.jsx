import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, CircularProgress, Divider, IconButton, Skeleton, Stack, TextField, Typography
} from '@mui/material'
import {
  ArrowBack, DeleteOutline, EditOutlined, FlagOutlined, InfoOutlined, IosShareRounded, SendOutlined
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import ReactionButtons from '../components/ReactionButtons.jsx'
import SaveButton from '../components/SaveButton.jsx'
import PostGallery from '../components/PostGallery.jsx'
import ShareStoryCardDialog from '../components/ShareStoryCardDialog.jsx'
import SendPostDialog from '../components/SendPostDialog.jsx'
import CommentRow from '../components/comments/CommentRow.jsx'
import CommentRowSkeleton from '../components/comments/CommentRowSkeleton.jsx'
import ReportDialog from '../components/comments/ReportDialog.jsx'
import {
  getMyDiseaseGroups, reactToPost, removePostReaction, reportComment, reportPost, savePost, unsavePost
} from '../services/api.js'
import { initialsFrom, prettyDate } from '../utils/format.js'
import { canManage } from '../utils/permissions.js'
import { goToUserProfile } from '../utils/navigation.js'
import { usePost } from '../hooks/usePost.js'
import { usePostComments } from '../hooks/usePostComments.js'

// Gönderi detay sayfası. Önceden 1000+ satırlık tek dosyaydı (post + yorum
// CRUD + thread-drill navigasyonu + rapor dialogu + CommentRow hepsi burada
// tanımlıydı) - bkz. clean-code audit. Artık:
//   - usePost(postId): gönderinin kendisi (yükle/düzenle/sil)
//   - usePostComments(postId): yorum ağacı + thread-drill navigasyonu
//   - components/comments/{CommentRow,CommentRowSkeleton,ReportDialog}: UI parçaları
//   - utils/{commentTree,permissions,navigation}: saf yardımcı fonksiyonlar
// Bu dosya artık sadece sayfa düzenini ve bu parçaların birbirine bağlanmasını taşıyor.
export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()

  const {
    post, loading, error,
    editingPost, setEditingPost, editTitle, setEditTitle, editContent, setEditContent,
    savingPost, deletingPost,
    startEditing, savePostEdit, removePost
  } = usePost(postId)

  const {
    comments, commentsLoading, commentsLoadingMore, last,
    currentThread, focusedComment,
    newComment, setNewComment, postingComment,
    loadMoreComments, submitComment, submitReply, saveCommentUpdate,
    openThread, goBackThread, loadMoreThreadReplies
  } = usePostComments(postId)

  // { open, type: 'post' | 'comment', targetId }
  const [reportTarget, setReportTarget] = useState({ open: false, type: null, targetId: null })
  const [reportSubmitting, setReportSubmitting] = useState(false)

  // Faz 2 adım 5: hikaye kartı dialogu - bkz. ShareStoryCardDialog.jsx.
  const [shareCardOpen, setShareCardOpen] = useState(false)
  // Faz 2 adım 7: gönderiyi mesajla gönderme dialogu - bkz. SendPostDialog.jsx.
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  // Backend, bir hastalık grubuna üye olmayan kullanıcının o gruba ait
  // postlara yorum yapmasını reddediyor (bkz. CommentServiceImpl.
  // assertMemberOfGroup). Bunu önceden bilmeden yorum kutusunu göstermek,
  // kullanıcının yazıp gönder deyince "yetkin yok" hatası almasına yol
  // açıyordu - şimdi üyelik önceden kontrol edilip kutu hiç gösterilmiyor.
  const [myGroupIds, setMyGroupIds] = useState(null) // null = henüz bilinmiyor
  useEffect(() => {
    if (!token) return
    let mounted = true
    getMyDiseaseGroups(token)
      .then(groups => { if (mounted) setMyGroupIds(new Set((Array.isArray(groups) ? groups : []).map(g => g.id))) })
      .catch(() => { if (mounted) setMyGroupIds(new Set()) })
    return () => { mounted = false }
  }, [token])

  const goToProfile = useCallback((authorId) => goToUserProfile(navigate, user, authorId), [navigate, user])

  const openReportDialog = (type, targetId) => setReportTarget({ open: true, type, targetId })
  const closeReportDialog = () => setReportTarget({ open: false, type: null, targetId: null })

  const submitReport = async (reason) => {
    setReportSubmitting(true)
    try {
      if (reportTarget.type === 'post') {
        await reportPost(token, reportTarget.targetId, reason)
      } else {
        await reportComment(token, reportTarget.targetId, reason)
      }
      showSuccess('Şikayetiniz alındı, teşekkür ederiz.')
      closeReportDialog()
    } catch (err) {
      showError(err.message || 'Şikayet gönderilemedi.')
    } finally {
      setReportSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2,
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="35%" sx={{ fontSize: '0.875rem' }} />
              <Skeleton variant="text" width="20%" sx={{ fontSize: '0.75rem' }} />
            </Box>
          </Stack>
          <Skeleton variant="text" width="55%" sx={{ fontSize: '1.5rem', mb: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </Box>
        <Stack spacing={1.5}>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
      </Box>
    )
  }

  if (error || !post) {
    return (
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack />
        </IconButton>
        <Alert severity="error">{error || 'Gönderi bulunamadı.'}</Alert>
      </Box>
    )
  }

  const manageable = canManage(user, post.authorId)
  const isOwnPost = user?.id === post.authorId
  const edited = !!(post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt)
  // Üyelik henüz yükleniyorsa (myGroupIds === null) yorum kutusunu
  // gösterip sonra "yetkin yok" hatası almasın diye şimdilik gizli tutuyoruz.
  const isMember = myGroupIds != null && myGroupIds.has(post.diseaseGroupId)

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(`/sub-groups/${post.subGroupId}`)} size="small">
          <ArrowBack />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Alt Gruba Dön
        </Typography>
      </Stack>

      {/* Yasal uyarı korunuyor ama kompakt: eskiden her gönderi sayfasının
          tepesinde 3 satırlık dolgulu bir blok olarak duruyor ve asıl
          içeriği ekranın çok altına itiyordu. Her gönderide birebir aynı
          metin tekrarlandığı için kullanıcı zaten ikinci gönderiden sonra
          okumayı bırakıyor - görünür olması yeterli, baskın olması gerekmiyor. */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="flex-start"
        sx={{ mb: 2, px: 0.5, color: 'text.secondary' }}
      >
        <InfoOutlined sx={{ fontSize: 16, mt: '2px', flexShrink: 0 }} />
        <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
          Buradaki paylaşımlar kişisel deneyimlerdir, tıbbi tavsiye değildir.
          Sağlık kararlarınız için bir uzmana danışın.
        </Typography>
      </Stack>

      <Box sx={{ mb: 1 }}>
      <Box sx={{ pb: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          {/* Gradyan ring avatar - bkz. PostCard.jsx, marka diliyle tutarlı */}
          <Box
            onClick={() => goToProfile(post.authorId)}
            sx={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
              background: 'linear-gradient(135deg, #4CB89F 0%, #E08B6D 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', p: '2.5px'
            }}
          >
            <Avatar
              sx={{
                width: '100%', height: '100%', fontWeight: 700,
                border: '2px solid', borderColor: 'background.default'
              }}
            >
              {initialsFrom(post.authorName || '')}
            </Avatar>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              onClick={() => goToProfile(post.authorId)}
              sx={{ fontWeight: 600, display: 'inline-block', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {post.authorName || 'Kullanıcı'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {prettyDate(post.createdAt) || ''}
              {edited ? ' · düzenlendi' : ''}
            </Typography>
          </Box>
          {!editingPost && (
            <Stack direction="row" spacing={0.5}>
              {manageable && (
                <>
                  <IconButton size="small" onClick={startEditing}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removePost((deletedPost) => navigate(`/sub-groups/${deletedPost.subGroupId}`))}
                    disabled={deletingPost}
                  >
                    {deletingPost ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                  </IconButton>
                </>
              )}
              {!isOwnPost && (
                <IconButton size="small" onClick={() => openReportDialog('post', post.id)} title="Şikayet Et">
                  <FlagOutlined fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )}
        </Stack>

        {editingPost ? (
          <Stack spacing={2}>
            <TextField
              label="Başlık"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="İçerik"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="contained" onClick={savePostEdit} disabled={savingPost}>
                {savingPost ? <CircularProgress size={16} color="inherit" /> : 'Kaydet'}
              </Button>
              <Button onClick={() => setEditingPost(false)} disabled={savingPost}>İptal</Button>
            </Stack>
          </Stack>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, wordBreak: 'break-word' }}>
              {post.title}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word', color: 'text.primary', mb: post.attachments?.length ? 1.5 : 0 }}>
              {post.content}
            </Typography>
            <PostGallery attachments={post.attachments} />
          </>
        )}
      </Box>

      {/* X/Facebook tarzı: aksiyon çubuğu içerikten bir bölücüyle ayrılıp
          kartın tam genişliğine yayılıyor, salt "içeriğin altında duran bir
          buton grubu" değil de belirgin bir aksiyon alanı hissi veriyor. */}
      {!editingPost && (
        <>
          <Divider />
          <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ReactionButtons
              helpfulCount={post.helpfulCount}
              notHelpfulCount={post.notHelpfulCount}
              myReaction={post.myReaction}
              onReact={(value) => reactToPost(token, post.id, value)}
              onRemove={() => removePostReaction(token, post.id)}
              size="medium"
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <SaveButton
                saved={!!post.saved}
                count={post.savedCount}
                onSave={() => savePost(token, post.id)}
                onUnsave={() => unsavePost(token, post.id)}
                size="medium"
              />
              <IconButton onClick={() => setShareCardOpen(true)} title="Hikaye olarak paylaş">
                <IosShareRounded fontSize="small" />
              </IconButton>
              <IconButton onClick={() => setSendDialogOpen(true)} title="Mesajla gönder">
                <SendOutlined fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </>
      )}
      </Box>

      <ShareStoryCardDialog open={shareCardOpen} onClose={() => setShareCardOpen(false)} post={post} />
      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        {focusedComment ? 'Yanıtlar' : 'Yorumlar'}
      </Typography>

      {/* Bir yorumun thread'i açıkken üst-seviye yorum kutusu yerine odak
          yorumun kendi "Yanıtla" butonu kullanılıyor - hangi seviyeye yazdığı
          karışmasın diye. */}
      {!focusedComment && (
        myGroupIds != null && !isMember ? (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate(`/groups/${post.diseaseGroupId}`)}>
                Gruba Git
              </Button>
            }
          >
            Yorum yapabilmek için bu hastalık grubuna üye olmalısın.
          </Alert>
        ) : (
          <Box component="form" onSubmit={submitComment} sx={{ mb: 3 }}>
            <Stack spacing={1.5}>
              <TextField
                placeholder="Yorumunu yaz..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                disabled={!isMember}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={postingComment || !isMember}
                sx={{ alignSelf: 'flex-end' }}
              >
                {postingComment ? <CircularProgress size={16} color="inherit" /> : 'Yorum Yap'}
              </Button>
            </Stack>
          </Box>
        )
      )}

      {commentsLoading ? (
        <Stack spacing={1.5}>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
      ) : focusedComment ? (
        <Box>
          <Button
            size="small"
            onClick={goBackThread}
            startIcon={<ArrowBack fontSize="small" />}
            sx={{ color: 'text.secondary', mb: 1.5 }}
          >
            Geri
          </Button>
          <CommentRow
            comment={focusedComment}
            isReply={false}
            canReply={isMember}
            onUpdated={saveCommentUpdate}
            onReplySubmitted={submitReply}
            onReport={id => openReportDialog('comment', id)}
            onAuthorClick={goToProfile}
            onOpenThread={openThread}
          />
          {currentThread?.repliesLoading ? (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <CommentRowSkeleton />
              <CommentRowSkeleton />
            </Stack>
          ) : currentThread?.replies.length > 0 ? (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {currentThread.replies.map(reply => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  isReply
                  canReply={isMember}
                  onUpdated={saveCommentUpdate}
                  onReplySubmitted={submitReply}
                  onReport={id => openReportDialog('comment', id)}
                  onAuthorClick={goToProfile}
                  onOpenThread={openThread}
                />
              ))}
              {currentThread && !currentThread.last && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={loadMoreThreadReplies}
                    disabled={currentThread.repliesLoadingMore}
                    sx={{ minWidth: 180, minHeight: 44 }}
                  >
                    {currentThread.repliesLoadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
                  </Button>
                </Box>
              )}
            </Stack>
          ) : null}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              Henüz yorum yok. İlk yorumu sen yap!
            </Typography>
          ) : (
            comments.map(c => (
              <CommentRow
                key={c.id}
                comment={c}
                isReply={false}
                canReply={isMember}
                onUpdated={saveCommentUpdate}
                onReplySubmitted={submitReply}
                onReport={id => openReportDialog('comment', id)}
                onAuthorClick={goToProfile}
                onOpenThread={openThread}
              />
            ))
          )}

          {!last && comments.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMoreComments}
                disabled={commentsLoadingMore}
                sx={{ minWidth: 180, minHeight: 44 }}
              >
                {commentsLoadingMore ? <CircularProgress size={18} /> : 'Daha Fazla Yükle'}
              </Button>
            </Box>
          )}
        </Stack>
      )}

      <ReportDialog
        open={reportTarget.open}
        onClose={closeReportDialog}
        onSubmit={submitReport}
        submitting={reportSubmitting}
      />
    </Box>
  )
}
