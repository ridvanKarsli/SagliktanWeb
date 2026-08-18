import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material'
import { ExpandMore, Email } from '@mui/icons-material'
import StaticPageShell from '../components/StaticPageShell.jsx'

const faqs = [
  {
    q: 'Şifremi unuttum, ne yapmalıyım?',
    a: 'Giriş ekranındaki "Şifremi Unuttum" bağlantısına tıklayıp e-posta adresinizi girerek şifre sıfırlama bağlantısı alabilirsiniz.'
  },
  {
    q: 'Verilerimi nasıl indirebilirim?',
    a: 'Profil sayfanızdaki Ayarlar bölümünden "Verilerimi İndir" seçeneğini kullanarak profil bilgileriniz, gönderileriniz, yorumlarınız ve kaydettiğiniz içeriklerin bir kopyasını alabilirsiniz.'
  },
  {
    q: 'Hesabımı nasıl silerim?',
    a: 'Profil sayfanızdaki Ayarlar bölümünden "Hesabımı Sil" seçeneğini kullanabilirsiniz. Bu işlem geri alınamaz; hesabınız ve kimlik bilgileriniz kalıcı olarak anonimleştirilir.'
  },
  {
    q: 'Uygunsuz bir içerik gördüm, ne yapmalıyım?',
    a: 'İlgili gönderi veya yorumun yanındaki şikayet seçeneğini kullanarak bize bildirebilirsiniz. Ayrıca küfür ve spam içeren paylaşımlar sistemimiz tarafından otomatik olarak engellenir.'
  },
  {
    q: 'Bir hastalık grubuna nasıl katılabilirim?',
    a: 'Ana menüden "Gruplar" sekmesine giderek ilgilendiğiniz hastalık grubunu bulup katılabilirsiniz. Katıldığınız gruplardaki paylaşımları görebilir ve kendiniz de paylaşım yapabilirsiniz.'
  },
  {
    q: 'Bazı gönderilerde uyarı/bilgi kutusu görüyorum, bu ne anlama geliyor?',
    a: 'Kriz sinyali içerebilecek paylaşımların yanına, sizi desteklemek amacıyla destekleyici kaynaklara (örn. 182 Sosyal Destek Hattı) yönlendiren bir bilgi notu ekleriz. Bu, paylaşımın engellendiği anlamına gelmez.'
  },
  {
    q: 'Platformdaki bilgiler tıbbi tavsiye yerine geçer mi?',
    a: 'Hayır. Sağlıktan\'daki tüm paylaşımlar kişisel deneyimlerdir ve tıbbi tavsiye niteliği taşımaz. Sağlık kararlarınızı mutlaka bir sağlık uzmanına danışarak alın.'
  }
]

export default function Help() {
  return (
    <StaticPageShell title="Yardım ve Destek" subtitle="Sık sorulan sorular ve bize ulaşma yolları">
      <Box sx={{ mb: 4 }}>
        {faqs.map((item) => (
          <Accordion key={item.q} disableGutters sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                {item.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          Aradığınız cevabı bulamadınız mı? Bize doğrudan yazın.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Email />}
          href="mailto:iletisim@sagliktan.com"
        >
          iletisim@sagliktan.com
        </Button>
      </Box>
    </StaticPageShell>
  )
}
