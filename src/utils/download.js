// Bir JS nesnesini JSON dosyası olarak indirir. URL'i hemen serbest
// bırakmak bazı tarayıcılarda (Safari) indirmeyi iptal ettiği için kısa
// bir gecikmeyle bırakılır.
export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
