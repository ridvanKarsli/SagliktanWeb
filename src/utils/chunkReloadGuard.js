// Hem ErrorBoundary.jsx (chunk import hatası yakalandığında) hem de main.jsx
// (yeni bir service worker devreye girdiğinde) AYNI "bu sekimde zaten bir kez
// otomatik reload denedik" bayrağını kullanır - iki mekanizma birbirinden
// habersiz art arda reload tetiklerse sonsuz döngüye girebilirdi, ortak bir
// guard bu riski ortadan kaldırıyor (bkz. her iki dosyadaki kullanım notları).
const FLAG_KEY = 'sagliktan-chunk-reload-attempted'

// true dönerse zaten bir kez denenmiş demektir - çağıran taraf reload ETMEMELİ.
export function hasAttemptedChunkReload() {
  return !!sessionStorage.getItem(FLAG_KEY)
}

// Bayrağı işaretleyip sayfayı yeniler. İkinci kez çağrılırsa (guard zaten
// set edilmişse) hiçbir şey yapmaz - çağıran taraf yine de önce
// hasAttemptedChunkReload() ile kontrol etmeli, burası sadece son bir
// güvenlik katmanı.
export function reloadOnceForChunkError() {
  if (hasAttemptedChunkReload()) return
  sessionStorage.setItem(FLAG_KEY, '1')
  window.location.reload()
}
