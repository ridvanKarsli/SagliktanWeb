import StaticPageShell from '../components/StaticPageShell.jsx'
import { CRISIS_LINE } from '../config/site.js'
import StaticPageSections from '../components/StaticPageSections.jsx'

// İçerik, ContentModerationServiceImpl.java'nın gerçek davranışını
// yansıtacak şekilde yazıldı: küfür/spam engellenir, kriz sinyalleri
// ASLA engellenmez (yalnızca işaretlenip destek bilgisi eklenir).
const sections = [
  {
    title: 'Neden Kurallarımız Var',
    body: `Sağlıktan, hassas sağlık deneyimlerinin paylaşıldığı bir alan. Herkesin kendini güvende hissedebilmesi için birbirimize saygılı davranıyoruz.`
  },
  {
    title: 'Yapılması Gerekenler',
    body: `Deneyimlerinizi dürüstçe paylaşın. Diğer kullanıcılara nazik ve destekleyici davranın. Paylaştığınız bilginin kişisel deneyiminiz olduğunu, tıbbi tavsiye olmadığını unutmayın. Uygunsuz bir içerik gördüğünüzde şikayet/bildirim özelliğini kullanın.`
  },
  {
    title: 'Yasak Olanlar',
    body: `Küfür, hakaret, taciz veya nefret söylemi; spam ya da izinsiz reklam içeren paylaşımlar sistemimiz tarafından otomatik olarak reddedilir ve yayınlanmaz.

Ayrıca yasa dışı içerik paylaşmak, başka bir kullanıcının kimliğine bürünmek ve kasıtlı olarak yanıltıcı sağlık bilgisi yaymak da yasaktır; bu tür içerikler tespit edildiğinde kaldırılır ve tekrarında hesap askıya alınabilir.

İlaç, takviye, cihaz ya da herhangi bir ürünün satışı, takası ve reklamı yasaktır; reçeteli ilaç alıp vermek için yapılan paylaşımlar hemen kaldırılır. "Kesin tedavi", "mucize kür" gibi iddialar ve bir tedaviyi bırakmaya yönlendiren paylaşımlar da yasaktır. Bir yöntemin size nasıl geldiğini anlatabilirsiniz; başkasına tedavi öneremezsiniz.

Üyelerin "sağlık profesyoneli" olduğuna dair bilgisi yalnızca kendi beyanıdır; Sağlıktan bu beyanı doğrulamaz.`
  },
  {
    title: 'Zor Anlar İçin: Kriz Desteği',
    body: `İntihar düşüncesi veya kendine zarar verme gibi bir kriz anını paylaşırsanız, gönderiniz ASLA engellenmez ya da gizlenmez - bu tür paylaşımlar sizi susturmak yerine, yanına destekleyici kaynaklara (${CRISIS_LINE.name}) yönlendiren bir bilgi notu eklenerek yayınlanır. Amacımız, zor anınızda yalnız olmadığınızı hissettirmek.`
  },
  {
    title: 'Bir Şeyi Bildirmek İsterseniz',
    body: `Kurallara aykırı bir içerik gördüğünüzde ilgili gönderi veya yorumdaki şikayet seçeneğini kullanabilir, ya da iletisim@sagliktan.com adresinden bize doğrudan ulaşabilirsiniz.`
  }
]

export default function CommunityGuidelines() {
  return (
    <StaticPageShell title="Topluluk Kuralları">
      <StaticPageSections sections={sections} />
    </StaticPageShell>
  )
}
