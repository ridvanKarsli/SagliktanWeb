import { useCallback, useEffect, useState } from 'react'
import {
  Alert, Avatar, Box, Button, CircularProgress, Divider, IconButton, Skeleton, Stack, TextField, Typography
} from '@mui/material'
import {
  ArrowBack, ChatBubbleOutlineRounded, CheckCircleRounded, DeleteOutline, EditOutlined, FlagOutlined, InfoOutlined, IosShareRounded, PushPinOutlined,
  PushPinRounded, SendOutlined
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
import SensitiveContentBanner from '../components/SensitiveContentBanner.jsx'
import PollView from '../components/PollView.jsx'
import PostTypeBadges from '../components/PostTypeBadges.jsx'
import ReadAloudButton from '../components/a11y/ReadAloudButton.jsx'
import DictationButton from '../components/a11y/DictationButton.jsx'
import { appendDictation } from '../utils/speech.js'
import EmptyState from '../components/EmptyState.jsx'
import {
  acceptAnswer, getMyDiseaseGroups, reactToPost, removePostReaction, reportComment, reportPost, savePost, unacceptAnswer, unsavePost
} from '../services/api.js'
import { initialsFrom, prettyDate } from '../utils/format.js'
import { canManage } from '../utils/permissions.js'
import { goToUserProfile } from '../utils/navigation.js'
import { clickableProps } from '../utils/clickable.js'
import { usePost } from '../hooks/usePost.js'
import { usePostComments, flattenThread } from '../hooks/usePostComments.js'

// Gönderi detay sayfası. Önceden 1000+ satırlık tek dosyaydı (post + yorum
// CRUD + thread-drill navigasyonu + rapor dialogu + CommentRow hepsi burada
// tanımlıydı) - bkz. clean-code audit. Artık:
//   - usePost(postId): gönderinin kendisi (yükle/düzenle/sil)
//   - usePostComments(postId): yorum ağacı + yerinde açılan yanıt blokları
//   - components/comments/{CommentRow,CommentRowSkeleton,ReportDialog}: UI parçaları
//   - utils/{permissions,navigation,format}: saf yardımcı fonksiyonlar
// Bu dosya artık sadece sayfa düzenini ve bu parçaların birbirine bağlanmasını taşıyor.
export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()

  const {
    post, setPost, loading, error,
    editingPost, setEditingPost, editTitle, setEditTitle, editContent, setEditContent,
    savingPost, deletingPost, togglingPin,
    startEditing, savePostEdit, removePost, togglePin
  } = usePost(postId)

  const {
    comments, commentsLoading, commentsLoadingMore, last, threads,
    newComment, setNewComment, postingComment,
    loadMoreComments, submitComment, submitReply, saveCommentUpdate,
    toggleThread, loadMoreReplies
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
      // Başarısız olursa "hiçbir gruba üye değil" varsayılır - yorum kutusu
      // güvenli tarafta kalıp gizlenir (backend zaten reddederdi), ayrı bir
      // hata toast'ı bu sayfanın asıl akışını (postu okumayı) bozardı.
      .catch(() => { if (mounted) setMyGroupIds(new Set()) })
    return () => { mounted = false }
  }, [token])

  // V24: soru sahibi en iyi cevabı seçer/kaldırır.
  const [acceptPending, setAcceptPending] = useState(false)
  const chooseAnswer = async (commentId) => {
    setAcceptPending(true)
    try {
      const updated = await acceptAnswer(token, post.id, commentId)
      setPost(p => ({ ...p, ...updated }))
      showSuccess('En iyi cevap seçildi. Yazan kişiye haber verdik.')
    } catch (err) {
      showError(err.message || 'En iyi cevap seçilemedi.')
    } finally {
      setAcceptPending(false)
    }
  }
  const clearAnswer = async () => {
    setAcceptPending(true)
    try {
      const updated = await unacceptAnswer(token, post.id)
      setPost(p => ({ ...p, ...updated }))
    } catch (err) {
      showError(err.message || 'Seçim kaldırılamadı.')
    } finally {
      setAcceptPending(false)
    }
  }

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
        <Stack spacing={1}>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
      </Box>
    )
  }

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

  const manageable = canManage(user, post.authorId)
  const isOwnPost = user?.id === post.authorId
  const edited = !!(post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt)
  // Üyelik henüz yükleniyorsa (myGroupIds === null) yorum kutusunu
  // gösterip sonra "yetkin yok" hatası almasın diye şimdilik gizli tutuyoruz.
  const isMember = myGroupIds != null && myGroupIds.has(post.diseaseGroupId)
  // Sadece soruyu soran, sadece soru gönderisinde en iyi cevap seçebilir.
  const canAcceptAnswers = isOwnPost && post.postType === 'QUESTION'

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(`/sub-groups/${post.subGroupId}`)} size="small" aria-label="Alt gruba dön">
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
          {/* Faz4: gradyan ring kaldırıldı - bkz. PostCard.jsx'teki aynı karar */}
          <Avatar
            {...clickableProps(() => goToProfile(post.authorId))}
            aria-label={`${post.authorName || 'Kullanıcı'} profiline git`}
            sx={{
              width: 48, height: 48, flexShrink: 0, cursor: 'pointer', fontWeight: 700,
              border: '2px solid', borderColor: 'primary.main'
            }}
          >
            {initialsFrom(post.authorName || '')}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              {...clickableProps(() => goToProfile(post.authorId))}
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
              {/* Faz6: sabitlenmiş gönderi - sadece gerçek sahip (admin dahil
                  değil, bkz. PostServiceImpl.pin javadoc'u: bu bir moderasyon
                  değil, kişisel profil kararı). */}
              {isOwnPost && (
                <IconButton
                  size="small"
                  onClick={togglePin}
                  disabled={togglingPin}
                  aria-label={post.pinned ? 'Sabitlemeyi kaldır' : 'Profile sabitle'}
                  title={post.pinned ? 'Sabitlemeyi kaldır' : 'Profile sabitle'}
                  sx={post.pinned ? { color: 'primary.main' } : undefined}
                >
                  {togglingPin
                    ? <CircularProgress size={16} />
                    : (post.pinned ? <PushPinRounded fontSize="small" /> : <PushPinOutlined fontSize="small" />)}
                </IconButton>
              )}
              {manageable && (
                <>
                  <IconButton size="small" onClick={startEditing} aria-label="Düzenle">
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removePost((deletedPost) => navigate(`/sub-groups/${deletedPost.subGroupId}`))}
                    disabled={deletingPost}
                    aria-label="Sil"
                  >
                    {deletingPost ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                  </IconButton>
                </>
              )}
              {!isOwnPost && (
                <IconButton size="small" onClick={() => openReportDialog('post', post.id)} title="Şikayet Et" aria-label="Şikayet Et">
                  <FlagOutlined fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )}
        </Stack>

        {post.pinned && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1, color: 'primary.main' }}>
            <PushPinRounded sx={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
              Profile sabitlendi
            </Typography>
          </Stack>
        )}

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
            <PostTypeBadges postType={post.postType} solved={post.acceptedCommentId != null} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, wordBreak: 'break-word' }}>
              {post.title}
            </Typography>
            <ReadAloudButton text={`${post.title}. ${post.content || ''}`} sx={{ ml: -1, mb: 0.5 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', wordBreak: 'break-word', color: 'text.primary', mb: post.attachments?.length ? 1.5 : 0 }}>
              {post.content}
            </Typography>
            {post.flaggedSensitive && <SensitiveContentBanner />}
            {post.postType === 'POLL' && (
              <PollView
                postId={post.id}
                poll={post.poll}
                isOwner={!!isOwnPost}
                onChange={(poll) => setPost(p => ({ ...p, poll }))}
                sx={{ mt: 1.5 }}
              />
            )}
            <PostGallery attachments={post.attachments} />
            {post.postType === 'QUESTION' && post.acceptedCommentId != null && (
              <Button
                size="small"
                color="success"
                startIcon={<CheckCircleRounded />}
                onClick={() => document.getElementById(`comment-${post.acceptedCommentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                sx={{ mt: 1, ml: -1, fontWeight: 700, minHeight: 36 }}
              >
                Çözüldü - en iyi cevaba git
              </Button>
            )}
            {post.postType === 'QUESTION' && post.acceptedCommentId == null && isOwnPost && post.commentCount > 0 && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                İşine yarayan cevabın altındaki <b>En iyi cevap</b> düğmesine dokun - hem yazana teşekkür etmiş olursun hem de soru çözüldü olarak işaretlenir.
              </Typography>
            )}
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
              <IconButton onClick={() => setShareCardOpen(true)} title="Hikaye olarak paylaş" aria-label="Hikaye olarak paylaş">
                <IosShareRounded fontSize="small" />
              </IconButton>
              <IconButton onClick={() => setSendDialogOpen(true)} title="Mesajla gönder" aria-label="Mesajla gönder">
                <SendOutlined fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </>
      )}
      </Box>

      <ShareStoryCardDialog open={shareCardOpen} onClose={() => setShareCardOpen(false)} post={post} />
      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />

      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Yorumlar
      </Typography>

      {myGroupIds != null && !isMember ? (
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
        <Box component="form" onSubmit={submitComment} sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}>
              {initialsFrom(`${user?.firstName || ''} ${user?.lastName || ''}`)}
            </Avatar>
            <TextField
              placeholder="Deneyimini ya da sorunu yaz…"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              multiline
              minRows={1}
              maxRows={6}
              fullWidth
              size="small"
              disabled={!isMember}
              inputProps={{ maxLength: 3000, 'aria-label': 'Yorum' }}
            />
            <DictationButton
              label="Yorumu sesle yaz"
              disabled={!isMember || postingComment}
              onText={(piece) => setNewComment(c => appendDictation(c, piece).slice(0, 3000))}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={postingComment || !isMember || !newComment.trim()}
              aria-label="Yorumu gönder"
              sx={{ flexShrink: 0, mb: 0.25, width: 44, height: 44 }}
            >
              {postingComment ? <CircularProgress size={20} /> : <SendOutlined />}
            </IconButton>
          </Stack>
        </Box>
      )}

      {commentsLoading ? (
        <Stack>
          <CommentRowSkeleton />
          <CommentRowSkeleton />
          <CommentRowSkeleton />
        </Stack>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={ChatBubbleOutlineRounded}
          title="Henüz yorum yok"
          description={isMember ? 'İlk yorumu sen yaz; deneyimin başka birine yol gösterebilir.' : 'Gruba katılınca ilk yorumu sen yazabilirsin.'}
          dense
        />
      ) : (
        <Box>
          {comments.map(c => {
            const items = flattenThread(c, threads)
            return (
              <Box key={c.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
                <CommentRow
                  comment={c}
                  accepted={post.acceptedCommentId === c.id}
                  canAccept={canAcceptAnswers}
                  onAccept={chooseAnswer}
                  onUnaccept={clearAnswer}
                  acceptPending={acceptPending}
                  canReply={isMember}
                  thread={threads[c.id]}
                  onUpdated={saveCommentUpdate}
                  onReplySubmitted={submitReply}
                  onReport={id => openReportDialog('comment', id)}
                  onAuthorClick={goToProfile}
                  onToggleThread={toggleThread}
                />
                {items.length > 0 && (
                  // Yanıt bloğu: TEK girinti (kök avatarının altından başlayan
                  // ince bir bağlantı çizgisi) - içindeki tüm yanıtlar, derinliği
                  // ne olursa olsun aynı hizada. İç içe geçme yok.
                  <Box
                    sx={{
                      ml: { xs: '18px', sm: '18px' },
                      pl: { xs: 2, sm: 3.25 },
                      borderLeft: '2px solid',
                      borderColor: 'divider',
                      mb: 1
                    }}
                  >
                    {items.map(item => {
                      if (item.kind === 'loading') {
                        return <Box key={item.key}><CommentRowSkeleton compact /></Box>
                      }
                      if (item.kind === 'more') {
                        return (
                          <Button
                            key={item.key}
                            size="small"
                            onClick={() => loadMoreReplies(item.parent)}
                            disabled={item.loadingMore}
                            sx={{ color: 'text.secondary', fontWeight: 600, my: 0.5, minHeight: 36 }}
                          >
                            {item.loadingMore ? <CircularProgress size={14} /> : 'Daha fazla yanıt'}
                          </Button>
                        )
                      }
                      return (
                        <CommentRow
                          key={item.key}
                          comment={item.comment}
                          accepted={post.acceptedCommentId === item.comment.id}
                          canAccept={canAcceptAnswers}
                          onAccept={chooseAnswer}
                          onUnaccept={clearAnswer}
                          acceptPending={acceptPending}
                          isReply
                          replyingTo={item.replyingTo}
                          canReply={isMember}
                          thread={threads[item.comment.id]}
                          onUpdated={saveCommentUpdate}
                          onReplySubmitted={submitReply}
                          onReport={id => openReportDialog('comment', id)}
                          onAuthorClick={goToProfile}
                          onToggleThread={toggleThread}
                        />
                      )
                    })}
                  </Box>
                )}
              </Box>
            )
          })}

          {!last && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMoreComments}
                disabled={commentsLoadingMore}
                sx={{ minWidth: 180, minHeight: 44 }}
              >
                {commentsLoadingMore ? <CircularProgress size={18} /> : 'Daha fazla yorum'}
              </Button>
            </Box>
          )}
        </Box>
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
