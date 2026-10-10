import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { loginUser, registerUser, getUserProfile, refreshToken as refreshTokenApi, logoutUser } from '../services/api.js'
import { clearRecentSearches } from '../utils/recentSearches.js'
import { clearMyGroups } from '../services/myGroups.js'
import { invalidateListCache } from '../hooks/usePaginatedList.js'

// --- JWT yardımcıları (sadece expiry kontrolü için; kullanıcı bilgisi her zaman /users/me'den alınır) ---
function b64urlToUtf8(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4)
  const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/')
  try {
    return decodeURIComponent(
      atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
  } catch {
    // Payload UTF-8 çok baytlı karakter içermiyorsa yukarıdaki decode
    // gereksiz/başarısız olabilir - ham atob() sonucu zaten doğru ASCII'dir.
    return atob(b64)
  }
}
function parseJwt(token) {
  // Bozuk/eksik bir token'da boş obje dön - çağıran taraf (isTokenExpired)
  // zaten `p?.exp` ile kontrollü okuyor, burada hata fırlatmak (ki zaten
  // sadece expiry kontrolü için kullanılan, güvenlik kararı vermeyen bir
  // yardımcı) gereksiz bir crash'e yol açardı.
  try { return JSON.parse(b64urlToUtf8(token.split('.')[1])) || {} } catch { return {} }
}
function isTokenExpired(token) {
  if (!token) return true
  const p = parseJwt(token)
  if (!p?.exp) return false
  const bufferSeconds = 120
  return p.exp <= (Math.floor(Date.now() / 1000) + bufferSeconds)
}

// Proaktif yenileme için: token'ın `exp`'ine (saniye) kalan süre, ms.
// exp yoksa null (süresiz token - zamanlayıcı kurulmaz).
function msUntilExpiry(token) {
  const p = parseJwt(token)
  if (!p?.exp) return null
  return p.exp * 1000 - Date.now()
}
// exp'ten bu kadar önce yenile: reaktif 401->refresh yolu (api.js) yedek
// olarak kalır ama normalde hiç devreye girmez; kullanıcı "yetkin yok"
// anlarını ve çift istek maliyetini görmez.
const PROACTIVE_REFRESH_LEAD_MS = 120 * 1000
const MIN_REFRESH_DELAY_MS = 5 * 1000

// Global refresh lock - aynı anda birden fazla refresh yapılmasını engelle.
// api.js'in 401 retry mantığı bunu kullanır.
let refreshPromise = null
let refreshCallback = null

function setRefreshCallback(callback) {
  refreshCallback = callback
}

export async function attemptTokenRefresh() {
  if (refreshPromise) return refreshPromise
  if (refreshCallback) {
    refreshPromise = refreshCallback().finally(() => { refreshPromise = null })
    return refreshPromise
  }
  throw new Error('Refresh callback not set')
}

const AuthContext = createContext(null)

function getAuthStorage() {
  const localAuth = localStorage.getItem('auth')
  if (localAuth) {
    // Bozuk JSON ise sessionStorage'a da bakmaya devam et - burada hata
    // fırlatmak, kullanıcıyı geçerli bir oturumu varken bile login'e
    // düşürürdü.
    try { return { storage: localStorage, data: JSON.parse(localAuth) } } catch { /* devam et */ }
  }
  const sessionAuth = sessionStorage.getItem('auth')
  if (sessionAuth) {
    // Her iki depoda da bozuk veri varsa aşağıdaki null dönüşü zaten
    // "oturum yok" olarak yorumlanıyor (bkz. AuthProvider init effect'i).
    try { return { storage: sessionStorage, data: JSON.parse(sessionAuth) } } catch { /* devam et */ }
  }
  return null
}

function setAuthStorage(authData, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage
  if (rememberMe) sessionStorage.removeItem('auth')
  else localStorage.removeItem('auth')
  storage.setItem('auth', JSON.stringify(authData))
}

function removeAuthStorage() {
  localStorage.removeItem('auth')
  sessionStorage.removeItem('auth')
}

// Backend UserResponse -> frontend'in kullandığı hafif user şekli
function mapUser(u) {
  if (!u) return null
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    bio: u.bio || '',
    role: u.role,
    emailVerified: !!u.emailVerified,
    communityRole: u.communityRole || null,
    diagnosisYear: u.diagnosisYear ?? null,
    city: u.city || '',
    discoverable: !!u.discoverable,
    // Eski backend alanı hiç göndermiyorsa (undefined) karşılamaya zorlama.
    onboardingCompleted: u.onboardingCompleted !== false,
    weeklyDigestEnabled: u.weeklyDigestEnabled !== false,
    avatarKey: u.avatarKey || null,
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const storageInfo = getAuthStorage()
      if (!storageInfo) { setLoading(false); return }
      const { storage, data: authData } = storageInfo
      let accessToken = authData?.accessToken
      const refreshTokenValue = authData?.refreshToken

      try {
        if (!accessToken || isTokenExpired(accessToken)) {
          if (!refreshTokenValue || isTokenExpired(refreshTokenValue)) {
            removeAuthStorage()
            setLoading(false)
            return
          }
          const result = await refreshTokenApi(refreshTokenValue)
          accessToken = result.accessToken
          setAuthStorage({ accessToken, refreshToken: result.refreshToken }, storage === localStorage)
        }
        const profile = await getUserProfile(accessToken)
        if (!mounted) return
        setToken(accessToken)
        setUser(mapUser(profile))
      } catch (err) {
        console.warn('[AuthContext] oturum geri yüklenemedi:', err)
        // Sadece gerçek bir auth hatasında (401/403 - token geçersiz ya da
        // süresi gerçekten dolmuş) storage'ı temizle. Ağ hatası, zaman aşımı
        // ya da geçici bir sunucu hatasında (örn. mobil veride kısa kesinti)
        // kullanıcıyı gereksiz yere çıkışa zorlamayalım - refresh token
        // localStorage'da kalsın, bir sonraki ziyarette tekrar denensin.
        if (err?.status === 401 || err?.status === 403) {
          removeAuthStorage()
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    bootstrap()
    return () => { mounted = false }
  }, [])

  async function login(email, password, rememberMe = true) {
    const { accessToken, refreshToken: newRefreshToken } = await loginUser({ email, password })
    if (!accessToken) throw new Error('Sunucudan accessToken alınamadı.')
    const profile = await getUserProfile(accessToken)
    setToken(accessToken)
    setUser(mapUser(profile))
    setAuthStorage({ accessToken, refreshToken: newRefreshToken }, rememberMe)
    return mapUser(profile)
  }

  const logout = useCallback(async () => {
    if (token) {
      // Sunucu tarafı oturum iptali en iyi çaba: ağ hatasında bile kullanıcı
      // yerelde çıkış yapabilmeli (yerel token zaten aşağıda siliniyor).
      try { await logoutUser(token) } catch { /* best-effort server-side revoke */ }
    }
    setToken(null)
    setUser(null)
    removeAuthStorage()
    // Sağlık verisi niteliğindeki son aramalar (hastalık adları) ortak
    // cihazda bir sonraki kullanıcıya kalmasın.
    clearRecentSearches()
    // Bellekteki liste/üyelik önbellekleri de bir sonraki kullanıcıya sızmasın.
    clearMyGroups()
    invalidateListCache()
  }, [token])

  // Backend e-posta doğrulaması zorunlu kılıyor: register token döndürmez.
  // Kayıt sonrası kullanıcı e-postasındaki linke tıklayıp login sayfasına gelmeli.
  // kvkkConsent: backend @AssertTrue ile zorunlu kılıyor, kayıt formundaki
  // onay kutusu işaretlenmeden bu istek 400 ile reddedilir.
  async function register({ email, password, firstName, lastName, kvkkConsent, city }) {
    const created = await registerUser({ email, password, firstName, lastName, kvkkConsent, city })
    return mapUser(created)
  }

  const refreshAccessToken = useCallback(async () => {
    const storageInfo = getAuthStorage()
    if (!storageInfo) throw new Error('Oturum bulunamadı.')
    const { storage, data: authData } = storageInfo
    const refreshTokenValue = authData?.refreshToken
    if (!refreshTokenValue || isTokenExpired(refreshTokenValue)) {
      await logout()
      throw new Error('Oturum süresi dolmuş, lütfen tekrar giriş yapın.')
    }
    let result
    try {
      result = await refreshTokenApi(refreshTokenValue)
    } catch (err) {
      // Sunucu refresh'i REDDETTİYSE (oturum başka cihazdan sonlandırılmış,
      // hesap pasif, şifre değişmiş...) yerelde de çıkış yap - yoksa arayüz
      // açık görünür ama her istek "yetkin yok" der ("zombi oturum"). Ağ
      // hatası (status 0) ya da geçici 5xx'te oturum korunur.
      if (err?.status === 401 || err?.status === 403) {
        await logout()
      }
      throw err
    }
    const { accessToken, refreshToken: newRefreshToken } = result
    setToken(accessToken)
    setAuthStorage({ accessToken, refreshToken: newRefreshToken }, storage === localStorage)
    return accessToken
  }, [logout])

  function updateLocalUser(patch) {
    setUser(u => (u ? { ...u, ...patch } : u))
  }

  // Sunucunun döndürdüğü tam UserResponse ile yerel kullanıcıyı güncelle
  // (ör. sağlık özeti / tercih / karşılama uçları).
  function applyServerUser(profile) {
    if (profile) setUser(mapUser(profile))
  }

  useEffect(() => {
    setRefreshCallback(refreshAccessToken)
    return () => setRefreshCallback(null)
  }, [refreshAccessToken])

  // Proaktif yenileme: access token dolmadan 2 dk önce arka planda yenile.
  // Her yeni token'da zamanlayıcı yeniden kurulur (setToken -> bu effect).
  // Sekme uyuyup uyandığında (mobil) zamanlayıcılar geç/hiç çalışmamış
  // olabilir: görünür olunca kalan süreye bakılıp gerekirse hemen yenilenir.
  const refreshTimerRef = useRef(null)
  useEffect(() => {
    if (!token) return undefined
    let cancelled = false

    const arm = () => {
      clearTimeout(refreshTimerRef.current)
      const remaining = msUntilExpiry(token)
      if (remaining == null) return
      const delay = Math.max(MIN_REFRESH_DELAY_MS, remaining - PROACTIVE_REFRESH_LEAD_MS)
      refreshTimerRef.current = setTimeout(() => {
        if (cancelled) return
        // attemptTokenRefresh: api.js ile aynı tek-uçuş kilidi (aynı anda
        // bir 401 yeniden denemesi de refresh istiyorsa ikinci istek açılmaz).
        attemptTokenRefresh().catch(() => {
          // Ağ hatasında sessiz kal: reaktif yol (401 -> refresh) ve bir
          // sonraki visibilitychange yeniden dener; sunucu reddettiyse
          // refreshAccessToken zaten çıkış yaptırdı.
        })
      }, delay)
    }

    const onVisible = () => {
      if (document.visibilityState !== 'visible' || cancelled) return
      const remaining = msUntilExpiry(token)
      if (remaining != null && remaining <= PROACTIVE_REFRESH_LEAD_MS) {
        attemptTokenRefresh().catch(() => {})
      } else {
        arm()
      }
    }

    arm()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearTimeout(refreshTimerRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [token])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token && !!user, loading, login, logout, register, updateLocalUser, applyServerUser, refreshAccessToken }),
    // login/register/updateLocalUser her render'da yeni referans ama sadece
    // setState/API çağırıyor - tüketicilerin gereksiz yeniden render'ını
    // önlemek için bilinçli olarak deps dışında.
    [token, user, loading, logout, refreshAccessToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
