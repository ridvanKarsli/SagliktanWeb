// Tarayıcının yerleşik konuşma API'leri (sesle yazma / sesli okuma) için
// küçük yardımcılar - bkz. components/a11y/DictationButton, ReadAloudButton.

export function getRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isDictationSupported() {
  return !!getRecognitionCtor()
}

// Dikte edilen parçayı mevcut metne doğal biçimde ekler (araya boşluk koyar).
export function appendDictation(current, piece) {
  const base = current || ''
  if (!base) return piece
  return /\s$/.test(base) ? base + piece : `${base} ${piece}`
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}
