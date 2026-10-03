// STOMP istemcileri için "her bağlantı denemesinde taze token" yardımcısı.
//
// Sorun: connectHeaders istemci oluşturulurken sabitleniyordu. Access token
// 1 saat sonra dolunca küçük bir ağ kesintisi bile stompjs'in 5 sn'de bir
// SÜRESİ DOLMUŞ JWT ile yeniden bağlanmaya çalışmasına (onStompError
// spam'i) yol açıyordu - ta ki herhangi bir REST isteği tesadüfen refresh
// tetikleyip context'teki `token` değişene kadar.
//
// Çözüm: stompjs `beforeConnect` kancası her (yeniden) bağlanmadan önce
// çağrılır; burada depodaki güncel token okunur, dolmuşsa AuthContext'in
// global refresh kilidi (attemptTokenRefresh) üzerinden yenilenir ve
// connectHeaders güncellenir.
function readStoredAccessToken() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem('auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.accessToken) return parsed.accessToken
      }
    } catch {
      // bozuk/erişilemeyen depo - diğerine bak
    }
  }
  return null
}

function isJwtExpired(token, bufferSeconds = 60) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload?.exp) return false
    return payload.exp <= Math.floor(Date.now() / 1000) + bufferSeconds
  } catch {
    return true
  }
}

export async function resolveFreshAccessToken(fallbackToken) {
  const stored = readStoredAccessToken() || fallbackToken
  if (stored && !isJwtExpired(stored)) return stored
  try {
    // Dinamik import: AuthContext -> services döngüsel bağımlılığını
    // yalnızca çağrı anında çöz (api.js'teki desenin aynısı).
    const { attemptTokenRefresh } = await import('../context/AuthContext.jsx')
    const refreshed = await attemptTokenRefresh()
    return refreshed || stored
  } catch {
    return stored
  }
}

export function attachFreshTokenBeforeConnect(client, initialToken) {
  client.beforeConnect = async () => {
    const fresh = await resolveFreshAccessToken(initialToken)
    if (fresh) client.connectHeaders = { Authorization: `Bearer ${fresh}` }
  }
}
