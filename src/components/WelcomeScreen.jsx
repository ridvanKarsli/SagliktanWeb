import { Box, Button, Typography, Container, Grid, Link, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import {
  Forum,
  Groups2Rounded,
  MedicalServicesOutlined,
  Groups,
  ArrowForward,
  Security,
  VerifiedUserOutlined,
  LockRounded
} from "@mui/icons-material"
import TrustBadges from "./TrustBadges.jsx"

const features = [
  {
    icon: Groups2Rounded,
    title: "Hastalık Grupları",
    description: "İlgilendiğiniz hastalık grubuna katılın, sizinle aynı yolu yürüyen kişilerle tanışın."
  },
  {
    icon: Forum,
    title: "Topluluk Desteği",
    description: "Benzer deneyimleri yaşayan kişilerle bağlantı kurun, birbirinize destek olun."
  },
  {
    icon: MedicalServicesOutlined,
    title: "Gerçek Deneyimler",
    description: "Alt gruplarda paylaşılan gönderi ve yorumlarla gerçek deneyimlerden faydalanın."
  },
  {
    icon: Security,
    title: "Güvenli ve Gizli",
    description: "Verileriniz güvende, paylaşımlarınız yalnızca üyesi olduğunuz grupla sınırlı."
  }
]

const steps = [
  { number: "01", title: "Hesap Oluşturun", description: "Bir dakikadan kısa sürede, ücretsiz" },
  { number: "02", title: "Grubunuzu Bulun", description: "İlgilendiğiniz hastalık grubuna katılın" },
  { number: "03", title: "Paylaşın, Dinleyin", description: "Deneyiminizi anlatın, başkalarınınkinden öğrenin" }
]

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100dvh" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          zIndex: 1000,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/sagliktanLogo.png"
                alt="Sağlıktan"
                sx={{ width: 40, height: 40, borderRadius: '10px' }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Sağlıktan
              </Typography>
              {/* E-devlet tarzı "güvenli bağlantı" imi - tarayıcının kendi
                  kilit ikonuna ek, kullanıcının siteye ilk bakışta duyduğu
                  güveni pekiştiren bir vurgu (bkz. görev #301). */}
              <Tooltip title="Bağlantınız şifrelenmiş ve güvenlidir">
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center', gap: 0.5, ml: 0.5,
                    px: 1, py: 0.375, borderRadius: 5,
                    border: '1px solid', borderColor: 'divider'
                  }}
                >
                  <LockRounded sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
                    Güvenli
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="text"
                onClick={() => navigate("/login")}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                size={isMobile ? "small" : "medium"}
                // Faz8-2: theme.js'in MuiButton.sizeSmall override'ı (kompakt
                // admin tablo aksiyonları için minHeight:38 veriyor) bu
                // sekmeyi hiç görmemiş kullanıcının karşılaştığı EN görünür
                // dönüşüm CTA'sını da küçültüyordu - 44px dokunma hedefi
                // altına düşmesin diye burada özel olarak override ediliyor.
                sx={isMobile ? { minHeight: 44 } : undefined}
              >
                Başla
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section - Faz4: dekoratif blur glow topları kaldırıldı, düz
          zemine geçildi (bkz. theme.js/index.css'teki aynı karar) - X.com
          tarzı olgun ürünlerde hero de dahil tüm sayfa tek, düz bir zeminde
          durur; içerik kendi ağırlığıyla öne çıkar. */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 12 },
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h1"
                  sx={{
                    color: 'primary.main',
                    mb: 3,
                    fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem' }
                  }}
                >
                  Bu Yolda
                  <Box component="span" sx={{ color: 'secondary.main', display: 'block' }}>
                    Yalnız Değilsiniz
                  </Box>
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    mb: 4,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    maxWidth: 480,
                    mx: { xs: 'auto', md: 0 }
                  }}
                >
                  Kronik ve nadir hastalıklarla yaşayan bireyleri ve yakınlarını, birbirini
                  gerçekten anlayan bir toplulukta bir araya getiriyoruz.
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/register")}
                    endIcon={<ArrowForward />}
                    sx={{ minWidth: 180 }}
                  >
                    Topluluğa Katıl
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{ minWidth: 180 }}
                  >
                    Giriş Yap
                  </Button>
                </Stack>

                {/* Trust indicators */}
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    mt: 5,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  {[
                    { icon: Groups, text: "Hastalık Grupları" },
                    { icon: Security, text: "Gizlilik Odaklı" },
                    { icon: VerifiedUserOutlined, text: "KVKK Uyumlu" }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <item.icon sx={{ color: 'secondary.main', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* Logo illüstrasyon alanı - Faz4: gradyan dolgu ve rozetlerdeki
                    renkli glow gölgeleri kaldırıldı, düz zemin + ince kenarlık */}
                <Box
                  sx={{
                    width: { xs: 280, md: 400 },
                    height: { xs: 280, md: 400 },
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Box
                    component="img"
                    src="/sagliktanLogo.png"
                    alt="Sağlıktan"
                    sx={{
                      width: { xs: 120, md: 160 },
                      height: { xs: 120, md: 160 },
                      borderRadius: '24px'
                    }}
                  />
                  {/* Yüzen ikon rozetleri */}
                  <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Groups2Rounded sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '5%',
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Forum sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
              Neden Sağlıktan?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Sağlık yolculuğunuzda yanınızda olmak için tasarlandı
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: 'background.default',
                    transition: 'border-color 0.15s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'rgba(76, 184, 159, 0.35)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(63, 156, 135, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5
                    }}
                  >
                    <feature.icon sx={{ color: 'secondary.main', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, color: 'primary.main', fontSize: '1.125rem', fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
              Nasıl Çalışır?
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Üç basit adımda topluluğa katılın
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {steps.map((step, index) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* axe-core (bkz. e2e/accessibility.spec.js) bu rakamları
                      color-contrast ihlali olarak işaretledi. Önceki düzeltme
                      denemesi (aria-hidden) YANLIŞTI: aria-hidden yalnızca
                      ekran okuyucu ağacından çıkarır, ama color-contrast
                      kuralı GÖRSEL algıyla ilgili - az gören ama ekran
                      okuyucu kullanmayan sighted kullanıcıları koruyor, bu
                      yüzden aria-hidden'a rağmen ihlal olarak işaretlenmeye
                      devam etti (doğrulandı: gerçek test koşusunda hâlâ 3
                      öğe raporlandı). Gerçek düzeltme opaklığı artırmak -
                      56px/800 weight "large text" eşiğine (3:1) göre
                      opaklık 0.75'te ~3.5:1 sağlıyor, "soluk dekoratif"
                      hissi korunuyor ama artık okunabilir. aria-hidden yine
                      de duruyor: rakamlar salt görsel süsleme, adım sırası
                      zaten step.title ve DOM sırasıyla ekran okuyucuya
                      iletiliyor. */}
                  <Typography
                    aria-hidden="true"
                    sx={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      color: 'rgba(63, 156, 135, 0.75)',
                      lineHeight: 1,
                      mb: 2
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h3" sx={{ color: 'primary.main', mb: 1, fontSize: '1.25rem', fontWeight: 700 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Faz4: gradyan dolgu + glow blur kaldırıldı, düz zemin
          üzerinde tek bir ince kenarlıklı kart olarak sadeleştirildi. */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 8 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
              Sağlık Topluluğuna Katılın
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mb: 4, maxWidth: 480, mx: 'auto' }}
            >
              Sağlık yolculuğunuzda yalnız değilsiniz. Aramıza katılın, sizi anlayan
              bir topluluğun parçası olun.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              endIcon={<ArrowForward />}
              sx={{ minWidth: 220 }}
            >
              Ücretsiz Kayıt Ol
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/sagliktanLogo.png"
                alt="Sağlıktan"
                sx={{ width: 32, height: 32, borderRadius: '8px' }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                © {new Date().getFullYear()} Sağlıktan. Tüm hakları saklıdır.
              </Typography>
            </Box>
            <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ flexWrap: 'wrap', justifyContent: 'center', rowGap: 1 }}>
              {[
                { label: 'Hakkımızda', path: '/hakkimizda' },
                { label: 'Topluluk Kuralları', path: '/topluluk-kurallari' },
                { label: 'Kullanım Şartları', path: '/kullanim-sartlari' },
                { label: 'Gizlilik Politikası', path: '/gizlilik-politikasi' },
                { label: 'Yardım', path: '/yardim' }
              ].map((link) => (
                // Faz8-6: önceden tıklanabilir Typography'ydi - klavye/screen
                // reader ile erişilemiyordu ve WelcomeScreen'den Gizlilik/
                // Kullanım Şartları/Yardım'a giden TEK yol buydu. Gerçek
                // Link'e çevrildi.
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  variant="body2"
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    display: 'inline-block', py: 1, my: -1,
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Box>
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: { xs: 'center', sm: 'right' } }}>
            <TrustBadges align={{ xs: 'center', sm: 'flex-end' }} />
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
