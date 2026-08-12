import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Chip, CircularProgress, FormControlLabel, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup,
  Typography, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { useNotification } from '../../../context/NotificationContext.jsx'
import { useConfirm } from '../../../context/ConfirmContext.jsx'
import { deleteComment, deletePost, listAdminComments, listAdminPosts } from '../../../services/api.js'
import { prettyDate } from '../../../utils/format.js'

// AdminPanel.jsx'ten ayrı bir dosyaya taşındı (bkz. clean-code audit).

// Fotoğraf küçük resimleri (admin'in içeriği tıklamadan/indirmeden hızlıca
// göz atıp tehlikeli/uygunsuz olanı fark edebilmesi için) - hem masaüstü
// tablosunda hem mobil kartta kullanılıyor, tekrarı önlemek adına ayrı bileşen.
// Önceden yeni sekmede ham dosyayı açıyordu (<a target="_blank">) - siteki
// diğer görsellerle (bkz. PostGallery.jsx) tutarlı olsun diye artık aynı
// yet-another-react-lightbox ile tıklayınca büyütülüyor/yakınlaştırılıyor.
function AttachmentThumbnails({ attachments }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  if (!attachments || attachments.length === 0) return null
  return (
    <>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5, mb: 0.5 }}>
        {attachments.map((a, i) => (
          <Box
            key={a.id}
            onClick={() => setLightboxIndex(i)}
            className="tap-scale"
            sx={{ display: 'block', width: 56, height: 56, borderRadius: 1, overflow: 'hidden', flexShrink: 0, cursor: 'zoom-in' }}
          >
            <Box
              component="img"
              src={a.url}
              alt=""
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        ))}
      </Stack>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={attachments.map(a => ({ src: a.url }))}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          scrollToZoom: true
        }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(20, 17, 14, 0.94)' } }}
      />
    </>
  )
}

function ContentCard({ item, type, deletingId, remove }) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      {type === 'posts' && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>{item.title}</Typography>
      )}
      <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word', color: type === 'posts' ? 'text.secondary' : 'text.primary' }}>
        {item.content}
      </Typography>
      {type === 'posts' && <AttachmentThumbnails attachments={item.attachments} />}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.authorName}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {prettyDate(item.createdAt) || ''}
          </Typography>
          {type === 'comments' && (
            <Chip size="small" label={item.deleted ? 'Silinmiş' : 'Aktif'} color={item.deleted ? 'default' : 'success'} />
          )}
        </Stack>
        {!(type === 'comments' && item.deleted) && (
          <Button size="small" color="error" disabled={deletingId === item.id} onClick={() => remove(item)}>
            Sil
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default function ContentTab({ token }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [type, setType] = useState('posts') // 'posts' | 'comments'
  const [q, setQ] = useState('')
  // Tehlikeli/uygunsuz görsel içerik denetimi: sadece fotoğraflı gönderileri
  // filtreleme - sadece 'posts' tipinde anlamlı, yorumların fotoğrafı yok.
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const { showError, showSuccess } = useNotification()
  const confirm = useConfirm()

  const load = useCallback(() => {
    setLoading(true)
    if (type === 'posts') {
      listAdminPosts(token, { q: q || undefined, hasPhotos: onlyWithPhotos || undefined, size: 50 })
        .then(res => setItems(Array.isArray(res?.content) ? res.content : []))
        .catch(err => showError(err.message || 'İçerik alınamadı.'))
        .finally(() => setLoading(false))
      return
    }
    listAdminComments(token, { q: q || undefined, size: 50 })
      .then(res => setItems(Array.isArray(res?.content) ? res.content : []))
      .catch(err => showError(err.message || 'İçerik alınamadı.'))
      .finally(() => setLoading(false))
  }, [token, type, q, onlyWithPhotos, showError])

  useEffect(() => { load() }, [load])

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
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup size="small" value={type} exclusive onChange={(_, v) => v && setType(v)}>
          <ToggleButton value="posts">Gönderiler</ToggleButton>
          <ToggleButton value="comments">Yorumlar</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small" placeholder="İçerikte ara..." value={q}
          onChange={e => setQ(e.target.value)}
          sx={{ width: 280 }}
        />
        {type === 'posts' && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={onlyWithPhotos}
                onChange={e => setOnlyWithPhotos(e.target.checked)}
              />
            }
            label="Sadece fotoğraflı"
          />
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={22} /></Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {items.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Kayıt yok.</Typography>
          )}
          {items.map(item => (
            <ContentCard key={item.id} item={item} type={type} deletingId={deletingId} remove={remove} />
          ))}
        </Stack>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
          {/* ReportsTab.jsx ile aynı fix: minWidth olmadan tablo dar
              viewport'ta İçerik sütununu okunmaz şekilde sıkıştırıyordu. */}
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {type === 'posts' && <TableCell>Başlık</TableCell>}
                <TableCell>İçerik</TableCell>
                <TableCell>Yazar</TableCell>
                {type === 'comments' && <TableCell>Durum</TableCell>}
                <TableCell>Tarih</TableCell>
                <TableCell align="right">Aksiyon</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">Kayıt yok.</TableCell></TableRow>
              )}
              {items.map(item => (
                <TableRow key={item.id}>
                  {type === 'posts' && (
                    <TableCell sx={{ maxWidth: 160, whiteSpace: 'normal', wordBreak: 'break-word' }}>{item.title}</TableCell>
                  )}
                  <TableCell sx={{ maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {item.content}
                    {type === 'posts' && <AttachmentThumbnails attachments={item.attachments} />}
                  </TableCell>
                  <TableCell>{item.authorName}</TableCell>
                  {type === 'comments' && (
                    <TableCell>
                      <Chip size="small" label={item.deleted ? 'Silinmiş' : 'Aktif'} color={item.deleted ? 'default' : 'success'} />
                    </TableCell>
                  )}
                  <TableCell>{prettyDate(item.createdAt) || ''}</TableCell>
                  <TableCell align="right">
                    {!(type === 'comments' && item.deleted) && (
                      <Button size="small" color="error" disabled={deletingId === item.id} onClick={() => remove(item)}>
                        Sil
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
