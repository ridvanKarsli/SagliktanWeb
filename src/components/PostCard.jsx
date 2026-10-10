import { memo } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { ChatBubbleOutlineRounded, FlagOutlined, PushPinRounded, SendOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ReactionButtons from './ReactionButtons.jsx'
import SaveButton from './SaveButton.jsx'
import HighlightText from './HighlightText.jsx'
import PostGallery from './PostGallery.jsx'
import SensitiveContentBanner from './SensitiveContentBanner.jsx'
import PollView from './PollView.jsx'
import PostTypeBadges from './PostTypeBadges.jsx'
import UserAvatar from './avatars/UserAvatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { reactToPost, removePostReaction, savePost, unsavePost } from '../services/api.js'
import { relativeTime } from '../utils/format.js'
import { cardActivationProps } from '../utils/clickable.js'
import { truncate } from '../utils/text.js'
import { focusRingSx } from '../design/focus.js'

const PREVIEW_LENGTH = 180

/**
 * Akış kartı: nane zemin üstünde yumuşak, beyaz bir "çakıl taşı". Hiyerarşi
 * yukarıdan aşağı: yazar → tür rozeti → başlık → metin → eylemler. Soru gök
 * mavisi, anket leylak, çözülmüş soru yeşil rozetle (ikon + metin) ayrılır.
 *
 * onOpen(id) verilirse kart detay sayfasını açar. "Mesajla gönder" ve
 * "Şikayet et" dialogları kartın İÇİNDE değil: 20 kartlık bir akışta her
 * kartın kendi Dialog ağacını (kapalı da olsa) taşıması gereksizdi; liste
 * (PostList) tek bir SendPostDialog + ReportDialog tutar, kart yalnızca
 * onSend(post) / onReport(id) ile hangi gönderi için açılacağını söyler.
 *
 * memo: akışta tek bir kartın reaksiyonu değişince ya da üst bileşen başka
 * bir sebeple yeniden render olunca diğer kartlar yeniden çizilmesin. Bunun
 * işe yaraması için PostList'in verdiği callback'lerin sabit (useCallback)
 * olması gerekir.
 */
function PostCard({ post, onOpen, onSend, onReport, token, highlightQuery, showPinnedBadge = false }) {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  if (!post) return null
  const {
    id, subGroupId, subGroupName, diseaseGroupName, authorId, authorName, authorAvatarKey, title, content, createdAt, updatedAt,
    helpfulCount, notHelpfulCount, myReaction, saved, savedCount, attachments, flaggedSensitive, pinned,
    postType, acceptedCommentId, commentCount, poll
  } = post

  const dateLabel = relativeTime(createdAt)
  const edited = !!(updatedAt && createdAt && updatedAt !== createdAt)
  const isOwnPost = currentUser && String(currentUser.id) === String(authorId)
  const ariaLabel = title ? `Gönderi: ${title}` : undefined
  const onClick = onOpen ? () => onOpen(id) : undefined

  return (
    <Box
      {...(onClick ? cardActivationProps(onClick, ariaLabel) : { role: 'article', 'aria-label': ariaLabel })}
      className={onClick ? 'tap-scale' : undefined}
      sx={{
        p: { xs: 2, sm: 2.5 },
        pb: token ? { xs: 1, sm: 1.25 } : undefined,
        borderRadius: { xs: '20px', sm: '22px' },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'brand.border',
        boxShadow: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:focus-visible': focusRingSx,
        transition: 'box-shadow 240ms ease, border-color 240ms ease, transform 160ms var(--ease-spring)',
        // CSS containment: her kart kendi içinde bağımsız bir layout/paint
        // birimi; uzun akışlarda tarayıcı ekran dışındaki kartların iç
        // hesaplarını atlayabilir (mobil kaydırma performansı). Dialoglar
        // portal olduğu için etkilenmez.
        contain: 'content',
        '@media (hover: hover)': onClick ? { '&:hover': { boxShadow: 3, borderColor: 'brand.borderStrong' } } : undefined
      }}
    >
      {/* "Sabitlendi" etiketi yalnızca profil listelerinde anlamlı; genel
          akışta bağlamsızdır. */}
      {showPinnedBadge && pinned && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1, color: 'text.secondary' }}>
          <PushPinRounded sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
            Sabitlenmiş gönderi
          </Typography>
        </Stack>
      )}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <UserAvatar avatarKey={authorAvatarKey} name={authorName || ''} size={44} sx={{ flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
              {authorName || 'Kullanıcı'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
              {dateLabel ? `· ${dateLabel}` : ''}{edited ? ' · düzenlendi' : ''}
            </Typography>
          </Stack>
          {/* Grup bağlamı: karışık akışta (ana sayfa) dolu gelir; tek alt
              grup sayfasında backend bu alanı doldurmaz. */}
          {subGroupName && (
            <Typography
              variant="caption"
              component="button"
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/sub-groups/${subGroupId}`) }}
              sx={{
                display: 'block', maxWidth: '100%', p: 0, border: 'none', bgcolor: 'transparent',
                font: 'inherit', fontSize: '0.8125rem', textAlign: 'left', cursor: 'pointer',
                color: 'primary.main', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                py: 0.25, '&:hover': { textDecoration: 'underline' },
                '&:focus-visible': { ...focusRingSx, borderRadius: '6px' }
              }}
            >
              {diseaseGroupName ? `${diseaseGroupName} › ${subGroupName}` : subGroupName}
            </Typography>
          )}
        </Box>
      </Stack>

      <PostTypeBadges postType={postType} solved={acceptedCommentId != null} />

      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontFamily: (t) => t.typography.h5.fontFamily, fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.3rem' },
          color: 'text.primary', mb: 0.5, wordBreak: 'break-word', lineHeight: 1.3
        }}
      >
        {highlightQuery ? <HighlightText text={title} query={highlightQuery} /> : title}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', whiteSpace: 'pre-line', wordBreak: 'break-word', mb: token ? 1.5 : 0 }}
      >
        {highlightQuery
          ? <HighlightText text={truncate(content, PREVIEW_LENGTH)} query={highlightQuery} />
          : truncate(content, PREVIEW_LENGTH)}
      </Typography>

      {flaggedSensitive && <SensitiveContentBanner sx={{ mt: 0.5 }} />}

      {postType === 'POLL' && token && <PollView postId={id} poll={poll} isOwner={!!isOwnPost} />}

      <PostGallery attachments={attachments} />

      {token && (
        <Stack
          direction="row" alignItems="center" justifyContent="space-between"
          sx={{ mx: -1, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
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
                onClick={(e) => { e.stopPropagation(); onClick() }}
                aria-label={`${commentCount || 0} yorum`}
                startIcon={<ChatBubbleOutlineRounded sx={{ fontSize: '19px !important' }} />}
                sx={{
                  minWidth: 44, minHeight: 44, px: 1.25, borderRadius: 999, color: 'text.secondary',
                  fontWeight: 800, fontSize: '0.875rem',
                  '& .MuiButton-startIcon': { mr: commentCount ? 0.625 : 0, ml: 0 }
                }}
              >
                {commentCount ? commentCount : ''}
              </Button>
            )}
          </Stack>
          {/* IG'deki yer bloğuna sadık: yıldızlama (bookmark) + gönder sağ tarafta. */}
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <SaveButton
              saved={!!saved}
              count={savedCount}
              onSave={() => savePost(token, id)}
              onUnsave={() => unsavePost(token, id)}
            />
            {onSend && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); onSend(post) }}
                aria-label="Mesajla gönder"
                title="Mesajla gönder"
                sx={{ width: 44, height: 44 }}
              >
                <SendOutlined fontSize="small" />
              </IconButton>
            )}
            {!isOwnPost && onReport && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); onReport(id) }}
                aria-label="Şikayet et"
                title="Şikayet et"
                sx={{ width: 44, height: 44 }}
              >
                <FlagOutlined fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>
      )}
    </Box>
  )
}

export default memo(PostCard)
