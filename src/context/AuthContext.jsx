import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loginUser, registerUser, getUserProfile, refreshToken as refreshTokenApi, logoutUser } from '../services/api.js'

// --- JWT yardımcıları (sadece expiry kontrolü için; kullanıcı bilgisi her zaman /users/me'den alınır) ---
function b64urlToUtf8(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4)
  const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/')
  try {
    return decodeURIComponent(
      atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
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
  const bufferSeconds = 120
  return p.exp <= (Math.floor(Date.now() / 1000) + bufferSeconds)
}

// Global refresh lock - aynı anda birden fazla refresh yapılmasını engelle.
// api.js'in 401 retry mantığı bunu kullanır.
let refreshPromise = null
let refreshCallback = null

export function setRefreshCallback(callback) {
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
    try { return { storage: localStorage, data: JSON.parse(localAuth) } } catch {}
  }
  const sessionAuth = sessionStorage.getItem('auth')
  if (sessionAuth) {
    try { return { storage: sessionStorage, data: JSON.parse(sessionAuth) } } catch {}
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
        removeAuthStorage()
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

  async function logout() {
    if (token) {
      try { await logoutUser(token) } catch { /* stateless JWT: sunucu tarafı invalidation yok, sessizce yut */ }
    }
    setToken(null)
    setUser(null)
    removeAuthStorage()
  }

  // Backend e-posta doğrulaması zorunlu kılıyor: register token döndürmez.
  // Kayıt sonrası kullanıcı e-postasındaki linke tıklayıp login sayfasına gelmeli.
  async function register({ email, password, firstName, lastName }) {
    const created = await registerUser({ email, password, firstName, lastName })
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
    const { accessToken, refreshToken: newRefreshToken } = await refreshTokenApi(refreshTokenValue)
    setToken(accessToken)
    setAuthStorage({ accessToken, refreshToken: newRefreshToken }, storage === localStorage)
    return accessToken
  }, [])

  function updateLocalUser(patch) {
    setUser(u => (u ? { ...u, ...patch } : u))
  }

  useEffect(() => {
    setRefreshCallback(refreshAccessToken)
    return () => setRefreshCallback(null)
  }, [refreshAccessToken])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token && !!user, loading, login, logout, register, updateLocalUser, refreshAccessToken }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
