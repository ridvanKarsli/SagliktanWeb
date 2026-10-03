import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material'
import { GroupsRounded, SearchOffRounded, SearchRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { listDiseaseGroups } from '../../services/api.js'
import { useGroupMembership } from '../../hooks/useGroupMembership.js'
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js'
import { useMyDiseaseGroups } from '../../hooks/useMyDiseaseGroups.js'
import EmptyState from '../../components/EmptyState.jsx'
import CenteredSpinner from '../../components/common/CenteredSpinner.jsx'
import DiseaseGroupCard from '../../components/groups/DiseaseGroupCard.jsx'

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

  if (initialLoading) return <CenteredSpinner page />

  const renderList = () => {
    if (!hasAnyGroup && !error) return <EmptyState icon={GroupsRounded} title="Henüz hiç hastalık grubu yok." />
    if (groups.length === 0 && !loading) {
      if (error) return null
      return (
        <EmptyState
          icon={SearchOffRounded}
          title={`"${debouncedQuery}" ile eşleşen grup bulunamadı.`}
          description="Farklı bir anahtar kelime deneyin."
        />
      )
    }
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>
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
                  <CircularProgress size={16} aria-label="Aranıyor" />
                </InputAdornment>
              ) : undefined
            },
            htmlInput: { 'aria-label': 'Grup ara' }
          }}
          sx={{ mb: 2 }}
        />
      )}

      {renderList()}
    </Box>
  )
}
