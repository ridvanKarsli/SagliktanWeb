import { useEffect, useState } from 'react'
import {
  Box, Button, CircularProgress, Stack, TextField, Typography
} from '@mui/material'
import { SearchRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { searchPosts } from '../services/api.js'

export default function Search() {
  const { token } = useAuth()
  const { showError } = useNotification()
  const loc = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(loc.search)
  const initialQ = params.get('q') || ''

  const [q, setQ] = useState(initialQ)
  const [activeQuery, setActiveQuery] = useState(initialQ)
  const [results, setResults] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [last, setLast] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!token || !activeQuery.trim()) { setResults([]); setSearched(false); return }
    let mounted = true
    setLoading(true)
    searchPosts(token, activeQuery.trim(), { page })
      .then(res => {
        if (!mounted) return
        setResults(Array.isArray(res?.content) ? res.content : [])
        setTotalPages(res?.totalPages ?? 1)
        setTotalElements(res?.totalElements ?? 0)
        setLast(res?.last ?? true)
        setSearched(true)
      })
      .catch(err => {
        if (!mounted) return
        showError(err.message || 'Arama başarısız.')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeQuery, page])

  const onSubmit = (e) => {
    e.preventDefault()
    const next = q.trim()
    setPage(0)
    setActiveQuery(next)
    const sp = new URLSearchParams()
    if (next) sp.set('q', next)
    navigate(`/search${sp.toString() ? `?${sp.toString()}` : ''}`, { replace: true })
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Gönderi Ara
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Tüm gruplardaki gönderilerde başlık ve içeriğe göre ara.
        </Typography>
      </Box>

      <Box component="form" onSubmit={onSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Ara..."
          value={q}
          onChange={e => setQ(e.target.value)}
          InputProps={{ startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1 }} /> }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && searched && (
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            {totalElements} sonuç bulundu
          </Typography>

          {results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                Sonuç bulunamadı
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                Farklı bir arama terimi deneyin
              </Typography>
            </Box>
          ) : (
            <>
              {results.map(post => (
                <PostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />
              ))}

              {totalPages > 1 && (
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ py: 3 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={page <= 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    Önceki
                  </Button>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Sayfa {page + 1} / {totalPages}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={last}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Sonraki
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Box>
      )}

      {!loading && !searched && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SearchRounded sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Aramaya başlamak için yukarıya bir şeyler yazın.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
