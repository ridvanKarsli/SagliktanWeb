// Oyun arayüzünün küçük animasyonları (konuşma balonu, zıplama, dokunma
// işareti). Çizim setindeki gibi modül yüklenince <head>'e bir kez eklenir;
// hareket azaltma tercihinde durur.
const CSS = `
.smg-hop{animation:smg-hop .7s cubic-bezier(.3,.7,.4,1) 1}
@keyframes smg-hop{0%,100%{transform:translateY(0)}30%{transform:translateY(-12px)}55%{transform:translateY(0)}72%{transform:translateY(-5px)}}
.smg-bubble{transform-box:fill-box;transform-origin:50% 100%;animation:smg-pop .28s cubic-bezier(.3,1.4,.5,1) 1 both}
@keyframes smg-pop{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}
.smg-marker{transform-box:fill-box;transform-origin:center;animation:smg-pulse 1.1s ease-in-out infinite}
@keyframes smg-pulse{0%,100%{opacity:.55;transform:scale(.86)}50%{opacity:.9;transform:scale(1)}}
.smg-glow{animation:smg-glow 1.8s ease-in-out infinite}
@keyframes smg-glow{0%,100%{box-shadow:0 0 0 0 rgba(242,163,58,.55),0 4px 14px rgba(18,60,50,.18)}50%{box-shadow:0 0 0 8px rgba(242,163,58,0),0 4px 14px rgba(18,60,50,.18)}}
.smg-fade{transition:opacity .32s ease}
.smg-ghost{animation:smg-ghost 1.2s ease-in-out infinite}
@keyframes smg-ghost{0%,100%{opacity:.62}50%{opacity:.85}}
@media (prefers-reduced-motion: reduce){
  .smg-hop,.smg-bubble,.smg-marker,.smg-glow,.smg-ghost{animation:none!important}
  .smg-fade{transition:opacity .12s linear}
}
`

let injected = false
export function injectGameStyles() {
  if (injected || typeof document === 'undefined') return
  injected = true
  if (document.getElementById('smg-css')) return
  const el = document.createElement('style')
  el.id = 'smg-css'
  el.textContent = CSS
  document.head.appendChild(el)
}

injectGameStyles()

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
