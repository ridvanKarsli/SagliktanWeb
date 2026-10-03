import { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress, ClickAwayListener, Fade, IconButton, Tab, Tabs, TextField, Typography } from '@mui/material'
import { CloseRounded, SearchOffRounded, SearchRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import PostList from '../components/PostList.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LoadMoreButton from '../components/common/LoadMoreButton.jsx'
import SearchSuggestions from '../components/search/SearchSuggestions.jsx'
import { CommentResultCard, PersonResultCard } from '../components/search/SearchResultCards.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { useSearchSuggestions } from '../hooks/useSearchSuggestions.js'
import { SEARCH_TABS, useTabbedSearch } from '../hooks/useTabbedSearch.js'
import { goToUserProfile } from '../utils/navigation.js'
import { loadRecentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } from '../utils/recentSearches.js'

function useFocusShortcut(inputRef) {
  // Bu sayfadayken Cmd/Ctrl+K kutuya odaklanıp metni seçer (diğer sayfalarda
  // aynı kısayol buraya yönlendirir - bkz. useQuickSearchShortcut).
  useEffect(() => {
    function onKeyDown(e) {
      const isK = (e.metaKey || e.ctrlKey) && (e.key || '').toLowerCase() === 'k'
      if (!isK) return
      e.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inputRef])
}

/**
 * Platform geneli arama: üstte yazarken öneri veren arama kutusu (son
 * aramalar + hızlı öneriler), altında Gönderiler / Yorumlar / Kişiler
 * sekmeli tam sonuçlar. Aktif sorgu URL'de (?q=) tutulur.
 */
export default function Search() {
  const { token, user: currentUser } = useAuth()
  const { showError } = useNotification()
  const location = useLocation()
  const navigate = useNavigate()
  const urlQuery = new URLSearchParams(location.search).get('q') || ''

  const [q, setQ] = useState(urlQuery)
  const [activeQuery, setActiveQuery] = useState(urlQuery)
  const [tabIndex, setTabIndex] = useState(0)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches)
  const inputRef = useRef(null)

  // URL'deki sorgu dışarıdan değişirse (ör. tarayıcı geri/ileri) ona uy.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)
  if (lastUrlQuery !== urlQuery) {
    setLastUrlQuery(urlQuery)
    setQ(urlQuery)
    setActiveQuery(urlQuery)
  }

  const suggest = useSearchSuggestions(token, q)
  const { states, active, tab, loadMore, reset: resetResults } = useTabbedSearch(token, activeQuery, tabIndex, {
    onError: (err) => showError(err.message || 'Arama başarısız.')
  })

  // Yeni öneri listesi gelince klavye seçimi sıfırlanır.
  const [lastSuggestions, setLastSuggestions] = useState(suggest.suggestions)
  if (lastSuggestions !== suggest.suggestions) {
    setLastSuggestions(suggest.suggestions)
    setActiveIndex(-1)
  }

  // Başka bir sayfadan kısayolla gelindiyse kutuya odaklan; state'i hemen
  // temizle ki geri/ileri tuşlarında tekrar tetiklenmesin.
  useEffect(() => {
    if (location.state?.autoFocus) {
      inputRef.current?.focus()
      navigate(location.pathname + location.search, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFocusShortcut(inputRef)

  const runSearch = (term) => {
    const next = term.trim()
    resetResults()
    setActiveQuery(next)
    setSuggestOpen(false)
    if (next) setRecentSearches(saveRecentSearch(next))
    const target = next ? `/search?${new URLSearchParams({ q: next })}` : '/search'
    setLastUrlQuery(next)
    navigate(target, { replace: true })
  }

  const runRecentSearch = (term) => {
    setQ(term)
    runSearch(term)
  }

  const goToPost = (postId) => {
    setSuggestOpen(false)
    navigate(`/post/${postId}`)
  }

  const goToProfile = (userId) => {
    setSuggestOpen(false)
    goToUserProfile(navigate, currentUser, userId)
  }

  // Klavye gezinmesi için öneriler görüntülenme sırasıyla tek düz dizide.
  const flatSuggestions = suggestOpen && suggest.suggestions ? [
    ...(suggest.suggestions.posts || []).map(p => () => goToPost(p.id)),
    ...(suggest.suggestions.comments || []).map(c => () => goToPost(c.postId)),
    ...(suggest.suggestions.users || []).map(u => () => goToProfile(u.id)),
  ] : []

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
      flatSuggestions[activeIndex]()
    }
  }

  const clearQuery = () => {
    setQ('')
    suggest.clear()
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const trimmedQ = q.trim()
  const panelVisible = suggestOpen && (trimmedQ.length >= suggest.minLength || (trimmedQ.length === 0 && recentSearches.length > 0))
  const hasActiveQuery = !!activeQuery.trim()

  const renderResults = () => {
    if (active.loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={24} aria-label="Sonuçlar yükleniyor" />
        </Box>
      )
    }
    if (!active.searched) {
      return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SearchRounded sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gönderi, yorum veya kişi aramak için yukarıya bir şeyler yazın.
          </Typography>
        </Box>
      )
    }
    if (active.results.length === 0) {
      return <EmptyState icon={SearchOffRounded} title="Sonuç bulunamadı" description="Farklı bir arama terimi deneyin" />
    }
    return (
      <Box>
        {tab.key === 'posts' && <PostList posts={active.results} token={token} highlightQuery={activeQuery} />}
        {tab.key === 'comments' && active.results.map(c => (
          <CommentResultCard key={c.id} comment={c} onClick={() => goToPost(c.postId)} onAuthorClick={goToProfile} query={activeQuery} />
        ))}
        {tab.key === 'people' && active.results.map(p => (
          <PersonResultCard key={p.id} person={p} onClick={() => goToProfile(p.id)} query={activeQuery} />
        ))}
        {!active.last && <LoadMoreButton loading={active.loadingMore} onClick={loadMore} />}
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <ClickAwayListener onClickAway={() => setSuggestOpen(false)}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 5, bgcolor: 'background.default', pt: { xs: 0, md: 1 }, pb: 1 }}>
          <Box sx={{ position: 'relative', mb: hasActiveQuery ? 1 : 2 }}>
            <Box component="form" role="search" onSubmit={(e) => { e.preventDefault(); runSearch(q) }}>
              <TextField
                fullWidth
                inputRef={inputRef}
                placeholder="Ara..."
                value={q}
                onChange={e => { setQ(e.target.value); setSuggestOpen(true) }}
                onFocus={() => setSuggestOpen(true)}
                onKeyDown={onInputKeyDown}
                slotProps={{
                  input: {
                    startAdornment: <SearchRounded sx={{ color: 'text.secondary', mr: 1 }} />,
                    endAdornment: q ? (
                      <IconButton size="small" aria-label="Aramayı temizle" onClick={clearQuery} edge="end">
                        <CloseRounded fontSize="small" />
                      </IconButton>
                    ) : null,
                  },
                  htmlInput: { 'aria-label': 'Ara', enterKeyHint: 'search' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 999,
                    bgcolor: 'background.paper',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'divider' },
                    '&.Mui-focused': { bgcolor: 'background.default' }
                  }
                }}
              />
            </Box>

            <Fade in={panelVisible} unmountOnExit>
              <Box>
                <SearchSuggestions
                  term={q}
                  recentSearches={recentSearches}
                  onPickRecent={runRecentSearch}
                  onRemoveRecent={(term) => setRecentSearches(removeRecentSearch(term))}
                  onClearRecent={() => setRecentSearches(clearRecentSearches())}
                  suggestions={suggest.suggestions}
                  loading={suggest.loading}
                  hasAny={suggest.hasAny}
                  activeIndex={activeIndex}
                  onOpenPost={goToPost}
                  onOpenProfile={goToProfile}
                  onSeeAll={() => runSearch(q)}
                />
              </Box>
            </Fade>
          </Box>
        </Box>
      </ClickAwayListener>

      {hasActiveQuery && (
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {SEARCH_TABS.map(t => (
            <Tab key={t.key} label={`${t.label}${states[t.key].searched ? ` (${states[t.key].totalElements})` : ''}`} />
          ))}
        </Tabs>
      )}

      {renderResults()}
    </Box>
  )
}
