import { useCallback, useEffect, useRef, useState } from 'react'
import { isAbortError } from '../services/api.js'
import { onListRefresh } from '../utils/listRefreshBus.js'

const contentOf = (res) => (Array.isArray(res?.content) ? res.content : [])

// ---- Modül düzeyi liste önbelleği (SWR) ----
// Akış, alt grup listesi, kaydedilenler gibi listeler route değişince
// unmount olur; kullanıcı bir gönderiye girip geri döndüğünde liste
// sıfırdan yükleniyor (iskelet + kaydırma konumu kaybı) - mobilde en çok
// hissedilen yavaşlık buydu. cacheKey veren çağıranlar için son durum
// burada tutulur: yeniden mount olunca (5 dk içindeyse) anında bu veriyle
// başlanır, arka planda ilk sayfa tazelenir (stale-while-revalidate).
// Kaydırma konumu burada değil ResponsiveShell'de (location.key bazlı).
const CACHE_TTL_MS = 5 * 60 * 1000
const listCache = new Map()

function readCache(key) {
  if (!key) return null
  const hit = listCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.ts > CACHE_TTL_MS) { listCache.delete(key); return null }
  return hit
}

// Belirli bir önekle başlayan tüm girdileri düşür (ör. gönderi paylaşıldı ->
// 'feed:' ile başlayanlar). Öneksiz çağrı her şeyi temizler (çıkış).
export function invalidateListCache(prefix) {
  if (!prefix) { listCache.clear(); return }
  for (const key of listCache.keys()) if (key.startsWith(prefix)) listCache.delete(key)
}

// Taze ilk sayfayı, kullanıcının zaten yüklediği (belki 3 sayfalık) listeyle
// birleştir: taze sayfadaki öğeler kendi sırasıyla en üstte (yeni gelenler
// dahil, mevcutlar güncel haliyle), ardından önbellekte olup taze sayfada
// görünmeyenler. Böylece arka plan tazelemesi listeyi 1 sayfaya indirip
// kaydırma konumunu boşa çıkarmaz.
function mergeFresh(freshItems, cachedItems) {
  const freshIds = new Set(freshItems.map(it => it?.id))
  return [...freshItems, ...cachedItems.filter(it => !freshIds.has(it?.id))]
}

// Backend'in sayfalı ({content, last, totalElements}) döndürdüğü herhangi bir
// listeyi "ilk sayfayı yükle + Daha Fazla Yükle ile devamını ekle" deseniyle
// yöneten ortak hook.
//
// fetchPage(pageNum, { signal }) -> Promise<{ content, last, totalElements? }>
//   signal: istek geçersizleştiğinde (deps değişti, unmount, reload) iptal
//   edilir - fetchPage bunu api.js fonksiyonlarına iletmeli ki ağdaki istek
//   gerçekten kesilsin (yalnızca yanıtı yoksaymak yerine).
//
// options:
//   enabled  - false ise hiç fetch etmez (ör. henüz açılmamış bir sekme/dialog).
//   once     - true ise ilk başarılı yüklemeden sonra enabled tekrar
//              false/true olsa bile yeniden fetch etmez (ör. bir kez açılıp
//              cache'lenen "Kaydedilenler" sekmesi ya da "Üyeler" dialogu).
//   deps     - fetchPage'in kapattığı, değişince page 0'dan yeniden fetch
//              tetiklemesi gereken değerler (ör. [token, sort, query]).
//   cacheKey - verilirse liste modül önbelleğine yazılır/okunur (yukarıya
//              bakın). deps'i yansıtan benzersiz bir anahtar olmalı
//              (ör. `feed:${tab}:${sort}`); null/undefined ise önbellek yok.
//   onError  - (err, phase) => void; phase 'initial' | 'loadMore'.
//              İptal (AbortError) hataları buraya hiç düşmez.
//
// Yarış koruması: her yükleme bir "nesil" numarası alır. deps değişince ya da
// reload() çağrılınca nesil artar; eski nesle ait (yavaş gelen) bir yanıt -
// ilk sayfa da olsa "daha fazla" da olsa - artık geçerli listeye yazılmaz ve
// o neslin AbortController'ı iptal edilir. Bileşen unmount olunca da aynı.
export function usePaginatedList(fetchPage, { enabled = true, once = false, deps = [], cacheKey = null, onError } = {}) {
  // İlk render'da önbellek varsa iskelet hiç görünmesin diye state'ler
  // doğrudan önbellekten başlatılır.
  const initial = useRef(readCache(cacheKey)).current
  const [items, setItems] = useState(initial?.items ?? [])
  const [page, setPage] = useState(initial?.page ?? 0)
  const [last, setLast] = useState(initial?.last ?? true)
  const [totalCount, setTotalCount] = useState(initial?.totalCount ?? 0)
  const [loading, setLoading] = useState(enabled && !initial)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPageRef = useRef(fetchPage)
  fetchPageRef.current = fetchPage
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const loadedOnceRef = useRef(!!initial)
  const generationRef = useRef(0)
  const controllerRef = useRef(null)
  const loadingMoreRef = useRef(false)
  const cacheKeyRef = useRef(cacheKey)
  cacheKeyRef.current = cacheKey
  // Önbelleğe yazarken güncel değerleri okumak için (effect bağımlılığı
  // yerine ref: her değişimde değil, anlamlı anlarda yazılır).
  const snapshotRef = useRef({ items, page, last, totalCount })
  snapshotRef.current = { items, page, last, totalCount }

  // key parametresi: effect cleanup'ında ref çoktan YENİ anahtarı
  // gösteriyor olabilir (ref render sırasında güncellenir), eski listeyi
  // yeni anahtara yazmamak için anahtar kurulum anında yakalanıp verilir.
  const writeCache = useCallback((ts, key = cacheKeyRef.current) => {
    if (!key) return
    const prev = listCache.get(key)
    listCache.set(key, { ...snapshotRef.current, ts: ts ?? prev?.ts ?? Date.now() })
  }, [])

  // Yeni bir nesil başlat: önceki neslin isteğini iptal et.
  const nextGeneration = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const generation = ++generationRef.current
    return { generation, signal: controller.signal, isCurrent: () => generation === generationRef.current }
  }, [])

  // mode: 'skeleton' (liste boş, iskelet göster) | 'revalidate' (eldeki
  // liste ekranda kalır, taze ilk sayfa sessizce birleştirilir).
  const loadFirstPage = useCallback((mode = 'skeleton') => {
    const { signal, isCurrent } = nextGeneration()
    loadingMoreRef.current = false
    setLoadingMore(false)
    if (mode === 'skeleton') {
      setLoading(true)
      setPage(0)
    }
    return fetchPageRef.current(0, { signal })
      .then(res => {
        if (!isCurrent()) return
        const fresh = contentOf(res)
        if (mode === 'revalidate' && snapshotRef.current.page > 0) {
          setItems(prev => mergeFresh(fresh, prev))
          // page/last: kullanıcının yüklediği derinlik korunur.
        } else {
          setItems(fresh)
          setLast(res?.last ?? true)
          setPage(0)
        }
        // Slice tabanlı uçlar (akış, bildirimler, mesajlar) toplam sayı
        // bilmediği için -1 döner (bkz. backend PageResponse.fromSlice);
        // ekranda eksi bir sayı görünmesin.
        setTotalCount(Math.max(0, res?.totalElements ?? 0))
        loadedOnceRef.current = true
        // State güncellemeleri bir sonraki render'da uygulanır; önbelleğe
        // yazımı onlardan sonra yap (microtask yeterli değil, macrotask).
        setTimeout(() => { if (isCurrent()) writeCache(Date.now()) }, 0)
      })
      .catch(err => { if (isCurrent() && !isAbortError(err)) onErrorRef.current?.(err, 'initial') })
      .finally(() => { if (isCurrent()) setLoading(false) })
  }, [nextGeneration, writeCache])

  // Süren isteklerin yanıtlarını geçersiz kılar ve ağdaki isteği keser
  // (unmount ya da deps değişimi).
  const invalidatePending = useCallback(() => {
    generationRef.current += 1
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  // Önbellekli ilk mount'ta zaten dolu geldik: ilk effect sadece tazeler.
  const hydratedRef = useRef(!!initial)

  useEffect(() => {
    if (!enabled || (once && loadedOnceRef.current && !hydratedRef.current)) {
      setLoading(false)
      return undefined
    }
    const keyAtSetup = cacheKeyRef.current
    if (hydratedRef.current) {
      hydratedRef.current = false
      loadFirstPage('revalidate')
    } else {
      // deps değişti (yeni sekme/sıralama): o anahtarın önbelleği varsa
      // yine iskeletsiz başla.
      const hit = readCache(cacheKeyRef.current)
      if (hit) {
        setItems(hit.items); setPage(hit.page); setLast(hit.last); setTotalCount(hit.totalCount)
        setLoading(false)
        loadedOnceRef.current = true
        // snapshotRef bir sonraki render'da güncellenir; birleştirme için
        // şimdiden doğru derinliği bilsin.
        snapshotRef.current = { items: hit.items, page: hit.page, last: hit.last, totalCount: hit.totalCount }
        loadFirstPage('revalidate')
      } else {
        setItems([])
        loadFirstPage('skeleton')
      }
    }
    return () => {
      // Ayrılırken son durumu önbelleğe yaz (ts korunur - "tazelik" ağdan
      // gelen son başarılı yanıta aittir, unmount anına değil).
      writeCache(undefined, keyAtSetup)
      invalidatePending()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, once, ...deps])

  // Çevrimiçi'ye dönünce (bkz. ResponsiveShell) açık listeyi sessizce tazele.
  useEffect(() => {
    if (!enabled) return undefined
    return onListRefresh(() => {
      loadFirstPage(snapshotRef.current.items.length > 0 ? 'revalidate' : 'skeleton')
    })
  }, [enabled, loadFirstPage])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return
    const generation = generationRef.current
    const signal = controllerRef.current?.signal
    const nextPage = page + 1
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const res = await fetchPageRef.current(nextPage, { signal })
      if (generation !== generationRef.current) return
      // Offset sayfalama + araya giren yeni kayıtlar aynı öğeyi iki sayfada
      // döndürebilir; tekrar eden id'leri ekleme (React key çakışması olmasın).
      setItems(prev => {
        const known = new Set(prev.map(it => it?.id))
        return [...prev, ...contentOf(res).filter(it => !known.has(it?.id))]
      })
      setLast(res?.last ?? true)
      setPage(nextPage)
      setTimeout(() => { if (generation === generationRef.current) writeCache() }, 0)
    } catch (err) {
      if (generation === generationRef.current && !isAbortError(err)) onErrorRef.current?.(err, 'loadMore')
    } finally {
      if (generation === generationRef.current) {
        loadingMoreRef.current = false
        setLoadingMore(false)
      }
    }
  }, [page, writeCache])

  // reload(): önbelleği ATLAR - kullanıcı açıkça "yenile" dedi (pull-to-
  // refresh, hata sonrası tekrar dene, gönderi paylaşıldı); iskelet göster.
  const reload = useCallback(() => loadFirstPage('skeleton'), [loadFirstPage])

  return { items, setItems, loading, loadingMore, last, totalCount, setTotalCount, loadMore, reload }
}
