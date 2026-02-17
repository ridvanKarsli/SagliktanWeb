import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loginUser, registerUser, getUserProfile, refreshToken as refreshTokenApi } from '../services/api.js'
import { configureApiClient, setAuthToken } from '../services/generated/configureClient'

// --- JWT yardımcıları ---
function b64urlToUtf8(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4)
  const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/')
  try {
    return decodeURIComponent(
      atob(b64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return atob(b64)
  }
}
function parseJwt(token) {
  try { return JSON.parse(b64urlToUtf8(token.split('.')[1])) || {} } catch { return {} }
}
function isTokenExpired(token) {
  if (!token) return true
  const p = parseJwt(token)
  if (!p?.exp) return false
  const nowSec = Math.floor(Date.now() / 1000)
  // Token expire olmadan 2 dakika önce expired kabul et (buffer)
  const bufferSeconds = 120 // 2 dakika
  return p.exp <= (nowSec + bufferSeconds)
}

// Global refresh lock - aynı anda birden fazla refresh yapılmasını engelle
let refreshPromise = null
let refreshCallback = null

export function setRefreshCallback(callback) {
  refreshCallback = callback
}

export async function attemptTokenRefresh() {
  // Eğer zaten bir refresh işlemi devam ediyorsa, onu bekle
  if (refreshPromise) {
    return refreshPromise
  }
  
  // Yeni refresh başlat
  if (refreshCallback) {
    refreshPromise = refreshCallback().finally(() => {
      refreshPromise = null
    })
    return refreshPromise
  }
  
  throw new Error('Refresh callback not set')
}

const AuthContext = createContext(null)

// Storage helper fonksiyonları
function getAuthStorage() {
  // Önce localStorage'dan kontrol et (kalıcı)
  const localAuth = localStorage.getItem('auth')
  if (localAuth) {
    try {
      const authData = JSON.parse(localAuth)
      return { storage: localStorage, data: authData, isPersistent: true }
    } catch {}
  }
  
  // Sonra sessionStorage'dan kontrol et (geçici)
  const sessionAuth = sessionStorage.getItem('auth')
  if (sessionAuth) {
    try {
      const authData = JSON.parse(sessionAuth)
      return { storage: sessionStorage, data: authData, isPersistent: false }
    } catch {}
  }
  
  return null
}

function setAuthStorage(authData, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage
  // Diğer storage'ı temizle
  if (rememberMe) {
    sessionStorage.removeItem('auth')
  } else {
    localStorage.removeItem('auth')
  }
  storage.setItem('auth', JSON.stringify(authData))
}

function removeAuthStorage() {
  localStorage.removeItem('auth')
  sessionStorage.removeItem('auth')
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const storageInfo = getAuthStorage()
    if (!storageInfo) {
      setLoading(false)
      return () => { mounted = false }
    }
    
    const { storage, data: authData } = storageInfo
    try {
      // Yeni yapı: accessToken ve refreshToken
      const t = authData.accessToken || authData.token
      const refreshTokenValue = authData.refreshToken
      
      if (t && !isTokenExpired(t)) {
          const p = parseJwt(t)
          setToken(t)
          try { configureApiClient(t) } catch {}
          // Sunucudan kimliği doğrula
          getUserProfile(t)
            .then(server => {
              if (!mounted) return
              setUser({
                email: (server?.email || p.sub || '').trim(),
                name: server?.name || p.name || '',
                surname: server?.surname || p.surname || '',
                role: server?.role || p.role || '',
                userId: server?.userID ?? server?.userId ?? p.userID ?? p.userId ?? null,
              })
              setLoading(false)
            })
            .catch((err) => {
              if (!mounted) return
              // API hatası olsa bile JWT'den kullanıcı bilgilerini kullan
              console.warn('[AuthContext] getUserProfile failed, using JWT data:', err)
              setUser({
                email: (p.sub || '').trim(),
                name: p.name || '',
                surname: p.surname || '',
                role: p.role || '',
                userId: p.userID ?? p.userId ?? null,
              })
              setLoading(false)
            })
        } else if (refreshTokenValue && !isTokenExpired(refreshTokenValue)) {
          // Access token expire olmuş ama refresh token hala geçerli, yenile
          refreshTokenApi(refreshTokenValue)
            .then((result) => {
              if (!mounted || !result) return
              const { accessToken, refreshToken: newRefreshToken } = result
              const p = parseJwt(accessToken)
              setToken(accessToken)
              try { configureApiClient(accessToken) } catch {}
              // Aynı storage tipini kullan (localStorage veya sessionStorage)
              setAuthStorage({ accessToken, refreshToken: newRefreshToken }, storage === localStorage)
              return getUserProfile(accessToken)
                .then(server => {
                  if (!mounted) return
                  setUser({
                    email: (server?.email || p.sub || '').trim(),
                    name: server?.name || p.name || '',
                    surname: server?.surname || p.surname || '',
                    role: server?.role || p.role || '',
                    userId: server?.userID ?? server?.userId ?? p.userID ?? p.userId ?? null,
                  })
                  setLoading(false)
                })
                .catch((err) => {
                  if (!mounted) return
                  // API hatası olsa bile JWT'den kullanıcı bilgilerini kullan
                  console.warn('[AuthContext] getUserProfile failed after refresh, using JWT data:', err)
                  setUser({
                    email: (p.sub || '').trim(),
                    name: p.name || '',
                    surname: p.surname || '',
                    role: p.role || '',
                    userId: p.userID ?? p.userId ?? null,
                  })
                  setLoading(false)
                })
            })
            .catch((err) => {
              if (!mounted) return
              // Refresh token da geçersiz veya API hatası, çıkış yap
              console.warn('[AuthContext] refreshTokenApi failed:', err)
              removeAuthStorage()
              setLoading(false)
            })
        } else {
          removeAuthStorage()
          setLoading(false)
        }
      } catch {
        if (!mounted) return
        removeAuthStorage()
        setLoading(false)
      }
    return () => { mounted = false }
  }, [])

  async function login(email, password, rememberMe = true) {
    const { accessToken, refreshToken } = await loginUser({ email, password })
    if (!accessToken) throw new Error('Sunucudan accessToken alınamadı.')
    if (isTokenExpired(accessToken)) throw new Error('Oturum süresi geçmiş bir token döndü.')
    setToken(accessToken)
    try { configureApiClient(accessToken) } catch {}
    // Sunucudan kimliği al
    let profile
    try {
      const server = await getUserProfile(accessToken)
      profile = {
        email: (server?.email || '').trim(),
        name: server?.name || '',
        surname: server?.surname || '',
        role: server?.role || '',
        userId: server?.userID ?? server?.userId ?? null,
      }
    } catch {
      const p = parseJwt(accessToken)
      profile = {
        email: (p.sub || '').trim(),
        name: p.name || '',
        surname: p.surname || '',
        role: p.role || '',
        userId: p.userID ?? p.userId ?? null,
      }
    }
    setUser(profile)
    setAuthStorage({ accessToken, refreshToken }, rememberMe)
    return profile
  }

  function logout() {
    setToken(null)
    setUser(null)
    removeAuthStorage()
    try { setAuthToken(null) } catch {}
  }

  // --- Güncel signup akışı (userID yok, role: doctor|user) ---
  async function register({ name, surname, dateOfBirth, role, email, password }) {
    const res = await registerUser({ name, surname, dateOfBirth, role, email, password })

    // 1) API accessToken döndürürse direkt giriş yap
    const accessToken = res?.accessToken || res?.token
    // null kontrolü: null veya undefined değilse ve boş string değilse
    if (accessToken && accessToken !== null && accessToken !== 'null') {
      if (isTokenExpired(accessToken)) throw new Error('Oturum süresi geçmiş bir token döndü.')
      const p = parseJwt(accessToken)
      const profile = {
        email: (p.sub || '').trim(),
        name: p.name || '',
        surname: p.surname || '',
        role: p.role || '',
        userId: p.userID ?? p.userId ?? null
      }
      setToken(accessToken)
      try { configureApiClient(accessToken) } catch {}
      setUser(profile)
      const refreshToken = res?.refreshToken || null
      // Register'da varsayılan olarak rememberMe = true (kalıcı)
      setAuthStorage({ accessToken, refreshToken }, true)
      return true
    }

    // 2) Token null ise (API'den token gelmediyse) kayıt başarılı, login sayfasına yönlendirilecek
    // Otomatik login denemiyoruz, kullanıcı manuel olarak giriş yapacak
    return true
  }

  const refreshAccessToken = useCallback(async () => {
    const storageInfo = getAuthStorage()
    if (!storageInfo) throw new Error('Oturum bulunamadı.')
    
    try {
      const { storage, data: authData } = storageInfo
      const refreshTokenValue = authData.refreshToken
      if (!refreshTokenValue) throw new Error('Refresh token bulunamadı.')
      if (isTokenExpired(refreshTokenValue)) throw new Error('Refresh token süresi dolmuş.')
      
      const { accessToken, refreshToken: newRefreshToken } = await refreshTokenApi(refreshTokenValue)
      setToken(accessToken)
      try { configureApiClient(accessToken) } catch {}
      // Aynı storage tipini kullan (localStorage veya sessionStorage)
      setAuthStorage({ accessToken, refreshToken: newRefreshToken }, storage === localStorage)
      return accessToken
    } catch (error) {
      logout()
      throw error
    }
  }, [])

  function updateProfile(patch) {
    setUser(u => ({ ...u, ...patch }))
  }

  // Refresh callback'i global olarak kaydet
  useEffect(() => {
    setRefreshCallback(refreshAccessToken)
    return () => {
      setRefreshCallback(null)
    }
  }, [refreshAccessToken])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token && !!user, loading, login, logout, register, updateProfile, refreshAccessToken }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
