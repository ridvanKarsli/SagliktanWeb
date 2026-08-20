import StaticPageShell from '../components/StaticPageShell.jsx'
import StaticPageSections from '../components/StaticPageSections.jsx'

// NOT: Bu metin bir taslaktır, KVKK Aydınlatma Metni ile aynı statüde -
// hukuki inceleme bekliyor (bkz. proje görev listesi #167). Standart bir
// topluluk platformu kullanım şartları çerçevesi izler, platformun gerçek
// davranışını (moderasyon, içerik sahipliği, hesap silme) yansıtır.
const sections = [
  {
    title: '1. Kabul',
    body: `Sağlıktan'a ("Platform") kayıt olarak veya Platform'u kullanarak bu Kullanım Şartları'nı kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız Platform'u kullanmamalısınız.`
  },
  {
    title: '2. Hizmetin Tanımı',
    body: `Sağlıktan, kronik ve nadir hastalıklarla yaşayan bireylerin ve yakınlarının, benzer deneyimleri paylaşan kişilerle bir araya geldiği bir topluluk platformudur. Platform bir sağlık kuruluşu, hastane veya tıbbi danışmanlık hizmeti DEĞİLDİR - bkz. madde 5.`
  },
  {
    title: '3. Hesap Oluşturma ve Sorumluluklar',
    body: `18 yaşından büyük olmalı ve doğru bilgilerle kayıt olmalısınız. Hesabınızın güvenliğinden (şifrenizin gizliliği dahil) siz sorumlusunuz. Hesabınız üzerinden gerçekleşen tüm işlemlerden sorumlu tutulursunuz - şüpheli bir erişim fark ederseniz derhal bize bildirin.`
  },
  {
    title: '4. Kullanıcı İçeriği',
    body: `Platform'da paylaştığınız gönderi, yorum ve diğer içeriklerin sorumluluğu size aittir. İçeriğinizin doğruluğunu, güncelliğini veya başka bir kişinin haklarını ihlal etmediğini garanti etmeniz beklenir.

Paylaştığınız içerik, otomatik bir moderasyon sisteminden geçer: küfür/spam içeren paylaşımlar reddedilir; intihar veya kendine zarar verme gibi kriz sinyalleri içeren paylaşımlar ASLA engellenmez, yalnızca yanına destekleyici bir kaynak bilgisi eklenir. Detaylar için Topluluk Kuralları'na bakınız.

Paylaştığınız içerik üzerindeki haklarınızı saklı tutarsınız; ancak içeriğinizin Platform içinde (üyesi olduğunuz gruba) gösterilmesine izin vermiş olursunuz.`
  },
  {
    title: '5. Tıbbi Tavsiye Değildir',
    body: `Platform'daki tüm paylaşımlar kişisel deneyimlerdir ve tıbbi tavsiye niteliği taşımaz. Sağlık durumunuzla ilgili teşhis, tedavi veya ilaç kullanımı kararlarını yalnızca bir sağlık uzmanına danışarak almalısınız. Sağlıktan, Platform'da paylaşılan bilgilere dayanarak alınan kararlardan sorumlu tutulamaz.`
  },
  {
    title: '6. Yasaklı Davranışlar',
    body: `Platform'da şunlar yasaktır: küfür, hakaret, taciz veya nefret söylemi; spam veya izinsiz reklam; başka bir kullanıcının kimliğine bürünme; yanıltıcı sağlık bilgisi yaymak; yasa dışı içerik paylaşmak; Platform'un güvenliğini veya işleyişini bozmaya yönelik girişimlerde bulunmak.

Bu kuralları ihlal eden içerikler kaldırılabilir, hesabınız askıya alınabilir veya kalıcı olarak kapatılabilir.`
  },
  {
    title: '7. Fikri Mülkiyet',
    body: `Platform'un tasarımı, logosu ve yazılımı Sağlıktan'a aittir ve izinsiz kullanılamaz. Kendi paylaştığınız içeriğin telif hakkı sizde kalır.`
  },
  {
    title: '8. Hesabın Askıya Alınması ve Silinmesi',
    body: `Şartları ihlal etmeniz durumunda hesabınızı askıya alma veya kapatma hakkımız saklıdır. Siz de dilediğiniz zaman hesap ayarlarınızdan hesabınızı devre dışı bırakabilir ya da kalıcı olarak silebilirsiniz (hesap silme, kimlik bilgilerinizi anonimleştirir; geri alınamaz - bkz. Gizlilik Politikası).`
  },
  {
    title: '9. Sorumluluğun Sınırlandırılması',
    body: `Platform "olduğu gibi" sunulur. Sağlıktan, Platform'un kesintisiz veya hatasız çalışacağını garanti etmez. Yasaların izin verdiği azami ölçüde, Platform'un kullanımından doğabilecek dolaylı zararlardan sorumlu tutulamayız.`
  },
  {
    title: '10. Değişiklikler',
    body: `Bu şartları zaman zaman güncelleyebiliriz. Önemli değişikliklerde sizi bilgilendireceğiz. Güncellemelerden sonra Platform'u kullanmaya devam etmeniz, güncel şartları kabul ettiğiniz anlamına gelir.`
  },
  {
    title: '11. Uygulanacak Hukuk',
    body: `Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türkiye mahkemeleri ve icra daireleri yetkilidir.`
  },
  {
    title: '12. İletişim',
    body: `Bu şartlarla ilgili sorularınız için iletisim@sagliktan.com adresinden bize ulaşabilirsiniz.`
  }
]

export default function TermsOfService() {
  return (
    <StaticPageShell
      title="Kullanım Şartları"
      subtitle={`Son güncelleme: ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
    >
      <StaticPageSections sections={sections} />
    </StaticPageShell>
  )
}
