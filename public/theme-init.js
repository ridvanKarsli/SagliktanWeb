// Tema + yazı boyutu FOUC önleyici - index.html'den React'tan önce çağrılır
// (CSP inline script'e izin vermediği için ayrı dosya). AccessibilityContext
// ile aynı anahtar ve aynı ölçek tablosu. Kayıtlı tema yoksa cihazın
// açık/koyu ayarı izlenir. Yazı ölçeği de burada yazılır: "Büyük" seçmiş bir
// üyede sayfa önce %100 boyanıp React gelince %125'e sıçrıyordu (reflow).
(function () {
  var mode = 'light';
  var fontSize = '';
  var SCALES = { small: '93.75%', medium: '100%', large: '112.5%', xlarge: '125%' };
  try {
    var raw = localStorage.getItem('sagliktan:accessibility');
    var prefs = raw ? JSON.parse(raw) : null;
    var saved = prefs ? prefs.themeMode : null;
    if (saved === 'light' || saved === 'dark') {
      mode = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      mode = 'dark';
    }
    if (prefs && SCALES[prefs.fontScale]) fontSize = SCALES[prefs.fontScale];
  } catch {
    mode = 'light';
  }
  document.documentElement.dataset.theme = mode;
  if (fontSize) document.documentElement.style.fontSize = fontSize;
})();
