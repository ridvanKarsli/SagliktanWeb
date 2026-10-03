// Öğeyi ekranda göstermeden DOM'da (ve ekran okuyucuda) tutan stil.
// Sayaçlar 0 iken bile DOM'da kalmalı: E2E sözleşmesi (bkz.
// e2e/reactions.spec.js) bu metinleri okuyor.
export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap'
}
