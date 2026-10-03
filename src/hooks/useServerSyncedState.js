import { useState } from 'react'

// İyimser (optimistic) güncellenen yerel bir kopya: kullanıcı etkileşimi
// yerel değeri anında değiştirir; sunucudan gelen değer (prop) değişirse -
// ör. liste yenilendiğinde - ve o an bekleyen bir istek yoksa yerel kopya
// sunucu değerine eşitlenir. Aksi halde bileşen ilk mount'taki değerde
// takılı kalıyordu (aşağı çekip yenileyince eski sayaçlar görünüyordu).
//
// serverValue düz bir obje olmalı; karşılaştırma alan bazında sığdır.
export function useServerSyncedState(serverValue, { paused = false } = {}) {
  const [local, setLocal] = useState(serverValue)
  const [lastServer, setLastServer] = useState(serverValue)

  if (!paused && !shallowEqual(lastServer, serverValue)) {
    setLastServer(serverValue)
    setLocal(serverValue)
  }

  return [local, setLocal]
}

function shallowEqual(a, b) {
  const keys = Object.keys(b)
  return keys.length === Object.keys(a).length && keys.every(k => Object.is(a[k], b[k]))
}
