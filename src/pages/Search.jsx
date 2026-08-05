import { useEffect, useRef, useState } from 'react'
import {
  Avatar, Box, Button, CircularProgress, ClickAwayListener, Divider, Fade, IconButton, Paper,
  Stack, Tab, Tabs, TextField, Typography
} from '@mui/material'
import { SearchRounded, ChatBubbleOutlineRounded, CloseRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard.jsx'
import HighlightText from '../components/HighlightText.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { searchPosts, searchComments, searchUsers, quickSearch } from '../services/api.js'
import { initialsFrom, prettyDate } from '../utils/format.js'

const TABS = [
  { key: 'posts', label: 'Gönderiler', fetcher: searchPosts },
  { key: 'comments', label: 'Yorumlar', fetcher: searchComments },
  { key: 'people', label: 'Kişiler', fetcher: searchUsers },
]

function truncate(text = '', max = 140) {
  const clean = String(text || '').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trimEnd()}…`
}

function CommentResultCard({ comment, onClick, onAuthorClick, query }) {
  return (
    <Box
      onClick={onClick}
      className="tap-scale"
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
        <Typography
          variant="caption"
          onClick={(e) => { e.stopPropagation(); onAuthorClick?.(comment.authorId) }}
          sx={{ color: 'text.secondary', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {comment.authorName || 'Kullanıcı'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          · {prettyDate(comment.createdAt) || ''}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{ color: 'text.primary', whiteSpace: 'pre-line', wordBreak: 'break-word' }}
      >
        {query ? <HighlightText text={comment.content} query={query} /> : comment.content}
      </Typography>
    </Box>
  )
}

function PersonResultCard({ person, onClick, query }) {
  const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim()
  return (
    <Box
      onClick={onClick}
      className="tap-scale"
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
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 40, height: 40, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initialsFrom(fullName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
            {query ? <HighlightText text={fullName || 'Kullanıcı'} query={query} /> : (fullName || 'Kullanıcı')}
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
  const { token, user: currentUser } = useAuth()
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
  const [activeIndex, setActiveIndex] = useState(-1) // klavye ile öneri gezinme
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

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
        .then(res => { setSuggestions(res); setActiveIndex(-1) })
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

  const goToProfile = (userId) => {
    setSuggestOpen(false)
    if (currentUser && String(currentUser.id) === String(userId)) {
      navigate('/profile')
    } else {
      navigate(`/users/${userId}`)
    }
  }

  const hasAnySuggestions = suggestions && (
    suggestions.posts?.length || suggestions.comments?.length || suggestions.users?.length
  )

  // Klavye ile gezinme (Yukarı/Aşağı ok, Enter, Escape) için tüm öneri
  // gruplarını (gönderi/yorum/kişi) görüntülenme sırasıyla tek bir düz
  // diziye topluyoruz - activeIndex bu diziye göre hesaplanır.
  const flatSuggestions = suggestOpen && suggestions ? [
    ...(suggestions.posts || []).map(p => ({ action: () => goToPost(p.id) })),
    ...(suggestions.comments || []).map(c => ({ action: () => goToPost(c.postId) })),
    ...(suggestions.users || []).map(u => ({ action: () => goToProfile(u.id) })),
  ] : []
  const postsCount = suggestions?.posts?.length || 0
  const commentsCount = suggestions?.comments?.length || 0

  const onInputKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSuggestOpen(false)
      setActiveIndex(-1)
      return
    }
    if (!suggestOpen || flatSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % flatSuggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i - 1 + flatSuggestions.length) % flatSuggestions.length)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      flatSuggestions[activeIndex].action()
    }
  }

  const clearQuery = () => {
    setQ('')
    setSuggestions(null)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

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
              inputRef={inputRef}
              placeholder="Ara..."
              value={q}
              onChange={e => { setQ(e.target.value); setSuggestOpen(true) }}
              onFocus={() => setSuggestOpen(true)}
              onKeyDown={onInputKeyDown}
              InputProps={{
                startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: q ? (
                  <IconButton size="small" aria-label="Aramayı temizle" onClick={clearQuery} edge="end">
                    <CloseRounded fontSize="small" />
                  </IconButton>
                ) : null,
              }}
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
                  {suggestions.posts.map((post, i) => (
                    <Box
                      key={post.id}
                      onClick={() => goToPost(post.id)}
                      sx={{
                        p: 1, borderRadius: 1.5, cursor: 'pointer',
                        bgcolor: activeIndex === i ? 'action.selected' : undefined,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                        <HighlightText text={post.title} query={q} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        <HighlightText text={truncate(post.content, 90)} query={q} />
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
                  {suggestions.comments.map((c, i) => (
                    <Box
                      key={c.id}
                      onClick={() => goToPost(c.postId)}
                      sx={{
                        p: 1, borderRadius: 1.5, cursor: 'pointer',
                        bgcolor: activeIndex === postsCount + i ? 'action.selected' : undefined,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.primary' }} noWrap>
                        <HighlightText text={truncate(c.content, 90)} query={q} />
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
                  {suggestions.users.map((u, i) => (
                    <Stack
                      key={u.id}
                      direction="row" spacing={1.25} alignItems="center"
                      onClick={() => goToProfile(u.id)}
                      sx={{
                        p: 1, borderRadius: 1.5, cursor: 'pointer',
                        bgcolor: activeIndex === postsCount + commentsCount + i ? 'action.selected' : undefined,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}>
                        {initialsFrom(`${u.firstName || ''} ${u.lastName || ''}`)}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: 'text.primary' }} noWrap>
                        <HighlightText text={`${u.firstName || ''} ${u.lastName || ''}`.trim()} query={q} />
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
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Farklı bir arama terimi deneyin
              </Typography>
            </Box>
          ) : (
            <>
              {activeTab.key === 'posts' && activeState.results.map((post, i) => (
                <Box key={post.id}>
                  {i > 0 && <Divider />}
                  <PostCard
                    post={post}
                    token={token}
                    onClick={() => navigate(`/post/${post.id}`)}
                    highlightQuery={activeQuery}
                  />
                </Box>
              ))}
              {activeTab.key === 'comments' && activeState.results.map(c => (
                <CommentResultCard
                  key={c.id}
                  comment={c}
                  onClick={() => goToPost(c.postId)}
                  onAuthorClick={goToProfile}
                  query={activeQuery}
                />
              ))}
              {activeTab.key === 'people' && activeState.results.map(p => (
                <PersonResultCard key={p.id} person={p} onClick={() => goToProfile(p.id)} query={activeQuery} />
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
