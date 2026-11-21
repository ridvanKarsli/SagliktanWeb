// Ziyaretçi bir paylaşım bağlantısıyla geldiyse (ör. hikâye kartındaki QR),
// kayıt ve girişten sonra o içeriğe dönebilsin diye hedef yol sekme boyunca
// saklanır. Yalnızca uygulama içi, bilinen biçimdeki yollar kabul edilir.
const KEY = 'sagliktan:afterAuthPath'
const ALLOWED = /^\/post\/\d+$/

export function rememberAfterAuthPath(path) {
  if (!ALLOWED.test(path || '')) return
  try { sessionStorage.setItem(KEY, path) } catch { /* depolama kapalıysa yönlendirme yapılmaz */ }
}

// Okur ve siler: hedef yalnızca bir kez kullanılır.
export function takeAfterAuthPath() {
  try {
    const path = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return ALLOWED.test(path || '') ? path : null
  } catch {
    return null
  }
}

// "?ref=post-123" -> "/post/123" (tanımıyorsa null).
export function pathFromRef(ref) {
  const m = /^post-(\d+)$/.exec(ref || '')
  return m ? `/post/${m[1]}` : null
}

// Çıkışta çağrılır: saklanan dönüş hedefi ve "rıza penceresini şimdilik
// kapat" tercihi aynı sekmede giriş yapan bir sonraki kullanıcıya taşınmaz.
export const CONSENT_GATE_DISMISSED_KEY = 'sagliktan:consentGateDismissed'
export function clearSessionPreferences() {
  try {
    sessionStorage.removeItem(KEY)
    sessionStorage.removeItem(CONSENT_GATE_DISMISSED_KEY)
  } catch { /* depolama kapalıysa temizlenecek bir şey yok */ }
}
