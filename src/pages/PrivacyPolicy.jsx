import StaticPageShell from '../components/StaticPageShell.jsx'
import StaticPageSections from '../components/StaticPageSections.jsx'

// Metin sürümü: değiştirildiğinde backend'deki ConsentPolicy.CURRENT_VERSION
// da artırılmalı (eski sürüme verilmiş rıza geçersiz sayılır, kullanıcıdan
// yeniden istenir).
const VERSION = 'v2'
const EFFECTIVE_DATE = '19 Kasım 2026'

const sections = [
  {
    title: '1. Veri Sorumlusu',
    body: `Sağlıktan platformu ("Sağlıktan", "biz") veri sorumlusudur. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m.10 uyarınca, platformu kullanırken işlenen kişisel verileriniz hakkında sizi bilgilendirmek için hazırlanmıştır.

İletişim: iletisim@sagliktan.com`
  },
  {
    title: '2. İşlenen Kişisel Veriler',
    body: `Kimlik ve iletişim: ad, soyad, e-posta adresi.

Hesap güvenliği: şifreniz (geri döndürülemez biçimde şifrelenmiş olarak), oturum açtığınız cihaz bilgisi ve IP adresi, doğrulama kodları.

Profil: şehir, topluluk rolünüz (hasta, hasta yakını, sağlık profesyoneli, diğer), kısa tanıtım yazınız, tercihleriniz.

Sağlık verisi (özel nitelikli kişisel veri): üye olduğunuz hastalık grupları, grup ve topluluk içinde paylaştığınız gönderi, yorum ve mesajların içeriği, anketlere verdiğiniz oylar, kaydettiğiniz gönderiler ve profilinizde belirttiğiniz sağlık durumunuza ilişkin bilgiler. Bu içerikleri yazarken sağlık durumunuza dair bilgi vermeniz sizin tercihinizdir; ancak bu tür içerik niteliği gereği özel nitelikli veri sayılır.

Kullanım ve işlem güvenliği: tepkileriniz, bildirimleriniz, şikayetleriniz, sunucu erişim kayıtları.`
  },
  {
    title: '3. Verilerin Toplanma Yöntemi',
    body: `Verileriniz; üyelik formu, profil ve ayarlar ekranları, paylaşım, yorum ve mesajlaşma özellikleri ile platformun kullanımı sırasında otomatik olarak (oturum ve güvenlik kayıtları) elektronik ortamda toplanır.`
  },
  {
    title: '4. İşleme Amaçları',
    body: `Hesabınızın oluşturulması ve yönetilmesi, e-posta doğrulama ve şifre sıfırlama, hastalık gruplarına üyeliğinizin sağlanması, paylaşımlarınızın ilgili topluluğa gösterilmesi, isteğinize bağlı olarak benzer deneyimdeki üyelerle eşleştirme, bildirim ve (kapatmadıysanız) haftalık özet e-postası gönderilmesi, platform güvenliğinin sağlanması (kötüye kullanımın, spam ve zararlı içeriğin önlenmesi, şikayetlerin incelenmesi) ve yasal yükümlülüklerin yerine getirilmesi.`
  },
  {
    title: '5. Hukuki Sebepler',
    body: `Kimlik, iletişim ve hesap verileriniz KVKK m.5/2-c (üyelik sözleşmesinin kurulması ve ifası), güvenlik kayıtları m.5/2-ç (hukuki yükümlülük) ve m.5/2-f (meşru menfaat) kapsamında işlenir.

Sağlık durumunuza ilişkin veriler KVKK m.6 uyarınca yalnızca açık rızanıza dayanılarak işlenir. Açık rıza, kayıt sırasında aydınlatma onayından ayrı bir onayla alınır ve veri işleme şartı olarak başka bir işlemle birlikte dayatılmaz.`
  },
  {
    title: '6. Verilerin Aktarılması',
    body: `Verileriniz satılmaz ve pazarlama amacıyla üçüncü taraflarla paylaşılmaz.

Hizmetin sunulabilmesi için, yalnızca gerekli ölçüde ve yurt dışında bulunan aşağıdaki hizmet sağlayıcılara aktarılır:
• Barındırma ve sunucu altyapısı (uygulama ve veritabanı): Railway; arayüz barındırma: Vercel (Amerika Birleşik Devletleri)
• Görsel (fotoğraf) depolama: Cloudflare (R2)
• Transactional e-posta gönderimi (doğrulama kodu, şifre sıfırlama, özet): Resend (Amerika Birleşik Devletleri)
• Hata izleme: Sentry (Almanya); kullanıcı kimliği, IP adresi gibi kişisel veriler hata raporlarına eklenmez.

Yurt dışına aktarım KVKK m.9 uyarınca, kanunda öngörülen uygun güvencelere (standart sözleşme) ve ayrıca bu metindeki açık rızanıza dayanılarak yapılır.

Hastalık grubuna katıldığınızda adınız o gruptaki diğer üyelere, paylaştığınız gönderi ve yorumlar ise üyesi olduğunuz topluluktaki diğer kullanıcılara görünür. Profilinizi kapattığınızda diğer üyeler yalnızca adınızı görür. Yetkili kamu kurum ve kuruluşlarına, mevzuatın zorunlu kıldığı hâllerde ve yalnızca talep edilen ölçüde bilgi verilir.`
  },
  {
    title: '7. Saklama Süresi',
    body: `Verileriniz hesabınız açık olduğu sürece saklanır. Hesabınızı sildiğinizde kişisel verileriniz, yasal saklama yükümlülüğüne tabi kayıtlar hariç, silinir veya anonim hale getirilir; yedeklerdeki kopyalar yedekleme döngüsü içinde en geç 90 gün içinde yok edilir. Erişim kayıtları (IP ve zaman bilgisi) 5651 sayılı Kanun ve ilgili mevzuatın öngördüğü süre boyunca saklanır.`
  },
  {
    title: '8. Sağlık Verisi Açık Rıza Metni',
    body: `Üye olduğum hastalık grupları, paylaştığım gönderi, yorum ve mesajların içeriği, anket oyları, kaydettiğim gönderiler ve profilimde belirttiğim bilgiler gibi sağlık durumuma ilişkin verilerimin (özel nitelikli kişisel veri);

• hesabımın yönetilmesi, hastalık gruplarına üyeliğimin sağlanması ve paylaşımlarımın toplulukta gösterilmesi,
• tercih etmem hâlinde benzer deneyimdeki üyelerle eşleştirilmem,
• platform güvenliğinin ve moderasyonun sağlanması

amaçlarıyla, 6. maddede sayılan yurt dışındaki hizmet sağlayıcılara aktarılarak işlenmesine açık rıza verdiğimi, bu rızanın özgür irademe dayandığını ve konusunda bilgilendirildiğimi kabul ederim.

Rızamı Ayarlar > Sağlık verisi rızası bölümünden istediğim zaman geri alabilirim. Geri alma ileriye dönük etki doğurur: hastalık grubu üyeliklerim ve topluluk rolüm kaldırılır, profilim diğer üyelere kapatılır, yeniden rıza verene kadar gönderi paylaşamam, yorum yazamam ve gruplara katılamam. Daha önce paylaştığım içerikleri tek tek ya da hesabımı silerek kaldırabilirim. Rıza vermemem veya geri almam, hesabımın bulunmasını ve platformda içerik okumayı engellemez.`
  },
  {
    title: '9. Haklarınız ve Başvuru',
    body: `KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, m.7 çerçevesinde silinmesini veya yok edilmesini isteme, bu işlemlerin aktarılan üçüncü kişilere bildirilmesini isteme, işlenen verilerin otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.

Hesap ayarlarındaki "Verilerimi İndir" ile verilerinizi indirebilir, "Hesabımı Sil" ile silebilir, "Sağlık verisi rızası" ile rızanızı geri alabilirsiniz. Diğer başvurularınızı, kimliğinizi doğrulamaya yarayan bilgilerle birlikte iletisim@sagliktan.com adresine iletebilirsiniz; başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. Cevaptan memnun kalmazsanız Kişisel Verileri Koruma Kurumu'na şikayet hakkınız saklıdır.`
  },
  {
    title: '10. Yaş Sınırı',
    body: `Platform 18 yaş ve üzerindeki kişilere yöneliktir. 18 yaşından küçük olduğunu fark ettiğimiz hesaplar ve verileri silinir. Bir çocuğun üye olduğunu düşünüyorsanız lütfen iletisim@sagliktan.com adresine bildirin.`
  },
  {
    title: '11. Veri Güvenliği',
    body: `Bağlantılar şifreli (HTTPS) yapılır, şifreler geri döndürülemez biçimde saklanır, yetkisiz erişime karşı erişim kontrolü ve oran sınırlamaları uygulanır. Verilerinizin hukuka aykırı biçimde ele geçirilmesi hâlinde, ilgili kişileri ve Kişisel Verileri Koruma Kurulu'nu mevzuatta öngörülen süre içinde bilgilendiririz.`
  },
  {
    title: '12. Çerezler ve Yerel Depolama',
    body: `Platform reklam veya takip amaçlı çerez kullanmaz. Oturumunuzun açık kalması ve erişilebilirlik tercihlerinizin (yazı boyutu, tema) hatırlanması için tarayıcınızın yerel depolaması kullanılır; bunlar hizmetin sunulması için zorunludur.`
  },
  {
    title: '13. Değişiklikler',
    body: `Bu metin güncellendiğinde sürüm numarası ve yürürlük tarihi değişir. Sağlık verisi işlemeyi etkileyen esaslı değişikliklerde sizden yeniden açık rıza istenir.`
  },
  {
    title: '14. İletişim',
    body: `Bu metinle ilgili sorularınız için iletisim@sagliktan.com adresinden bize ulaşabilirsiniz.`
  }
]

export default function PrivacyPolicy() {
  return (
    <StaticPageShell
      title="KVKK Aydınlatma Metni, Açık Rıza Metni ve Gizlilik Politikası"
      subtitle={`Sürüm ${VERSION} · Yürürlük tarihi: ${EFFECTIVE_DATE}`}
    >
      <StaticPageSections sections={sections} />
    </StaticPageShell>
  )
}
