import { Box, Button, Container, Divider, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const sections = [
  {
    title: '1. Veri Sorumlusu',
    body: `Sağlıktan platformu ("Sağlıktan", "biz") tarafından işletilmektedir. Bu metin, 6698 sayılı
Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, platformumuzu kullanırken işlenen kişisel
verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.`
  },
  {
    title: '2. İşlenen Kişisel Veriler',
    body: `Hesabınızı oluştururken ad, soyad, e-posta adresi ve şifrenizi (geri döndürülemez biçimde
şifrelenmiş olarak) topluyoruz. Platformu kullanırken katıldığınız hastalık grupları, paylaştığınız
gönderi ve yorumlar da tarafımızca işlenir.

Katıldığınız hastalık grupları ve paylaştığınız içerikler, sağlık durumunuza ilişkin bilgiler
içerebileceğinden KVKK'nın 6. maddesi kapsamında "özel nitelikli kişisel veri" sayılır ve bu veriler
yalnızca açık rızanız doğrultusunda işlenir.`
  },
  {
    title: '3. Kişisel Verilerin İşlenme Amaçları',
    body: `Kişisel verileriniz; hesabınızın oluşturulması ve yönetilmesi, e-posta doğrulama ve şifre
sıfırlama süreçlerinin yürütülmesi, hastalık gruplarına üyeliğinizin sağlanması, paylaştığınız
içeriklerin ilgili topluluğa gösterilmesi, platform güvenliğinin sağlanması (kötüye kullanımın
önlenmesi, şikayet mekanizmasının işletilmesi) ve yasal yükümlülüklerimizin yerine getirilmesi
amacıyla işlenir.`
  },
  {
    title: '4. Hukuki Sebep',
    body: `Kimlik ve iletişim verileriniz, sizinle aramızdaki üyelik sözleşmesinin kurulması ve ifası
için işlenir. Sağlık durumunuza ilişkin olabilecek veriler (hastalık grubu üyeliği, paylaşımlarınız)
ise yalnızca kayıt sırasında verdiğiniz açık rızaya dayanılarak işlenir; bu rızayı istediğiniz zaman
geri alabilirsiniz.`
  },
  {
    title: '5. Kişisel Verilerin Aktarılması',
    body: `Verileriniz, platformun teknik altyapısını sağlayan barındırma (hosting) ve e-posta gönderim
hizmeti sağlayıcılarımızla, yalnızca hizmetin sunulabilmesi için gerekli ölçüde paylaşılır. Verileriniz
pazarlama amacıyla üçüncü taraflarla paylaşılmaz veya satılmaz.

Hastalık grubuna katıldığınızda kullanıcı adınız o gruba üye diğer kullanıcılar tarafından
görülebilir; paylaştığınız gönderi ve yorumlar, üyesi olduğunuz gruptaki diğer kullanıcılara
açıktır.`
  },
  {
    title: '6. Saklama Süresi',
    body: `Kişisel verileriniz, hesabınız aktif olduğu sürece ve yasal saklama yükümlülüklerimizin
gerektirdiği süre boyunca saklanır. Hesabınızı devre dışı bıraktığınızda verileriniz, yasal
zorunluluklar saklı kalmak kaydıyla, makul bir süre içinde silinir veya anonim hale getirilir.`
  },
  {
    title: '7. Haklarınız',
    body: `KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse
buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse
düzeltilmesini isteme, KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme
ve bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz.

Bu haklarınızı kullanmak için hesap ayarlarınızdaki "Hesabı Devre Dışı Bırak" seçeneğini
kullanabilir ya da aşağıdaki iletişim adresinden bize ulaşabilirsiniz.`
  },
  {
    title: '8. İletişim',
    body: `Bu metinle ilgili sorularınız için iletisim@sagliktan.com adresinden bize ulaşabilirsiniz.`
  }
]

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
          Geri
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ pb: 8 }}>
        <Typography variant="h2" sx={{ color: 'primary.main', mb: 1 }}>
          KVKK Aydınlatma Metni ve Gizlilik Politikası
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>

        {sections.map((section, i) => (
          <Box key={section.title} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
              {section.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.8 }}
            >
              {section.body}
            </Typography>
            {i < sections.length - 1 && <Divider sx={{ mt: 4 }} />}
          </Box>
        ))}
      </Container>
    </Box>
  )
}
