import StaticPageShell from '../components/StaticPageShell.jsx'
import StaticPageSections from '../components/StaticPageSections.jsx'

// İçerik, ContentModerationServiceImpl.java'nın gerçek davranışını
// yansıtacak şekilde yazıldı: küfür/spam engellenir, kriz sinyalleri
// ASLA engellenmez (yalnızca işaretlenip destek bilgisi eklenir).
const sections = [
  {
    title: 'Neden Kurallarımız Var',
    body: `Sağlıktan, hassas sağlık deneyimlerinin paylaşıldığı bir alan. Herkesin kendini güvende
hissedebilmesi için birbirimize saygılı davranıyoruz.`
  },
  {
    title: 'Yapılması Gerekenler',
    body: `Deneyimlerinizi dürüstçe paylaşın. Diğer kullanıcılara nazik ve destekleyici davranın.
Paylaştığınız bilginin kişisel deneyiminiz olduğunu, tıbbi tavsiye olmadığını unutmayın. Uygunsuz
bir içerik gördüğünüzde şikayet/bildirim özelliğini kullanın.`
  },
  {
    title: 'Yasak Olanlar',
    body: `Küfür, hakaret, taciz veya nefret söylemi; spam ya da izinsiz reklam içeren paylaşımlar
sistemimiz tarafından otomatik olarak reddedilir ve yayınlanmaz.

Ayrıca yasa dışı içerik paylaşmak, başka bir kullanıcının kimliğine bürünmek ve kasıtlı olarak
yanıltıcı sağlık bilgisi yaymak da yasaktır; bu tür içerikler tespit edildiğinde kaldırılır ve
tekrarında hesap askıya alınabilir.`
  },
  {
    title: 'Zor Anlar İçin: Kriz Desteği',
    body: `İntihar düşüncesi veya kendine zarar verme gibi bir kriz anını paylaşırsanız, gönderiniz
ASLA engellenmez ya da gizlenmez - bu tür paylaşımlar sizi susturmak yerine, yanına destekleyici
kaynaklara (örn. 182 Sosyal Destek Hattı) yönlendiren bir bilgi notu eklenerek yayınlanır. Amacımız,
zor anınızda yalnız olmadığınızı hissettirmek.`
  },
  {
    title: 'Bir Şeyi Bildirmek İsterseniz',
    body: `Kurallara aykırı bir içerik gördüğünüzde ilgili gönderi veya yorumdaki şikayet seçeneğini
kullanabilir, ya da iletisim@sagliktan.com adresinden bize doğrudan ulaşabilirsiniz.`
  }
]

export default function CommunityGuidelines() {
  return (
    <StaticPageShell title="Topluluk Kuralları">
      <StaticPageSections sections={sections} />
    </StaticPageShell>
  )
}
