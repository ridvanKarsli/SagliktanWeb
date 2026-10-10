// Minik bir yayın kanalı: "açık listeleri tazele" sinyali. Şu an tek
// kaynağı ResponsiveShell'in çevrimdışı -> çevrimiçi geçişi; usePaginatedList
// abone olur ve (önbelleği atlayarak) ilk sayfayı yeniden çeker. Bağlam/
// prop zinciri kurmaya değmeyecek kadar küçük bir ihtiyaç.
const listeners = new Set()

export function onListRefresh(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function emitListRefresh(reason = 'manual') {
  listeners.forEach((fn) => {
    try { fn(reason) } catch { /* bir dinleyicinin hatası diğerlerini engellemesin */ }
  })
}
