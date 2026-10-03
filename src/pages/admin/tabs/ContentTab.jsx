import { useState } from 'react'
import { Box, Button, Chip, CircularProgress, FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { DeleteOutline, ForumOutlined, OpenInNewRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import { deleteComment, deletePost, listAdminComments, listAdminPosts } from '../../../services/api.js'
import { relativeTime } from '../../../utils/format.js'
import { usePaginatedList } from '../../../hooks/usePaginatedList.js'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js'
import { AdminCard, AdminEmpty, AdminList, AdminLoading, AdminSearch, LoadMoreButton, SegmentedFilter } from '../AdminUi.jsx'

function AttachmentThumbnails({ attachments }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  if (!attachments || attachments.length === 0) return null
  return (
    <>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        {attachments.map((a, i) => (
          <Box
            key={a.id}
            component="button"
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Fotoğraf ${i + 1}`}
            className="tap-scale"
            sx={{ p: 0, border: 'none', display: 'block', width: 64, height: 64, borderRadius: 2, overflow: 'hidden', flexShrink: 0, cursor: 'zoom-in', bgcolor: 'action.hover' }}
          >
            <Box component="img" src={a.url} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Box>
        ))}
      </Stack>
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={attachments.map(a => ({ src: a.url }))}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 4, doubleTapDelay: 300, doubleClickDelay: 300, scrollToZoom: true }}
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        styles={{ container: { backgroundColor: 'rgba(20, 17, 14, 0.94)' } }}
      />
    </>
  )
}

function ContentCard({ item, type, deletingId, remove }) {
  const navigate = useNavigate()
  const isPost = type === 'posts'
  const removed = !isPost && item.deleted
  const href = isPost ? `/post/${item.id}` : (item.postId ? `/post/${item.postId}` : null)
  return (
    <AdminCard sx={{ opacity: removed ? 0.6 : 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{item.authorName}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>· {relativeTime(item.createdAt)}</Typography>
        <Box sx={{ flex: 1 }} />
        {removed && <Chip size="small" label="Silinmiş" />}
      </Stack>
      {isPost && (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {item.title}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-word', overflowWrap: 'anywhere', color: isPost ? 'text.secondary' : 'text.primary',
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}
      >
        {item.content}
      </Typography>
      {isPost && <AttachmentThumbnails attachments={item.attachments} />}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
        {href && (
          <Button size="small" endIcon={<OpenInNewRounded sx={{ fontSize: 16 }} />} onClick={() => navigate(href)} sx={{ minHeight: 36, color: 'text.secondary' }}>
            Aç
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {!removed && (
          <Button
            size="small" color="error" startIcon={deletingId === item.id ? <CircularProgress size={14} color="inherit" /> : <DeleteOutline />}
            disabled={deletingId === item.id} onClick={() => remove(item)} sx={{ minHeight: 36 }}
          >
            Sil
          </Button>
        )}
      </Stack>
    </AdminCard>
  )
}

export default function ContentTab({ token }) {
  const [type, setType] = useState('posts') // 'posts' | 'comments'
  const [q, setQ] = useState('')
  const debouncedQ = useDebouncedValue(q.trim(), 300)
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const {
    items, loading, loadingMore, last, totalCount, loadMore, reload: load,
  } = usePaginatedList(
    (pageNum) => (type === 'posts'
      ? listAdminPosts(token, { q: debouncedQ || undefined, hasPhotos: onlyWithPhotos || undefined, page: pageNum, size: 30 })
      : listAdminComments(token, { q: debouncedQ || undefined, page: pageNum, size: 30 })),
    { deps: [token, type, debouncedQ, onlyWithPhotos], onError: (err) => showError(err.message || 'İçerik alınamadı.') }
  )

  const remove = async (item) => {
    const label = type === 'posts' ? 'gönderiyi' : 'yorumu'
    const ok = await confirm(`Bu ${label} kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.`, { title: 'İçeriği sil' })
    if (!ok) return
    setDeletingId(item.id)
    try {
      if (type === 'posts') await deletePost(token, item.id)
      else await deleteComment(token, item.id)
      showSuccess('Silindi.')
      load()
    } catch (err) {
      showError(err.message || 'Silinemedi.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack spacing={2}>
      <AdminSearch value={q} onChange={setQ} placeholder="İçerikte ara..." />
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <SegmentedFilter
          ariaLabel="İçerik türü"
          value={type}
          onChange={setType}
          options={[{ value: 'posts', label: 'Gönderiler' }, { value: 'comments', label: 'Yorumlar' }]}
        />
        {type === 'posts' && (
          <FormControlLabel
            sx={{ ml: 'auto', mr: 0 }}
            control={<Switch size="small" checked={onlyWithPhotos} onChange={e => setOnlyWithPhotos(e.target.checked)} />}
            label={<Typography variant="body2">Sadece fotoğraflı</Typography>}
          />
        )}
      </Stack>

      {loading ? <AdminLoading /> : items.length === 0 ? (
        <AdminEmpty icon={ForumOutlined} title="İçerik bulunamadı" description={debouncedQ ? 'Aramayı değiştirip tekrar dene.' : undefined} />
      ) : (
        <AdminList>
          {items.map(item => <ContentCard key={item.id} item={item} type={type} deletingId={deletingId} remove={remove} />)}
        </AdminList>
      )}

      {!loading && !last && <LoadMoreButton loading={loadingMore} shown={items.length} total={totalCount} onClick={loadMore} noun="içerik" />}
    </Stack>
  )
}
