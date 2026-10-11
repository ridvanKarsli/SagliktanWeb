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
.sm-bubble.sm-d2{animation-delay:-.6s}
.sm-tv-a{animation:sm-tv-a 7s ease-in-out infinite}
.sm-tv-b{animation:sm-tv-b 5s ease-in-out infinite}
.sm-tv-c{animation:sm-tv-c 3.4s ease-in-out infinite}
.sm-tv-cast{animation:sm-tv-cast 2.2s ease-in-out infinite}
@keyframes sm-tv-a{0%,100%{fill:#9FD8F5}33%{fill:#F9C9A8}66%{fill:#C9BDF2}}
@keyframes sm-tv-b{0%,100%{fill:#8FD3A0}50%{fill:#F2A7B5}}
@keyframes sm-tv-c{0%,100%{opacity:1;transform:translateX(0)}50%{opacity:.6;transform:translateX(-6px)}}
@keyframes sm-tv-cast{0%,100%{opacity:.18}40%{opacity:.3}70%{opacity:.22}}
.sm-beam{transform-box:fill-box;transform-origin:center;animation:sm-beam 6s ease-in-out infinite}
@keyframes sm-beam{0%,100%{transform:scaleX(1)}50%{transform:scaleX(-1)}}
.sm-fx-rise{animation:sm-fx-rise 2.7s ease-out infinite}
.sm-fx-z{animation:sm-fx-z 3s ease-out infinite}
.sm-fx-twinkle{transform-box:fill-box;transform-origin:center;animation:sm-fx-twinkle 1.8s ease-in-out infinite}
.sm-fx-pop{transform-box:fill-box;transform-origin:center;animation:sm-fx-pop 2.4s ease-out infinite}
.sm-fx-bub{animation:sm-fx-bub 2.4s ease-in infinite}
@keyframes sm-fx-rise{0%{transform:translate(0,0);opacity:0}15%{opacity:1}50%{transform:translate(4px,-14px)}100%{transform:translate(-2px,-30px);opacity:0}}
@keyframes sm-fx-z{0%{transform:translate(0,0) scale(.7);opacity:0}20%{opacity:1}100%{transform:translate(12px,-24px) scale(1.1);opacity:0}}
@keyframes sm-fx-twinkle{0%,100%{transform:scale(.3);opacity:0}50%{transform:scale(1);opacity:1}}
@keyframes sm-fx-pop{0%{transform:scale(0);opacity:0}20%{transform:scale(1.15);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:0}}
@keyframes sm-fx-bub{0%{transform:translateY(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-22px);opacity:0}}
.sm-rain{animation:sm-rain .45s linear infinite}
.sm-rain.sm-slow{animation-duration:.7s}
@keyframes sm-rain{to{transform:translateY(60px)}}
.sm-snow{animation:sm-snow 7s linear infinite}
.sm-snow.sm-slow{animation-duration:11s}
@keyframes sm-snow{to{transform:translate(-20px,80px)}}
.sm-drift{animation:sm-drift var(--sm-dur,90s) linear infinite}
@keyframes sm-drift{from{transform:translateX(0)}to{transform:translateX(var(--sm-dx,1600px))}}
.sm-fog{animation:sm-fog 18s ease-in-out infinite alternate}
@keyframes sm-fog{from{transform:translateX(-40px)}to{transform:translateX(40px)}}
.sm-twinkle{animation:sm-twinkle 3.2s ease-in-out infinite}
.sm-twinkle.sm-d1{animation-delay:-1.6s}
@keyframes sm-twinkle{0%,100%{opacity:.35}50%{opacity:1}}
.sm-win-rain{animation:sm-win-rain .6s linear infinite}
@keyframes sm-win-rain{to{transform:translateY(12px)}}
@media (prefers-reduced-motion: reduce){
  .sm-tv-a,.sm-tv-b,.sm-tv-c,.sm-tv-cast,.sm-beam,.sm-fx-rise,.sm-fx-z,.sm-fx-twinkle,.sm-fx-pop,.sm-fx-bub,
  .sm-rain,.sm-snow,.sm-drift,.sm-fog,.sm-twinkle,.sm-win-rain{animation:none!important}
  .sm-fx-rise,.sm-fx-z,.sm-fx-twinkle,.sm-fx-pop,.sm-fx-bub{opacity:.85}
}
.sm-breathe{transform-box:fill-box;transform-origin:center;transition:transform .35s linear}
.sm-wave{animation:sm-wave 16s linear infinite}
.sm-wave.sm-rev{animation-direction:reverse}
@keyframes sm-wave{to{transform:translateX(var(--sm-wl,-80px))}}
.sm-foam{animation:sm-foam 6s ease-in-out infinite alternate}
@keyframes sm-foam{from{transform:translateY(0)}to{transform:translateY(4px)}}
@media (prefers-reduced-motion: reduce){
  .sm-wave,.sm-foam{animation:none!important}
  .sm-breathe{transition:none!important}
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
