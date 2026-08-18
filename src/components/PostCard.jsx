import { useState } from 'react'
import { Avatar, Box, Chip, IconButton, Stack, Typography } from '@mui/material'
import { GroupsRounded, SendOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ReactionButtons from './ReactionButtons.jsx'
import SaveButton from './SaveButton.jsx'
import HighlightText from './HighlightText.jsx'
import PostGallery from './PostGallery.jsx'
import SendPostDialog from './SendPostDialog.jsx'
import SensitiveContentBanner from './SensitiveContentBanner.jsx'
import { reactToPost, removePostReaction, savePost, unsavePost } from '../services/api.js'
import { initialsFrom } from '../utils/format.js'

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
export default function PostCard({ post, onClick, token, highlightQuery }) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const navigate = useNavigate()
  if (!post) return null
  const {
    id, subGroupId, subGroupName, diseaseGroupName, authorName, title, content, createdAt, updatedAt,
    helpfulCount, notHelpfulCount, myReaction, saved, savedCount, attachments, flaggedSensitive
  } = post

  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : ''
  const edited = !!(updatedAt && createdAt && updatedAt !== createdAt)

  return (
    <Box
      onClick={onClick}
      className={onClick ? 'tap-scale' : undefined}
      sx={{
        py: { xs: 2, md: 2.25 },
        cursor: onClick ? 'pointer' : 'default',
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
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
            {authorName || 'Kullanıcı'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dateLabel}{edited ? ' · düzenlendi' : ''}
          </Typography>
        </Box>
        {/* Ana sayfa karışık akışında (bkz. Home.jsx) subGroupName dolu
            geliyor - hangi gruptan geldiği belli olmazsa, birbirinden çok
            farklı hastalık gruplarının içerikleri karışınca kafa karıştırır.
            Posts.jsx gibi tek-alt-grup bağlamlarında backend bu alanı hiç
            doldurmuyor (bkz. PostResponseAssembler.assemble vs assembleFeed),
            o yüzden orada rozet hiç render olmuyor. */}
        {subGroupName && (
          <Chip
            size="small"
            icon={<GroupsRounded sx={{ fontSize: '14px !important' }} />}
            label={diseaseGroupName ? `${diseaseGroupName} · ${subGroupName}` : subGroupName}
            onClick={(e) => { e.stopPropagation(); navigate(`/sub-groups/${subGroupId}`) }}
            sx={{
              flexShrink: 0, maxWidth: 180, color: 'text.secondary',
              bgcolor: 'action.hover', fontWeight: 500,
              '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' }
            }}
          />
        )}
      </Stack>

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

      <PostGallery attachments={attachments} />

      {token && (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <ReactionButtons
            helpfulCount={helpfulCount}
            notHelpfulCount={notHelpfulCount}
            myReaction={myReaction}
            onReact={(value) => reactToPost(token, id, value)}
            onRemove={() => removePostReaction(token, id)}
          />
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
          </Stack>
        </Stack>
      )}

      <SendPostDialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} post={post} />
    </Box>
  )
}
