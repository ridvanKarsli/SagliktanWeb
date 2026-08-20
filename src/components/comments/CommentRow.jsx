import { useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
  Stack, SwipeableDrawer, TextField, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { ChevronRightRounded, DeleteOutline, EditOutlined, FlagOutlined, MoreVertRounded, ReplyOutlined } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { useConfirm } from '../../context/ConfirmContext.jsx'
import ReactionButtons from '../ReactionButtons.jsx'
import SensitiveContentBanner from '../SensitiveContentBanner.jsx'
import { deleteComment, reactToComment, removeCommentReaction, updateComment } from '../../services/api.js'
import { initialsFrom, prettyDate } from '../../utils/format.js'
import { canManage } from '../../utils/permissions.js'
import { clickableProps } from '../../utils/clickable.js'

// Tek bir yorum (ya da yanıt) satırı - PostDetail.jsx'ten ayrı bir dosyaya
// taşındı (bkz. clean-code audit). token/showError/showSuccess/user artık
// prop olarak alınmıyor, doğrudan context'ten okunuyor - önceden 12 prop
// alıyordu, bu üç context değeri + user'ın kaldırılmasıyla 8'e indi.
export default function CommentRow({
  comment, isReply = false, canReply, onUpdated, onReplySubmitted, onReport, onAuthorClick, onOpenThread
}) {
  const { token, user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  // Düzenle/Sil/Şikayet Et önceden her biri kendi ikonuyla başlıkta yan yana
  // duruyordu - üç ayrı ikon + avatar + isim aynı satırda dar ekranlarda
  // sıkışık/karmaşık görünüyordu. Artık tek bir "..." menüsünde toplanıyor
  // (bkz. kullanıcı geri bildirimi: "yorum kısımları karmaşık").
  const [menuAnchor, setMenuAnchor] = useState(null)
  const confirm = useConfirm()
  const theme = useTheme()
  // Mobilde satır içi yanıt kutusu, üstteki/alttaki yorumları aşağı itip
  // parmakla ulaşması zor bir alana taşıyordu - alttan açılan bir Drawer,
  // klavyeyle birlikte ekranın en erişilebilir bölgesinde kalıyor.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const isDeleted = !!comment.deleted
  const manageable = !isDeleted && canManage(user, comment.authorId)
  const isOwnComment = user?.id === comment.authorId

  const saveEdit = async () => {
    if (!text.trim()) { showError('Yorum boş olamaz.'); return }
    setSaving(true)
    try {
      const updated = await updateComment(token, comment.id, text.trim())
      onUpdated(updated || { ...comment, content: text.trim() })
      setEditing(false)
      showSuccess('Yorum güncellendi.')
    } catch (err) {
      showError(err.message || 'Yorum güncellenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!(await confirm('Bu yorumu silmek istiyor musun?', { title: 'Yorumu sil' }))) return
    setDeleting(true)
    try {
      await deleteComment(token, comment.id)
      // Backend soft delete yapıyor (satır kalıyor, içerik placeholder'a
      // dönüyor) ki altındaki yanıt zinciri kopmasın - aynısını burada da
      // uyguluyoruz, ağaçtan çıkarmıyoruz.
      onUpdated({ ...comment, deleted: true, content: '[Bu yorum silindi]' })
      showSuccess('Yorum silindi.')
    } catch (err) {
      showError(err.message || 'Yorum silinemedi.')
    } finally {
      setDeleting(false)
    }
  }

  const submitReply = async () => {
    if (!replyText.trim()) { showError('Yanıt boş olamaz.'); return }
    setReplySubmitting(true)
    try {
      await onReplySubmitted(comment.id, replyText.trim())
      setReplyText('')
      setReplyOpen(false)
      // Az önce eklediği yanıtı hemen görsün diye - bu yorumun thread
      // görünümünü açıyoruz (zaten açıksa no-op), "N yanıtı görüntüle"
      // arkasında saklı kalıp kafa karıştırmasın.
      onOpenThread(comment)
      showSuccess('Yanıt eklendi.')
    } catch (err) {
      showError(err.message || 'Yanıt eklenemedi.')
    } finally {
      setReplySubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        // 2 -> 1.5: aksiyon menüsü tekilleşip (bkz. "..." menüsü) ve yanıt
        // sayısı aynı satıra taşındıktan sonra kart içeriği azaldı, aynı
        // dolgu artık gereğinden ferah duruyordu - biraz sıkılaştırıldı.
        p: 1.5,
        borderRadius: 2,
        // Instagram'ın yorum satırları borderless - burada da üst seviye
        // yorum düz zemin üstünde duruyor, sadece yanıtlar (isReply) hafif
        // bir zemin farkı + sol vurgu çizgisiyle ayrışıyor (hangi yorumun
        // altına yazıldığı belli olsun diye - bu kısım IG'de yok ama
        // hiyerarşi netliği için tutuldu).
        bgcolor: isReply ? 'action.hover' : 'transparent',
        // Yanıtlar tek bir sabit girinti alıyor - bu satır hiçbir zaman
        // kendi içinde bir yanıt render etmiyor (bkz. thread-drill
        // navigasyonu), o yüzden girinti asla üst üste binip büyüyemiyor.
        ...(isReply
          ? { ml: { xs: 1.5, sm: 2.5 }, borderLeft: '2px solid', borderLeftColor: 'primary.main' }
          : {})
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Avatar
          {...(!isDeleted ? clickableProps(() => onAuthorClick(comment.authorId)) : {})}
          aria-label={!isDeleted ? `${comment.authorName || 'Kullanıcı'} profiline git` : undefined}
          sx={{
            width: 32, height: 32, fontSize: 13,
            fontWeight: 700, flexShrink: 0,
            cursor: isDeleted ? 'default' : 'pointer'
          }}
        >
          {initialsFrom(comment.authorName || '')}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row" spacing={1} alignItems="center" justifyContent="space-between"
            flexWrap="wrap" useFlexGap
          >
            <Box>
              <Typography
                variant="subtitle2"
                {...(!isDeleted ? clickableProps(() => onAuthorClick(comment.authorId)) : {})}
                sx={{
                  fontWeight: 600, display: 'inline-block',
                  cursor: isDeleted ? 'default' : 'pointer',
                  '&:hover': isDeleted ? {} : { textDecoration: 'underline' }
                }}
              >
                {comment.authorName || 'Kullanıcı'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {prettyDate(comment.createdAt) || ''}
              </Typography>
            </Box>
            {!editing && !isDeleted && (manageable || !isOwnComment) && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  aria-label="Diğer seçenekler"
                  sx={{ flexShrink: 0 }}
                >
                  <MoreVertRounded fontSize="small" />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                  {manageable && (
                    <MenuItem
                      onClick={() => { setMenuAnchor(null); setText(comment.content); setEditing(true) }}
                    >
                      <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
                      <ListItemText>Düzenle</ListItemText>
                    </MenuItem>
                  )}
                  {manageable && (
                    <MenuItem
                      onClick={() => { setMenuAnchor(null); remove() }}
                      disabled={deleting}
                    >
                      <ListItemIcon>
                        {deleting ? <CircularProgress size={16} /> : <DeleteOutline fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>Sil</ListItemText>
                    </MenuItem>
                  )}
                  {!isOwnComment && (
                    <MenuItem onClick={() => { setMenuAnchor(null); onReport(comment.id) }}>
                      <ListItemIcon><FlagOutlined fontSize="small" /></ListItemIcon>
                      <ListItemText>Şikayet Et</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Stack>

          {editing ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                value={text}
                onChange={e => setText(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                size="small"
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" onClick={saveEdit} disabled={saving}>
                  {saving ? <CircularProgress size={14} color="inherit" /> : 'Kaydet'}
                </Button>
                <Button size="small" onClick={() => setEditing(false)} disabled={saving}>İptal</Button>
              </Stack>
            </Stack>
          ) : (
            <>
              {/* Yorumlar da okunacak asıl içerik - gövde ölçüsünde (body1),
                  ikincil metin ölçüsünde değil. */}
              <Typography
                variant="body1"
                sx={{
                  mt: 0.5, whiteSpace: 'pre-line', wordBreak: 'break-word',
                  ...(isDeleted ? { fontStyle: 'italic', color: 'text.secondary' } : {})
                }}
              >
                {comment.content}
              </Typography>
              {!isDeleted && comment.flaggedSensitive && <SensitiveContentBanner sx={{ mt: 1, mb: 0 }} />}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                <ReactionButtons
                  helpfulCount={comment.helpfulCount}
                  notHelpfulCount={comment.notHelpfulCount}
                  myReaction={comment.myReaction}
                  onReact={(value) => reactToComment(token, comment.id, value)}
                  onRemove={() => removeCommentReaction(token, comment.id)}
                />
                {canReply && (
                  <Button
                    size="small"
                    startIcon={<ReplyOutlined fontSize="small" />}
                    onClick={() => setReplyOpen(o => !o)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Yanıtla
                  </Button>
                )}
                {/* Önceden reaksiyon/Yanıtla satırının ALTINDA, kendi
                    mt:1.5'i olan ayrı bir satırdı - her yorum iki ayrı
                    aksiyon satırı gibi görünüyordu. Tek satıra taşındı,
                    tek bir aksiyon şeridi hissi versin diye. */}
                {(comment.replyCount ?? 0) > 0 && (
                  <Button
                    size="small"
                    onClick={() => onOpenThread(comment)}
                    endIcon={<ChevronRightRounded fontSize="small" />}
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    {comment.replyCount} yanıtı görüntüle
                  </Button>
                )}
              </Stack>
            </>
          )}

          {replyOpen && !isMobile && (
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <TextField
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`${comment.authorName || 'Kullanıcı'} kişisine yanıt yaz...`}
                multiline
                minRows={2}
                fullWidth
                size="small"
                autoFocus
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" onClick={submitReply} disabled={replySubmitting}>
                  {replySubmitting ? <CircularProgress size={14} color="inherit" /> : 'Yanıtla'}
                </Button>
                <Button size="small" onClick={() => setReplyOpen(false)} disabled={replySubmitting}>İptal</Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>

      {isMobile && (
        // Apple'ın "fluid interfaces" ilkesi: bir sheet parmakla açıldıysa
        // parmakla da 1:1 kapanabilmeli, sadece buton/backdrop ile değil.
        // Düz Drawer'da sürükleyerek kapatma yoktu. Bunun için ayrı bir
        // spring kütüphanesi eklemek yerine (yeni bağımlılık = bundle +
        // sandbox'ta lockfile riski) MUI'nin zaten pakette olan
        // SwipeableDrawer'ı kullanıyoruz - aşağı sürüklerken paper parmağı
        // 1:1 takip ediyor, bırakınca hız/mesafeye göre açık kalıp
        // kalmayacağına karar veriyor (aynı ilke, hazır implementasyon).
        // disableSwipeToOpen: açılış hep "Yanıtla" butonuyla, kenardan
        // sürükleyerek açma davranışını istemiyoruz - sadece kapatma
        // jesti kalsın.
        <SwipeableDrawer
          anchor="bottom"
          open={replyOpen}
          onOpen={() => setReplyOpen(true)}
          onClose={() => { if (!replySubmitting) setReplyOpen(false) }}
          disableSwipeToOpen
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                p: 2,
                pb: 'calc(16px + env(safe-area-inset-bottom, 0px))'
              }
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            {comment.authorName || 'Kullanıcı'} kişisine yanıt yaz
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Yanıtını yaz..."
              multiline
              minRows={3}
              fullWidth
              size="small"
              autoFocus={replyOpen}
            />
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" onClick={submitReply} disabled={replySubmitting} sx={{ minHeight: 44 }}>
                {replySubmitting ? <CircularProgress size={16} color="inherit" /> : 'Yanıtla'}
              </Button>
              <Button fullWidth onClick={() => setReplyOpen(false)} disabled={replySubmitting} sx={{ minHeight: 44 }}>
                İptal
              </Button>
            </Stack>
          </Stack>
        </SwipeableDrawer>
      )}
    </Box>
  )
}
