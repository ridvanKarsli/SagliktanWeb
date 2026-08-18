import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress, InputAdornment, Stack, TextField, Typography
} from '@mui/material'
import { GroupsRounded, PeopleAltRounded, SearchOffRounded, SearchRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import {
  listDiseaseGroups, getMyDiseaseGroups, joinDiseaseGroup, leaveDiseaseGroup
} from '../../services/api.js'
import EmptyState from '../../components/EmptyState.jsx'

/**
 * Uygulamanın giriş sonrası ana sayfası: tüm hastalık gruplarını listeler,
 * kullanıcının katıldığı grupları işaretler, katıl/ayrıl aksiyonu sunar.
 */
export default function DiseaseGroups() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [hasAnyGroup, setHasAnyGroup] = useState(true)
  const [joinedIds, setJoinedIds] = useState(new Set())
  // initialLoading: sadece İLK yüklemede tam sayfa spinner gösterir. Arama
  // kutusuna yazarken tetiklenen sonraki fetch'lerde `loading` true olsa
  // bile sayfa/arama kutusu DOM'dan sökülmemeli - aksi halde input focus
  // kaybolur, kullanıcı her debounce sonrası tekrar kutuya tıklamak zorunda
  // kalır (bkz. Posts.jsx'teki aynı desen - TextField loading dalının dışında).
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState(null)

  // Arama kutusu: Posts.jsx'teki gönderi aramasıyla aynı desen - backend'in
  // prefix + pg_trgm fuzzy (yazım hatası toleranslı) tam metin aramasına
  // bağlı (bkz. DiseaseGroupController.listAll?q=...), istemci tarafı
  // basit bir substring filtresi değil. 300ms debounce ile her tuş
  // vuruşunda ayrı istek atılmıyor.
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const searchDebounceRef = useRef(null)

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(searchDebounceRef.current)
  }, [query])

  // Katılınan gruplar arama sorgusundan bağımsız - bir kez çekiliyor,
  // sonrası join/leave aksiyonlarıyla local state üzerinden güncelleniyor.
  useEffect(() => {
    if (!token) return
    getMyDiseaseGroups(token)
      .then(mine => setJoinedIds(new Set((Array.isArray(mine) ? mine : []).map(g => g.id))))
      .catch(() => {})
  }, [token])

  const load = useCallback(async () => {
    if (!token) { setLoading(false); setInitialLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const all = await listDiseaseGroups(token, { q: debouncedQuery || undefined })
      const list = Array.isArray(all) ? all : []
      setGroups(list)
      // "Hiç grup yok" ile "aramayla eşleşen yok" durumlarını ayırt etmek
      // için: sadece arama yokken gelen sonuca bakılıyor, arama sırasında
      // önceki değer korunuyor.
      if (!debouncedQuery) setHasAnyGroup(list.length > 0)
    } catch (err) {
      setError(err.message || 'Hastalık grupları alınamadı.')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [token, debouncedQuery])

  useEffect(() => { load() }, [load])

  const handleJoin = async (e, groupId) => {
    e.stopPropagation()
    if (!token) return
    setPendingId(groupId)
    try {
      await joinDiseaseGroup(token, groupId)
      setJoinedIds(prev => new Set(prev).add(groupId))
      showSuccess('Gruba katıldınız.')
    } catch (err) {
      showError(err.message || 'Gruba katılınamadı.')
    } finally {
      setPendingId(null)
    }
  }

  const handleLeave = async (e, groupId) => {
    e.stopPropagation()
    if (!token) return
    setPendingId(groupId)
    try {
      await leaveDiseaseGroup(token, groupId)
      setJoinedIds(prev => {
        const next = new Set(prev)
        next.delete(groupId)
        return next
      })
      showSuccess('Gruptan ayrıldınız.')
    } catch (err) {
      showError(err.message || 'Gruptan ayrılınamadı.')
    } finally {
      setPendingId(null)
    }
  }

  // Sadece İLK yüklemede tam sayfa spinner - sonraki arama fetch'lerinde
  // arama kutusu (aşağıda) hep mounted kalır, bkz. initialLoading tanımı.
  if (initialLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, px: { xs: 0.5, md: 0 } }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Hastalık Grupları
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          İlgilendiğin gruplara katıl, alt forumlarını keşfet.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {hasAnyGroup && (
        <TextField
          fullWidth
          size="small"
          placeholder="Grup adı veya açıklamasında ara..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined
            }
          }}
          sx={{ mb: 2 }}
        />
      )}

      {!hasAnyGroup && !error ? (
        <EmptyState icon={GroupsRounded} title="Henüz hiç hastalık grubu yok." />
      ) : groups.length === 0 && !loading ? (
        <EmptyState
          icon={SearchOffRounded}
          title={`"${debouncedQuery}" ile eşleşen grup bulunamadı.`}
          description="Farklı bir anahtar kelime deneyin."
        />
      ) : (
        /* KOMPAKTLIK NOTU: bu kartlar eskiden ~200px yükseklikteydi ve
           telefonda ekrana ancak 2,5 grup sığıyordu - kullanıcı listeyi
           tarayabilmek için sürekli kaydırmak zorundaydı. Asıl yer kaybı,
           her kartın altındaki TAM GENİŞLİK Katıl/Ayrıl butonuydu: en
           büyük, en dikkat çeken öğe "Ayrıl" oluyordu; oysa "Ayrıl" nadiren
           kullanılan, yarı-yıkıcı bir aksiyon. Asıl birincil eylem (gruba
           girip içeriğe bakmak) ise hiçbir görsel vurgusu olmayan kart
           tıklamasıydı - hiyerarşi tamamen tersti. Artık: satır tıklaması
           gruba girer (sağdaki ok bunu belli eder), katıl/ayrıl ise sağda
           kompakt ikincil bir buton. */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1
          }}
        >
          {groups.map(group => {
            const joined = joinedIds.has(group.id)
            const pending = pendingId === group.id
            return (
              <Box
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="tap-scale"
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: joined ? 'primary.main' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { bgcolor: 'action.hover', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                      display: 'grid', placeItems: 'center',
                      background: 'linear-gradient(135deg, rgba(76,184,159,0.22), rgba(224,139,109,0.14))',
                      color: 'primary.main'
                    }}
                  >
                    <GroupsRounded sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}>
                        {group.name}
                      </Typography>
                      {joined && (
                        <Chip label="Katıldın" size="small" color="primary" variant="filled" sx={{ height: 24 }} />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PeopleAltRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {group.memberCount ?? 0} üye
                      </Typography>
                    </Stack>
                    {group.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary', mt: 0.25,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {group.description}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant={joined ? 'text' : 'contained'}
                    size="small"
                    disabled={pending}
                    onClick={(e) => (joined ? handleLeave(e, group.id) : handleJoin(e, group.id))}
                    sx={{
                      flexShrink: 0, borderRadius: 5, minHeight: 40, minWidth: 72,
                      px: 1.75, alignSelf: 'center',
                      ...(joined ? { color: 'text.secondary' } : {})
                    }}
                  >
                    {pending ? <CircularProgress size={16} color="inherit" /> : (joined ? 'Ayrıl' : 'Katıl')}
                  </Button>
                </Stack>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
