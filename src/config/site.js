// Site genelinde tek yerden yönetilen sabitler.

// Sitenin herkese açık adresi (paylaşım bağlantıları ve QR kodlar için).
// Test ortamında kendi adresini üretsin diye varsayılan, sayfanın açıldığı
// adrestir; gerekirse VITE_SITE_URL ile ezilir.
export const SITE_URL = (import.meta.env.VITE_SITE_URL?.trim() || window.location.origin).replace(/\/$/, '')

// Görsellerde yazılan kısa alan adı ("sagliktan.com").
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '').replace(/^www\./, '')

// Kriz anında yönlendirilen hat. Numara değişirse yalnızca burası güncellenir.
export const CRISIS_LINE = Object.freeze({
  number: '112',
  name: '112 Acil Çağrı Merkezi',
  tel: 'tel:112',
})
