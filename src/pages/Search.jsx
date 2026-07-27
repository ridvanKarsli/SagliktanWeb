import { useEffect, useRef, useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, ClickAwayListener, Fade, Paper,
  Stack, Tab, Tabs, TextField, Typography
} from '@mui/material'
import { SearchRounded, ChatBubbleOutlineRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { searchPosts, searchComments, searchUsers, quickSearch } from '../services/api.js'

const TABS = [
  { key: 'posts', label: 'Gönderiler', fetcher: searchPosts },
  { key: 'comments', label: 'Yorumlar', fetcher: searchComments },
  { key: 'people', label: 'Kişiler', fetcher: searchUsers },
]

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

function truncate(text = '', max = 140) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

function CommentResultCard({ comment, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <ChatBubbleOutlineRounded sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {comment.authorName || 'Kullanıcı'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          · {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('tr-TR') : ''}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
        {comment.content}
      </Typography>
    </Box>
  )
}

function PersonResultCard({ person }) {
  const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim()
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 40, height: 40, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initialsFrom(fullName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
            {fullName || 'Kullanıcı'}
          </Typography>
          {person.bio && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {person.bio}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

const emptyTabState = {
  results: [], page: 0, totalPages: 1, totalElements: 0, last: true,
  loading: false, searched: false, loadedKey: null
}

export default function Search() {
  const { token } = useAuth()
  const { showError } = useNotification()
  const loc = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(loc.search)
  const initialQ = params.get('q') || ''

  const [q, setQ] = useState(initialQ)
  const [activeQuery, setActiveQuery] = useState(initialQ)
  const [tabIndex, setTabIndex] = useState(0)
  const [states, setStates] = useState({ posts: emptyTabState, comments: emptyTabState, people: emptyTabState })

  // Yazarken öneri (dropdown) - Twitter tarzı hızlı arama
  const [suggestions, setSuggestions] = useState(null)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const debounceRef = useRef(null)

  const activeTab = TABS[tabIndex]
  const activeState = states[activeTab.key]

  // Ana sekmeli sonuçlar: sadece görüntülenen sekme için, gerektiğinde tembel yüklenir.
  useEffect(() => {
    if (!token || !activeQuery.trim()) return
    const key = activeTab.key
    const requestKey = `${activeQuery.trim()}:${activeState.page}`
    if (activeState.loadedKey === requestKey) return

    let mounted = true
    setStates(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }))
    activeTab.fetcher(token, activeQuery.trim(), { page: activeState.page })
      .then(res => {
        if (!mounted) return
        setStates(prev => ({
          ...prev,
          [key]: {
            results: Array.isArray(res?.content) ? res.content : [],
            page: activeState.page,
            totalPages: res?.totalPages ?? 1,
            totalElements: res?.totalElements ?? 0,
            last: res?.last ?? true,
            loading: false,
            searched: true,
            loadedKey: requestKey,
          }
        }))
      })
      .catch(err => {
        if (!mounted) return
        showError(err.message || 'Arama başarısız.')
        setStates(prev => ({ ...prev, [key]: { ...prev[key], loading: false } }))
      })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeQuery, tabIndex, activeState.page])

  // Yazarken öneri: debounce'lu birleşik hızlı arama
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const term = q.trim()
    if (!token || term.length < 2) {
      setSuggestions(null)
      setSuggestLoading(false)
      return
    }
    setSuggestLoading(true)
    debounceRef.current = setTimeout(() => {
      quickSearch(token, term)
        .then(res => setSuggestions(res))
        .catch(() => setSuggestions(null))
        .finally(() => setSuggestLoading(false))
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [q, token])

  const runSearch = (term) => {
    const next = term.trim()
    setStates({ posts: emptyTabState, comments: emptyTabState, people: emptyTabState })
    setActiveQuery(next)
    setSuggestOpen(false)
    const sp = new URLSearchParams()
    if (next) sp.set('q', next)
    navigate(`/search${sp.toString() ? `?${sp.toString()}` : ''}`, { replace: true })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    runSearch(q)
  }

  const setPageForActiveTab = (updater) => {
    setStates(prev => ({
      ...prev,
      [activeTab.key]: { ...prev[activeTab.key], page: updater(prev[activeTab.key].page) }
    }))
  }

  const goToPost = (postId) => {
    setSuggestOpen(false)
    navigate(`/post/${postId}`)
  }

  const hasAnySuggestions = suggestions && (
    suggestions.posts?.length || suggestions.comments?.length || suggestions.users?.length
  )

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Ara
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Gönderilerde, yorumlarda ve kişilerde arama yapın.
        </Typography>
      </Box>

      <ClickAwayListener onClickAway={() => setSuggestOpen(false)}>
        <Box sx={{ position: 'relative', mb: activeQuery.trim() ? 2 : 3 }}>
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              placeholder="Ara..."
              value={q}
              onChange={e => { setQ(e.target.value); setSuggestOpen(true) }}
              onFocus={() => setSuggestOpen(true)}
              InputProps={{ startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1 }} /> }}
            />
          </Box>

          <Fade in={suggestOpen && q.trim().length >= 2}>
            <Paper
              elevation={6}
              sx={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                zIndex: 20, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                maxHeight: 420, overflowY: 'auto', p: suggestLoading || hasAnySuggestions ? 1.5 : 0
              }}
            >
              {suggestLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              )}

              {!suggestLoading && suggestions && !hasAnySuggestions && (
                <Typography variant="body2" sx={{ color: 'text.secondary', p: 1.5 }}>
                  Sonuç bulunamadı
                </Typography>
              )}

              {!suggestLoading && suggestions?.posts?.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, px: 1 }}>
                    GÖNDERİLER
                  </Typography>
                  {suggestions.posts.map(post => (
                    <Box
                      key={post.id}
                      onClick={() => goToPost(post.id)}
                      sx={{ p: 1, borderRadius: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                        {post.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        {truncate(post.content, 90)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {!suggestLoading && suggestions?.comments?.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, px: 1 }}>
                    YORUMLAR
                  </Typography>
                  {suggestions.comments.map(c => (
                    <Box
                      key={c.id}
                      onClick={() => goToPost(c.postId)}
                      sx={{ p: 1, borderRadius: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.primary' }} noWrap>
                        {truncate(c.content, 90)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        {c.authorName}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {!suggestLoading && suggestions?.users?.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, px: 1 }}>
                    KİŞİLER
                  </Typography>
                  {suggestions.users.map(u => (
                    <Stack
                      key={u.id}
                      direction="row" spacing={1.25} alignItems="center"
                      sx={{ p: 1, borderRadius: 1.5 }}
                    >
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}>
                        {initialsFrom(`${u.firstName || ''} ${u.lastName || ''}`)}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: 'text.primary' }} noWrap>
                        {u.firstName} {u.lastName}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              )}

              {!suggestLoading && hasAnySuggestions && (
                <Button
                  fullWidth
                  size="small"
                  onClick={() => runSearch(q)}
                  sx={{ mt: 0.5 }}
                >
                  "{q.trim()}" için tüm sonuçları gör
                </Button>
              )}
            </Paper>
          </Fade>
        </Box>
      </ClickAwayListener>

      {activeQuery.trim() && (
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {TABS.map(t => (
            <Tab key={t.key} label={`${t.label}${states[t.key].searched ? ` (${states[t.key].totalElements})` : ''}`} />
          ))}
        </Tabs>
      )}

      {activeState.loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!activeState.loading && activeState.searched && (
        <Box>
          {activeState.results.length === 0 ? (
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
              {activeTab.key === 'posts' && activeState.results.map(post => (
                <PostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />
              ))}
              {activeTab.key === 'comments' && activeState.results.map(c => (
                <CommentResultCard key={c.id} comment={c} onClick={() => goToPost(c.postId)} />
              ))}
              {activeTab.key === 'people' && activeState.results.map(p => (
                <PersonResultCard key={p.id} person={p} />
              ))}

              {activeState.totalPages > 1 && (
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ py: 3 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={activeState.page <= 0}
                    onClick={() => setPageForActiveTab(p => Math.max(0, p - 1))}
                  >
                    Önceki
                  </Button>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Sayfa {activeState.page + 1} / {activeState.totalPages}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={activeState.last}
                    onClick={() => setPageForActiveTab(p => p + 1)}
                  >
                    Sonraki
                  </Button>
                </Stack>
              )}
            </>
          )}
        </Box>
      )}

      {!activeState.loading && !activeState.searched && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SearchRounded sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gönderi, yorum veya kişi aramak için yukarıya bir şeyler yazın.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
