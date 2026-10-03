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
import { useReportDialog } from '../hooks/useReportDialog.js'
import { reactToPost, removePostReaction, reportPost, savePost, unsavePost } from '../services/api.js'
import { initialsFrom, parseServerDate } from '../utils/format.js'
import { cardActivationProps } from '../utils/clickable.js'
import { truncate } from '../utils/text.js'

const PREVIEW_LENGTH = 180

/**
 * Akış kartı: kenarlıksız, listede ince bölücülerle ayrılan gönderi öğesi
 * (bkz. PostList). onClick verilirse kart detay sayfasını açar.
 */
export default function PostCard({ post, onClick, token, highlightQuery, showPinnedBadge = false }) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const report = useReportDialog((postId, reason) => reportPost(token, postId, reason))
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
  const ariaLabel = title ? `Gönderi: ${title}` : undefined

  return (
    <>
      <Box
        {...(onClick ? cardActivationProps(onClick, ariaLabel) : { role: 'article', 'aria-label': ariaLabel })}
        className={onClick ? 'tap-scale' : undefined}
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
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
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
            ? <HighlightText text={truncate(content, PREVIEW_LENGTH)} query={highlightQuery} />
            : truncate(content, PREVIEW_LENGTH)}
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
              {!isOwnPost && (
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); report.open(id) }}
                  aria-label="Şikayet et"
                  title="Şikayet et"
                >
                  <FlagOutlined fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        )}
      </Box>

      {/* Dialoglar kartın DIŞINDA: portal olsalar da React olayları bileşen
          ağacında kabarcıklandığı için kartın içindeyken dialogdaki her
          tıklama kartın onClick'ini tetikleyip detay sayfasına gidiyordu. */}
      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />
      <ReportDialog {...report.dialogProps} />
    </>
  )
}
