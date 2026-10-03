// Tema FOUC önleyici - index.html'den çağrılır (bkz. oradaki not). CSP
// (script-src 'self') inline script'e izin vermediği için ayrı dosya.
// AccessibilityContext.jsx ile aynı STORAGE_KEY ('sagliktan:accessibility').
(function () {
  try {
    var raw = localStorage.getItem('sagliktan:accessibility');
    var mode = raw && JSON.parse(raw).themeMode === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = mode;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
