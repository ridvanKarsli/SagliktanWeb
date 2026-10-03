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

// Uygulama BAŞARIYLA açıldıktan bir süre sonra bayrağı temizle. Aksi halde
// SW kaynaklı tek bir reload'dan sonra bayrak sekmenin ömrü boyunca set
// kalıyor ve saatler sonra gerçekleşen gerçek bir chunk hatasında otomatik
// kurtarma yerine hata ekranı gösteriliyordu. Gecikme, reload sonrası anında
// tekrar patlayan bir hatanın döngüye girmemesi için.
export function clearChunkReloadFlagAfterBoot(delayMs = 15000) {
  if (!hasAttemptedChunkReload()) return
  window.setTimeout(() => {
    try { sessionStorage.removeItem(FLAG_KEY) } catch { /* depo erişilemez */ }
  }, delayMs)
}
