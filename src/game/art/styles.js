// Çizim setinin animasyon sınıfları. Modül yüklenince <head>'e bir kez eklenir;
// "prefers-reduced-motion: reduce" altında tüm hareketler durur.

export const ART_CSS = `
.sm-shimmer{animation:sm-shimmer 3.6s ease-in-out infinite}
.sm-shimmer.sm-d1{animation-delay:-1.2s}
.sm-shimmer.sm-d2{animation-delay:-2.4s}
@keyframes sm-shimmer{0%,100%{opacity:.25;transform:translateX(-2px)}50%{opacity:.85;transform:translateX(2px)}}
.sm-jet{stroke-dasharray:3 4;animation:sm-flow .8s linear infinite}
@keyframes sm-flow{to{stroke-dashoffset:-14}}
.sm-ripple{transform-box:fill-box;transform-origin:center;animation:sm-ripple 3s ease-out infinite}
.sm-ripple.sm-d1{animation-delay:-1.5s}
@keyframes sm-ripple{0%{transform:scale(.4);opacity:.8}100%{transform:scale(1.25);opacity:0}}
.sm-glow{animation:sm-glow 4s ease-in-out infinite}
@keyframes sm-glow{0%,100%{opacity:.55}50%{opacity:.9}}
.sm-flame{transform-box:fill-box;transform-origin:50% 100%;animation:sm-flame 1.1s ease-in-out infinite alternate}
.sm-flame.sm-d1{animation-delay:-.5s}
@keyframes sm-flame{0%{transform:scaleY(.86) skewX(-3deg)}100%{transform:scaleY(1.08) skewX(3deg)}}
.sm-bubble{animation:sm-bubble 2.4s linear infinite}
.sm-bubble.sm-d1{animation-delay:-1.2s}
@keyframes sm-bubble{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-16px);opacity:0}}
.sm-sway{transform-box:fill-box;transform-origin:50% 100%;animation:sm-sway 4.5s ease-in-out infinite alternate}
@keyframes sm-sway{0%{transform:rotate(-3deg)}100%{transform:rotate(3deg)}}
.sm-bob{animation:sm-bob 3.2s ease-in-out infinite alternate}
@keyframes sm-bob{0%{transform:translateY(0)}100%{transform:translateY(1.6px)}}
.sm-steam{animation:sm-steam 2.6s ease-in-out infinite}
.sm-steam.sm-d1{animation-delay:-1.3s}
@keyframes sm-steam{0%{transform:translateY(2px);opacity:0}40%{opacity:.8}100%{transform:translateY(-6px);opacity:0}}
.sm-walk .sm-leg-l,.sm-walk .sm-leg-r,.sm-walk .sm-arm-l,.sm-walk .sm-arm-r{transform-box:fill-box;transform-origin:50% 8%}
.sm-walk .sm-leg-l{animation:sm-swing .52s ease-in-out infinite alternate}
.sm-walk .sm-leg-r{animation:sm-swing .52s ease-in-out infinite alternate-reverse}
.sm-walk .sm-arm-l{animation:sm-swing-arm .52s ease-in-out infinite alternate-reverse}
.sm-walk .sm-arm-r{animation:sm-swing-arm .52s ease-in-out infinite alternate}
.sm-walk .sm-upper{animation:sm-step .26s ease-in-out infinite alternate}
@keyframes sm-swing{0%{transform:rotate(-16deg)}100%{transform:rotate(16deg)}}
@keyframes sm-swing-arm{0%{transform:rotate(-14deg)}100%{transform:rotate(14deg)}}
@keyframes sm-step{0%{transform:translateY(0)}100%{transform:translateY(-1.8px)}}
@media (prefers-reduced-motion: reduce){
  .sm-shimmer,.sm-jet,.sm-ripple,.sm-glow,.sm-flame,.sm-bubble,.sm-sway,.sm-bob,.sm-steam,
  .sm-walk .sm-leg-l,.sm-walk .sm-leg-r,.sm-walk .sm-arm-l,.sm-walk .sm-arm-r,.sm-walk .sm-upper{animation:none!important}
  .sm-bubble,.sm-steam{opacity:.6}
  .sm-ripple{opacity:.35}
}
`

let injected = false
export function injectArtStyles() {
  if (injected || typeof document === 'undefined') return
  injected = true
  if (document.getElementById('sm-art-css')) return
  const el = document.createElement('style')
  el.id = 'sm-art-css'
  el.textContent = ART_CSS
  document.head.appendChild(el)
}

injectArtStyles()
