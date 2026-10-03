import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, CircularProgress, InputAdornment, Skeleton, TextField, Typography } from '@mui/material'
import { SearchRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { listDiseaseGroups } from '../../services/api.js'
import { useGroupMembership } from '../../hooks/useGroupMembership.js'
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js'
import { useMyDiseaseGroups } from '../../hooks/useMyDiseaseGroups.js'
import EmptyState from '../../components/EmptyState.jsx'
import DiseaseGroupCard, { DiseaseGroupCardSkeleton } from '../../components/groups/DiseaseGroupCard.jsx'
import { LIMITS, clampLength } from '../../utils/validation.js'

// Tüm hastalık gruplarının listesi + arama (backend prefix/fuzzy tam metin
// araması). Kullanıcının katıldıkları işaretlenir; katıl/ayrıl buradan da yapılır.
export default function DiseaseGroups() {
  const { token } = useAuth()
  const { join, leave, pendingId } = useGroupMembership()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [hasAnyGroup, setHasAnyGroup] = useState(true)
  // Tam sayfa spinner yalnızca İLK yüklemede: aramada arama kutusu DOM'dan
  // sökülürse odak kaybolur.
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 300)

  // Katılınan gruplar sorgudan bağımsız: bir kez çekilir, sonra join/leave ile yerelde güncellenir.
  const myGroups = useMyDiseaseGroups()
  const [joinedIds, setJoinedIds] = useState(new Set())
  useEffect(() => {
    if (myGroups) setJoinedIds(new Set(myGroups.map(g => g.id)))
  }, [myGroups])

  // Yalnızca en son isteğin yanıtı uygulanır ("di" -> "diyabet" yarışı).
  const requestSeqRef = useRef(0)

  const load = useCallback(async () => {
    if (!token) { setLoading(false); setInitialLoading(false); return }
    const seq = ++requestSeqRef.current
    setLoading(true)
    setError('')
    try {
      const all = await listDiseaseGroups(token, { q: debouncedQuery || undefined })
      if (seq !== requestSeqRef.current) return
      const list = Array.isArray(all) ? all : []
      setGroups(list)
      // "Hiç grup yok" ile "aramayla eşleşen yok" ayrımı: yalnızca aramasız sonuca bakılır.
      if (!debouncedQuery) setHasAnyGroup(list.length > 0)
    } catch (err) {
      if (seq !== requestSeqRef.current) return
      setError(err.message || 'Hastalık grupları alınamadı.')
    } finally {
      if (seq === requestSeqRef.current) {
        setLoading(false)
        setInitialLoading(false)
      }
    }
  }, [token, debouncedQuery])

  const invalidatePending = useCallback(() => { requestSeqRef.current += 1 }, [])

  useEffect(() => {
    load()
    return invalidatePending
  }, [load, invalidatePending])

  const adjustCount = (groupId, delta) => setGroups(prev => prev.map(g => (
    g.id === groupId ? { ...g, memberCount: Math.max(0, (g.memberCount ?? 0) + delta) } : g
  )))

  const handleJoin = async (group) => {
    if (await join(group)) {
      setJoinedIds(prev => new Set(prev).add(group.id))
      adjustCount(group.id, 1)
    }
  }

  const handleLeave = async (group) => {
    if (await leave(group)) {
      setJoinedIds(prev => {
        const next = new Set(prev)
        next.delete(group.id)
        return next
      })
      adjustCount(group.id, -1)
    }
  }

  const grid = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: { xs: 1.5, sm: 2 } }

  const renderList = () => {
    if (initialLoading) {
      return (
        <Box role="status" aria-label="Gruplar yükleniyor" sx={grid}>
          {[0, 1, 2, 3].map(i => <DiseaseGroupCardSkeleton key={i} />)}
        </Box>
      )
    }
    if (!hasAnyGroup && !error) {
      return (
        <EmptyState
          companion="ayicik"
          title="Henüz hiç grup açılmamış"
          description="İlk grup açıldığında burada göreceksin."
        />
      )
    }
    if (groups.length === 0 && !loading) {
      if (error) return null
      return (
        <EmptyState
          companion="bulut"
          title={`“${debouncedQuery}” ile eşleşen grup bulamadık`}
          description="Hastalığın farklı bir adıyla ya da daha kısa bir kelimeyle yeniden dene."
        />
      )
    }
    return (
      <Box className="sg-stagger" sx={grid}>
        {groups.map(group => (
          <DiseaseGroupCard
            key={group.id}
            group={group}
            joined={joinedIds.has(group.id)}
            pending={pendingId === group.id}
            onOpen={() => navigate(`/groups/${group.id}`)}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 0.75 }}>
          Hastalık grupları
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 580 }}>
          Her grup, aynı hastalıkla yaşayanların ve yakınlarının buluştuğu küçük bir topluluk.
          Katıldığın grupların paylaşımları akışına gelir; içerideki alt gruplarda soru sorabilir,
          deneyimini paylaşabilirsin.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {initialLoading && <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: 999 }} />}

      {!initialLoading && hasAnyGroup && (
        <TextField
          fullWidth
          size="small"
          placeholder="Hastalık adıyla ara…"
          value={query}
          onChange={e => setQuery(clampLength(e.target.value, LIMITS.SEARCH_MAX))}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 22, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} aria-label="Aranıyor" />
                </InputAdornment>
              ) : undefined
            },
            htmlInput: { 'aria-label': 'Grup ara', inputMode: 'search', enterKeyHint: 'search', maxLength: LIMITS.SEARCH_MAX, autoComplete: 'off' }
          }}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '999px', bgcolor: 'background.paper', minHeight: 48 } }}
        />
      )}

      {renderList()}
    </Box>
  )
}
