import StaticPageShell from '../components/StaticPageShell.jsx'
import StaticPageSections from '../components/StaticPageSections.jsx'

const sections = [
  {
    title: '1. Veri Sorumlusu',
    body: `Sağlıktan platformu ("Sağlıktan", "biz") tarafından işletilmektedir. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, platformumuzu kullanırken işlenen kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.`
  },
  {
    title: '2. İşlenen Kişisel Veriler',
    body: `Hesabınızı oluştururken ad, soyad, e-posta adresi ve şifrenizi (geri döndürülemez biçimde şifrelenmiş olarak) topluyoruz. Platformu kullanırken katıldığınız hastalık grupları, paylaştığınız gönderi ve yorumlar da tarafımızca işlenir.

Katıldığınız hastalık grupları ve paylaştığınız içerikler, sağlık durumunuza ilişkin bilgiler içerebileceğinden KVKK'nın 6. maddesi kapsamında "özel nitelikli kişisel veri" sayılır ve bu veriler yalnızca açık rızanız doğrultusunda işlenir.`
  },
  {
    title: '3. Kişisel Verilerin İşlenme Amaçları',
    body: `Kişisel verileriniz; hesabınızın oluşturulması ve yönetilmesi, e-posta doğrulama ve şifre sıfırlama süreçlerinin yürütülmesi, hastalık gruplarına üyeliğinizin sağlanması, paylaştığınız içeriklerin ilgili topluluğa gösterilmesi, platform güvenliğinin sağlanması (kötüye kullanımın önlenmesi, şikayet mekanizmasının işletilmesi) ve yasal yükümlülüklerimizin yerine getirilmesi amacıyla işlenir.`
  },
  {
    title: '4. Hukuki Sebep',
    body: `Kimlik ve iletişim verileriniz, sizinle aramızdaki üyelik sözleşmesinin kurulması ve ifası için işlenir. Sağlık durumunuza ilişkin olabilecek veriler (hastalık grubu üyeliği, paylaşımlarınız) ise yalnızca kayıt sırasında verdiğiniz açık rızaya dayanılarak işlenir; bu rızayı istediğiniz zaman geri alabilirsiniz.`
  },
  {
    title: '5. Kişisel Verilerin Aktarılması',
    body: `Verileriniz, platformun teknik altyapısını sağlayan barındırma (hosting) ve e-posta gönderim hizmeti sağlayıcılarımızla, yalnızca hizmetin sunulabilmesi için gerekli ölçüde paylaşılır. Verileriniz pazarlama amacıyla üçüncü taraflarla paylaşılmaz veya satılmaz.

Hastalık grubuna katıldığınızda kullanıcı adınız o gruba üye diğer kullanıcılar tarafından görülebilir; paylaştığınız gönderi ve yorumlar, üyesi olduğunuz gruptaki diğer kullanıcılara açıktır.`
  },
  {
    title: '6. Saklama Süresi',
    body: `Kişisel verileriniz, hesabınız aktif olduğu sürece ve yasal saklama yükümlülüklerimizin gerektirdiği süre boyunca saklanır. Hesabınızı devre dışı bıraktığınızda verileriniz, yasal zorunluluklar saklı kalmak kaydıyla, makul bir süre içinde silinir veya anonim hale getirilir.`
  },
  {
    title: '7. Haklarınız',
    body: `KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme ve bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz.

Bu haklarınızı kullanmak için hesap ayarlarınızdaki "Verilerimi İndir" ve "Hesabımı Sil" seçeneklerini kullanabilir ya da aşağıdaki iletişim adresinden bize ulaşabilirsiniz.`
  },
  {
    title: '8. İletişim',
    body: `Bu metinle ilgili sorularınız için iletisim@sagliktan.com adresinden bize ulaşabilirsiniz.`
  }
]

export default function PrivacyPolicy() {
  return (
    <StaticPageShell
      title="KVKK Aydınlatma Metni ve Gizlilik Politikası"
      subtitle={`Son güncelleme: ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
    >
      <StaticPageSections sections={sections} />
    </StaticPageShell>
  )
}
