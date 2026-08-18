import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// X.com/Linear tarzı hızlı arama kısayolu: Cmd/Ctrl+K her yerden (yazı
// yazarken dahi - platform konvansiyonu budur) /search'e götürür, "/" ise
// sadece bir input/textarea'ya odaklanılmamışken (aksi halde normal bir
// karakter olarak yazılamazdı). /search sayfası zaten açıksa Search.jsx
// kendi keydown dinleyicisiyle (bkz. Search.jsx) input'a odaklanmayı
// üstleniyor - burada sadece navigasyon var, çift dinleyici çakışmasın diye.
export default function useQuickSearchShortcut() {
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e) {
      const isMod = e.metaKey || e.ctrlKey
      const isK = isMod && e.key.toLowerCase() === 'k'
      const target = e.target
      const isTyping = !!target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      )
      const isSlash = e.key === '/' && !isMod && !e.altKey && !isTyping

      if (!isK && !isSlash) return
      if (window.location.pathname === '/search') return // Search.jsx zaten dinliyor

      e.preventDefault()
      navigate('/search', { state: { autoFocus: true } })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
}
