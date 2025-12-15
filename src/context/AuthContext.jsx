import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
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
  const p = parseJwt(token)
  if (!p?.exp) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return p.exp <= nowSec
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      try {
        const authData = JSON.parse(saved)
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
              setUser({
                email: (server?.email || p.sub || '').trim(),
                name: server?.name || p.name || '',
                surname: server?.surname || p.surname || '',
                role: server?.role || p.role || '',
                userId: server?.userID ?? server?.userId ?? p.userID ?? p.userId ?? null,
              })
            })
            .catch(() => {
              setUser({
                email: (p.sub || '').trim(),
                name: p.name || '',
                surname: p.surname || '',
                role: p.role || '',
                userId: p.userID ?? p.userId ?? null,
              })
            })
        } else if (refreshTokenValue && !isTokenExpired(refreshTokenValue)) {
          // Access token expire olmuş ama refresh token hala geçerli, yenile
          refreshTokenApi(refreshTokenValue)
            .then(({ accessToken, refreshToken: newRefreshToken }) => {
              const p = parseJwt(accessToken)
              setToken(accessToken)
              try { configureApiClient(accessToken) } catch {}
              localStorage.setItem('auth', JSON.stringify({ accessToken, refreshToken: newRefreshToken }))
              getUserProfile(accessToken)
                .then(server => {
                  setUser({
                    email: (server?.email || p.sub || '').trim(),
                    name: server?.name || p.name || '',
                    surname: server?.surname || p.surname || '',
                    role: server?.role || p.role || '',
                    userId: server?.userID ?? server?.userId ?? p.userID ?? p.userId ?? null,
                  })
                })
                .catch(() => {
                  setUser({
                    email: (p.sub || '').trim(),
                    name: p.name || '',
                    surname: p.surname || '',
                    role: p.role || '',
                    userId: p.userID ?? p.userId ?? null,
                  })
                })
            })
            .catch(() => {
              // Refresh token da geçersiz, çıkış yap
              localStorage.removeItem('auth')
            })
        } else {
          localStorage.removeItem('auth')
        }
      } catch {
        localStorage.removeItem('auth')
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
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
    localStorage.setItem('auth', JSON.stringify({ accessToken, refreshToken }))
    return profile
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth')
    try { setAuthToken(null) } catch {}
  }

  // --- Güncel signup akışı (userID yok, role: doctor|user) ---
  async function register({ name, surname, dateOfBirth, role, email, password }) {
    const res = await registerUser({ name, surname, dateOfBirth, role, email, password })

    // 1) API accessToken döndürürse direkt giriş
    const accessToken = res?.accessToken || res?.token
    if (accessToken) {
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
      localStorage.setItem('auth', JSON.stringify({ accessToken, refreshToken }))
      return true
    }

    // 2) Token yoksa email+password ile login dene
    await login(email, password)
    return true
  }

  async function refreshAccessToken() {
    const saved = localStorage.getItem('auth')
    if (!saved) throw new Error('Oturum bulunamadı.')
    try {
      const authData = JSON.parse(saved)
      const refreshTokenValue = authData.refreshToken
      if (!refreshTokenValue) throw new Error('Refresh token bulunamadı.')
      if (isTokenExpired(refreshTokenValue)) throw new Error('Refresh token süresi dolmuş.')
      
      const { accessToken, refreshToken: newRefreshToken } = await refreshTokenApi(refreshTokenValue)
      setToken(accessToken)
      try { configureApiClient(accessToken) } catch {}
      localStorage.setItem('auth', JSON.stringify({ accessToken, refreshToken: newRefreshToken }))
      return accessToken
    } catch (error) {
      logout()
      throw error
    }
  }

  function updateProfile(patch) {
    setUser(u => ({ ...u, ...patch }))
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token && !!user, loading, login, logout, register, updateProfile, refreshAccessToken }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
