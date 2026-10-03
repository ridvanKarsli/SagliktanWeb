import { useState } from 'react'
import { Avatar, Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, FlagOutlined, PushPinRounded, SendOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ReactionButtons from './ReactionButtons.jsx'
import SaveButton from './SaveButton.jsx'
import HighlightText from './HighlightText.jsx'
import PostGallery from './PostGallery.jsx'
import SendPostDialog from './SendPostDialog.jsx'
import SensitiveContentBanner from './SensitiveContentBanner.jsx'
import PollView from './PollView.jsx'
import PostTypeBadges from './PostTypeBadges.jsx'
import ReportDialog from './comments/ReportDialog.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { reactToPost, removePostReaction, reportPost, savePost, unsavePost } from '../services/api.js'
import { initialsFrom, parseServerDate } from '../utils/format.js'

function truncate(text = '', max = 180) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

/**
 * Feed kartı - Instagram'ın gönderi öğesi deseninden ilham alınarak yeniden
 * kuruldu: ağır kart kenarlığı/gölge yerine borderless, sadece alt ince bir
 * bölücüyle ayrılan akış öğesi (bkz. Posts.jsx - kartlar artık `Divider`
 * ile ayrılıyor, kendi border'ı yok). Avatar'da IG'nin "story ring"
 * dilinden esinlenen ama markaya özgü sıcak gradyan bir halka var. Veri
 * sözleşmesi değişmedi - sadece görsel/yapısal düzen.
 */
export default function PostCard({ post, onClick, token, highlightQuery, showPinnedBadge = false }) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { showError, showSuccess } = useNotification()
  if (!post) return null
  const {
    id, subGroupId, subGroupName, diseaseGroupName, authorId, authorName, title, content, createdAt, updatedAt,
    helpfulCount, notHelpfulCount, myReaction, saved, savedCount, attachments, flaggedSensitive, pinned,
    postType, acceptedCommentId, commentCount, poll
  } = post

  const dateLabel = createdAt
    ? parseServerDate(createdAt)?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : ''
  const edited = !!(updatedAt && createdAt && updatedAt !== createdAt)
  const isOwnPost = currentUser && String(currentUser.id) === String(authorId)

  const submitReport = async (reason) => {
    setReportSubmitting(true)
    try {
      await reportPost(token, id, reason)
      showSuccess('Şikayetiniz alındı, teşekkür ederiz.')
      setReportOpen(false)
    } catch (err) {
      showError(err.message || 'Şikayet gönderilemedi.')
    } finally {
      setReportSubmitting(false)
    }
  }

  return (
    <Box
      onClick={onClick}
      className={onClick ? 'tap-scale' : undefined}
      // Klavye erişimi: kartın kökü role="button" YAPILMIYOR (içinde gerçek
      // butonlar var - iç içe interaktif öğe ekran okuyucuyu bozar). Bunun
      // yerine odaklanabilir bir makale: Tab ile karta gelinip Enter/Space
      // ile açılır; tuş olayı yalnızca kartın kendisinden geldiğinde
      // (içerideki buton/linkten değil) işlenir.
      role="article"
      tabIndex={onClick ? 0 : undefined}
      aria-label={title ? `Gönderi: ${title}` : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) }
      } : undefined}
      sx={{
        py: { xs: 2, md: 2.25 },
        cursor: onClick ? 'pointer' : 'default',
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2, borderRadius: 1 },
        transition: 'background-color 0.15s ease',
        // CSS containment: her kart kendi içinde bağımsız bir layout/paint
        // birimi olduğunu tarayıcıya bildiriyor (dialoglar Portal ile
        // document.body'ye render olduğu için bundan etkilenmiyor). Uzun
        // feed'lerde (Posts.jsx) tarayıcı görünür alan dışındaki kartların
        // iç hesaplamalarını atlayabiliyor - mobilde scroll performansı için
        // büyük ölçekli feed uygulamalarının kullandığı standart bir teknik.
        contain: 'content',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined
      }}
    >
      {/* Faz6: sabitlenmiş gönderi - sadece profilin "Gönderiler" sekmesinde
          gösterilen kartlarda anlamlı (bkz. Profile.jsx/UserProfile.jsx'te
          showPinnedBadge geçilen tek yer) - genel akışta (Home/Posts/arama)
          "sabitlendi" etiketi bağlamsız/kafa karıştırıcı olurdu, X de aynı
          ayrımı yapıyor. */}
      {showPinnedBadge && pinned && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1, color: 'text.secondary' }}>
          <PushPinRounded sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
            Sabitlenmiş gönderi
          </Typography>
        </Stack>
      )}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
        {/* Faz4: gradyan "story ring" kaldırıldı - düz marka rengi ince bir
            çerçeveye indirgendi. Akışta onlarca kart art arda göründüğünde
            her birinin kendi gradyanı görsel gürültü yaratıyordu; sabit tek
            renk daha sakin ve X'in nötr avatar diline daha yakın. */}
        <Avatar
          sx={{
            width: 44, height: 44, fontSize: 15, fontWeight: 700, flexShrink: 0,
            border: '2px solid', borderColor: 'primary.main'
          }}
        >
          {initialsFrom(authorName || '')}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
              {authorName || 'Kullanıcı'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
              · {dateLabel}{edited ? ' · düzenlendi' : ''}
            </Typography>
          </Stack>
          {/* Grup bağlamı ikinci satırda, metin olarak: önceden sağda sıkışan
              bir chip'ti ve "Retinitis Pigmentosa · …" diye kırpılıyordu.
              Ana sayfa karışık akışında (bkz. Home.jsx) subGroupName dolu
              gelir; tek-alt-grup bağlamlarında (Posts.jsx) backend bu alanı
              doldurmaz, satır hiç render olmaz. */}
          {subGroupName && (
            <Typography
              variant="caption"
              component="button"
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/sub-groups/${subGroupId}`) }}
              sx={{
                display: 'block', maxWidth: '100%', p: 0, border: 'none', bgcolor: 'transparent',
                font: 'inherit', fontSize: '0.8125rem', textAlign: 'left', cursor: 'pointer',
                color: 'primary.main', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                '&:hover': { textDecoration: 'underline' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: 1 }
              }}
            >
              {diseaseGroupName ? `${diseaseGroupName} › ${subGroupName}` : subGroupName}
            </Typography>
          )}
        </Box>
      </Stack>

      <PostTypeBadges postType={postType} solved={acceptedCommentId != null} />

      {/* Okunabilirlik: başlık ve gövde metni, akışta göz yormadan
          okunabilsin diye belirgin biçimde büyük. Gövde artık ikincil gri
          değil ana metin renginde - akışta okunacak asıl içerik bu, ikincil
          bir detay değil. */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, wordBreak: 'break-word', lineHeight: 1.4 }}
      >
        {highlightQuery ? <HighlightText text={title} query={highlightQuery} /> : title}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word', mb: token ? 1.5 : 0 }}
      >
        {highlightQuery
          ? <HighlightText text={truncate(content, 180)} query={highlightQuery} />
          : truncate(content, 180)}
      </Typography>

      {flaggedSensitive && <SensitiveContentBanner sx={{ mt: 0.5 }} />}

      {postType === 'POLL' && token && <PollView postId={id} poll={poll} isOwner={!!isOwnPost} />}

      <PostGallery attachments={attachments} />

      {token && (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
            <ReactionButtons
              helpfulCount={helpfulCount}
              notHelpfulCount={notHelpfulCount}
              myReaction={myReaction}
              onReact={(value) => reactToPost(token, id, value)}
              onRemove={() => removePostReaction(token, id)}
            />
            {/* Yorum sayısı: sorularda "kaç cevap var" en önemli sinyal. */}
            {onClick && (
              <Button
                size="small"
                onClick={(e) => { e.stopPropagation(); onClick(e) }}
                aria-label={`${commentCount || 0} yorum`}
                startIcon={<ChatBubbleOutlineRounded sx={{ fontSize: '18px !important' }} />}
                sx={{
                  minWidth: 0, minHeight: 36, px: 1, borderRadius: 999, color: 'text.secondary',
                  fontWeight: 700, fontSize: '0.8125rem', '& .MuiButton-startIcon': { mr: commentCount ? 0.5 : 0 }
                }}
              >
                {commentCount ? commentCount : ''}
              </Button>
            )}
          </Stack>
          {/* IG'deki yer bloğuna sadık: yıldızlama (bookmark) + gönder sağ tarafta. */}
          <Stack direction="row" alignItems="center">
            <SaveButton
              saved={!!saved}
              count={savedCount}
              onSave={() => savePost(token, id)}
              onUnsave={() => unsavePost(token, id)}
            />
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setSendDialogOpen(true) }}
              aria-label="Mesajla gönder"
              title="Mesajla gönder"
            >
              <SendOutlined fontSize="small" />
            </IconButton>
            {/* Faz7-10: önceden şikayet sadece PostDetail'de mümkündü - akıştan
                (Home/Posts/profil) bir gönderiyi görüp anında şikayet etmek
                için detay sayfasını açmak gerekiyordu. */}
            {!isOwnPost && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setReportOpen(true) }}
                aria-label="Şikayet et"
                title="Şikayet et"
              >
                <FlagOutlined fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>
      )}

      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={submitReport}
        submitting={reportSubmitting}
      />
    </Box>
  )
}
