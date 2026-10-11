// Nesne derinlik anahtarı. w×d ayak izli bir nesnenin ARKASINDAKİ hücrelerin
// derinliği (x+y) en çok x+y+max(w,d)-2, ÖNÜNDEKİLERİN en az x+y+min(w,d);
// ikisinin ortası x+y+(w+d-2)/2 her ikisini de doğru ayırır (kare ve 2×1
// için kesin). Karakter yuvaları tam sayı derinliktedir; nesne anahtarı ≤ d
// ise karakterden önce çizilir. Çizim setinin "uzak köşe" önerisi evin
// önündeki kaldırımda duran karakteri evin duvarının arkasına saklıyordu.
export function objectDepth(o) {
  return o.x + o.y + (o.w + o.d - 2) / 2
}
