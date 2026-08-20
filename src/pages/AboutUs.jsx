import StaticPageShell from '../components/StaticPageShell.jsx'
import StaticPageSections from '../components/StaticPageSections.jsx'

// Mütevazı, doğrulanabilir ifadelerle sınırlı tutuldu - uydurma ekip/yatırım
// bilgisi yok (bkz. görev #290 notu: "no fabricated team/funding facts").
const sections = [
  {
    title: 'Neden Varız',
    body: `Kronik veya nadir bir hastalıkla yaşamak çoğu zaman yalnızlık hissi getirir - aynı şeyi yaşayan birini bulmak zor olabilir. Sağlıktan, benzer sağlık deneyimlerine sahip kişilerin bir araya gelip birbirinin deneyiminden faydalanabileceği bir topluluk alanı olarak kuruldu.`
  },
  {
    title: 'Ne Yapıyoruz',
    body: `Platformumuzda kullanıcılar hastalık gruplarına katılır, deneyimlerini paylaşır, birbirine soru sorar ve destek olur. Sağlıktan bir hastane, klinik ya da tıbbi danışmanlık hizmeti değildir; paylaşılanlar kişisel deneyimlerdir, tıbbi tavsiye yerine geçmez (bkz. Kullanım Şartları, madde 5).`
  },
  {
    title: 'Nasıl Çalışıyoruz',
    body: `Topluluğun güvenli kalması için paylaşılan içerikler otomatik bir moderasyon sisteminden geçer. Kriz anında olan kullanıcıları asla susturmayız - böyle bir paylaşım tespit edildiğinde engellenmez, yanına destekleyici kaynaklara yönlendiren bir bilgi eklenir. Detaylar için Topluluk Kuralları sayfamıza bakabilirsiniz.`
  },
  {
    title: 'Bize Ulaşın',
    body: `Görüş, öneri veya sorularınız için iletisim@sagliktan.com adresinden bize yazabilirsiniz.`
  }
]

export default function AboutUs() {
  return (
    <StaticPageShell title="Hakkımızda">
      <StaticPageSections sections={sections} />
    </StaticPageShell>
  )
}
