import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../services/api.js'
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
        const { token: t } = JSON.parse(saved)
        if (t && !isTokenExpired(t)) {
          const p = parseJwt(t)
          setToken(t)
          try { configureApiClient(t) } catch {}
          setUser({
            email: (p.sub || '').trim(),
            name: p.name || '',
            surname: p.surname || '',
            role: p.role || '',
            userId: p.userID ?? p.userId ?? null
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
    const { token: t } = await loginUser({ email, password })
    if (isTokenExpired(t)) throw new Error('Oturum süresi geçmiş bir token döndü.')
    const p = parseJwt(t)
    const profile = {
      email: (p.sub || '').trim(),
      name: p.name || '',
      surname: p.surname || '',
      role: p.role || '',
      userId: p.userID ?? p.userId ?? null
    }
    setToken(t)
    try { configureApiClient(t) } catch {}
    setUser(profile)
    localStorage.setItem('auth', JSON.stringify({ token: t }))
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

    // 1) API token döndürürse direkt giriş
    if (res?.token) {
      const t = res.token
      if (isTokenExpired(t)) throw new Error('Oturum süresi geçmiş bir token döndü.')
      const p = parseJwt(t)
      const profile = {
        email: (p.sub || '').trim(),
        name: p.name || '',
        surname: p.surname || '',
        role: p.role || '',
        userId: p.userID ?? p.userId ?? null
      }
      setToken(t)
      try { configureApiClient(t) } catch {}
      setUser(profile)
      localStorage.setItem('auth', JSON.stringify({ token: t }))
      return true
    }

    // 2) Token yoksa email+password ile login dene
    await login(email, password)
    return true
  }

  function updateProfile(patch) {
    setUser(u => ({ ...u, ...patch }))
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token && !!user, loading, login, logout, register, updateProfile }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
