// Tema FOUC önleyici - index.html'den React'tan önce çağrılır (CSP inline
// script'e izin vermediği için ayrı dosya). AccessibilityContext ile aynı
// anahtar. Kayıtlı tercih yoksa cihazın açık/koyu ayarı izlenir.
(function () {
  var mode = 'light';
  try {
    var raw = localStorage.getItem('sagliktan:accessibility');
    var saved = raw ? JSON.parse(raw).themeMode : null;
    if (saved === 'light' || saved === 'dark') {
      mode = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      mode = 'dark';
    }
  } catch {
    mode = 'light';
  }
  document.documentElement.dataset.theme = mode;
})();
