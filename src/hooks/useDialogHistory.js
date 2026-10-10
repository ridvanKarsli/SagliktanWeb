import { useEffect, useRef } from 'react'

// Tam ekran pencere/alt sayfalarda Android "Geri" tuşu (ve iOS kenar
// kaydırması) pencereyi kapatsın, sayfadan çıkmasın. Pencere açılınca
// geçmişe aynı URL ile bir kayıt eklenir; kullanıcı Geri'ye basınca popstate
// gelir ve pencere kapanır. Pencere düğmeyle kapanırsa, eklediğimiz kayıt
// hâlâ en üstteyse history.back() ile geri alınır (geçmişte hayalet kayıt
// kalmasın).
//
// react-router ile uyum: pushState'e react-router'ın kendi state'i
// ({ usr, key, idx }) olduğu gibi kopyalanır. Böylece Geri'de router aynı
// location.key'i görür - sayfa yeniden mount olmaz, kaydırma geri yükleme
// (useScrollRestoration, aynı key'de atlar) ve RouteErrorBoundary (resetKey)
// etkilenmez. Geri'de router yine de POP ile yeniden render eder; bu
// zararsızdır.
//
// Pencere açıkken sayfa router ile değişirse (ör. üye listesinden bir
// profile gidildi) bizim kayıt alt sırada kalır; kullanıcı oraya geri
// dönünce sahipsiz kayıt otomatik atlanır (aşağıdaki global dinleyici).
const STATE_FLAG = 'sgDialog'
const activeDialogs = new Set()
let nextId = 1
let globalListenerInstalled = false

function stateIsOurs(state) {
  return !!(state && state[STATE_FLAG])
}

function installGlobalListener() {
  if (globalListenerInstalled || typeof window === 'undefined') return
  globalListenerInstalled = true
  window.addEventListener('popstate', () => {
    const state = window.history.state
    // Sahipsiz pencere kaydına (pencere artık ekranda değil) gelindi: atla.
    if (stateIsOurs(state) && !activeDialogs.has(state[STATE_FLAG])) {
      window.history.back()
    }
  })
}

export function useDialogHistory(open, onClose) {
  const idRef = useRef(0)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined
    installGlobalListener()

    const id = nextId++
    idRef.current = id
    activeDialogs.add(id)
    try {
      const current = window.history.state || {}
      // En üstte sahipsiz bir pencere kaydı varsa (StrictMode'un çift
      // effect'i, ya da hızlı kapat-aç) yenisini eklemek yerine onu devral.
      if (stateIsOurs(current) && !activeDialogs.has(current[STATE_FLAG])) {
        window.history.replaceState({ ...current, [STATE_FLAG]: id }, '')
      } else {
        window.history.pushState({ ...current, [STATE_FLAG]: id }, '')
      }
    } catch {
      // pushState engellendiyse (nadir WebView) pencere yine düğmeyle kapanır.
      activeDialogs.delete(id)
      return undefined
    }

    const onPop = () => {
      // Kaydımız artık en üstte değilse kullanıcı Geri'ye basmıştır.
      if (window.history.state?.[STATE_FLAG] !== id) {
        activeDialogs.delete(id)
        onCloseRef.current?.()
      }
    }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('popstate', onPop)
      // Programatik kapanış (düğme, başarı, unmount): kaydımız hâlâ üstteyse
      // geri al. Değilse (sayfa değişmiş) dokunma - global dinleyici halleder.
      if (activeDialogs.has(id)) {
        activeDialogs.delete(id)
        // Bir tık ertelenir: aynı anda açılan yeni bir pencere kaydı
        // devralmış olabilir (o zaman geri gitmek onu kapatırdı).
        setTimeout(() => {
          if (window.history.state?.[STATE_FLAG] === id) window.history.back()
        }, 0)
      }
    }
  }, [open])
}
