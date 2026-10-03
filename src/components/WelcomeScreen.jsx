import { Box, Button, Container, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChatBubbleOutlineRounded, CheckCircleRounded, GavelRounded, LockRounded, ThumbUpAltRounded, VerifiedUserOutlined
} from '@mui/icons-material'
import TrustBadges from './TrustBadges.jsx'
import Companion from './avatars/Companion.jsx'
import PathScene from './welcome/PathScene.jsx'
import { radius } from '../design/tokens.js'
import '../styles/companions.css'

const FEATURES = [
  {
    companion: 'damla',
    title: 'Senin hastalığına özel gruplar',
    text: 'Her hastalığın kendi grubu ve konu başlıkları var. Sohbet, soru-cevap, tedavi ve araştırmalar ayrı ayrı; aradığını kolayca bulursun.',
  },
  {
    companion: 'baykus',
    title: 'Sorulara deneyimle cevap',
    text: 'Merak ettiğin şeyi büyük ihtimalle biri yaşamıştır. Soruna gelen cevaplardan en faydalısı öne çıkar.',
  },
  {
    companion: 'kirpi',
    title: 'Faydalı oldukça açılan yol arkadaşları',
    text: 'Paylaşımın birine iyi geldiğinde "Faydalı" oyu alırsın. Oylar arttıkça profilin için yeni yol arkadaşları açılır.',
  },
  {
    companion: 'kaplumbaga',
    title: 'Kendi hızında, güvenle',
    text: 'Birebir mesajlar izinle başlar; engelleme ve şikayet bir dokunuş uzağında. Yazı boyutu, tema ve kontrast da senin elinde.',
  },
]

const GALLERY = ['filiz', 'damla', 'bulut', 'cakil', 'papatya', 'kirpi', 'kaplumbaga', 'serce', 'kedi', 'baykus', 'gunes', 'yildiz']
const GALLERY_OPEN = 4

const TRUST = [
  { Icon: VerifiedUserOutlined, text: 'KVKK uyumlu; bilgilerin şifreli bağlantıyla korunur.' },
  { Icon: GavelRounded, text: 'Topluluk kuralları ve şikayet sistemiyle özenli moderasyon.' },
  { Icon: LockRounded, text: 'Sağlık bilgilerini paylaşıp paylaşmamak tamamen senin kararın.' },
]

const FOOTER_LINKS = [
  { label: 'Hakkımızda', path: '/hakkimizda' },
  { label: 'Topluluk Kuralları', path: '/topluluk-kurallari' },
  { label: 'Kullanım Şartları', path: '/kullanim-sartlari' },
  { label: 'Gizlilik Politikası', path: '/gizlilik-politikasi' },
  { label: 'Yardım', path: '/yardim' },
]

function SectionTitle({ title, lead, align = 'left' }) {
  return (
    <Box sx={{ mb: { xs: 3.5, md: 5 }, textAlign: align, maxWidth: 620, mx: align === 'center' ? 'auto' : 0 }}>
      <Typography variant="h2" sx={{ mb: 1.25 }}>{title}</Typography>
      {lead && <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { md: '1.125rem' } }}>{lead}</Typography>}
    </Box>
  )
}

// Örnek bir soru ve en faydalı cevap: toplulukta bir anın nasıl göründüğünü
// anlatan sade bir çizim. Gerçek kişi/veri değildir.
function SampleThread() {
  const bubble = { p: { xs: 2, sm: 2.5 }, borderRadius: `${radius.lg}px`, bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border' }
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 520, width: '100%', mx: 'auto' }} aria-label="Örnek bir soru ve cevap" role="group">
      <Box sx={bubble}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
          <Companion name="papatya" size={40} />
          <Box>
            <Typography variant="subtitle2" component="p">Bir hasta yakını</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Retinitis Pigmentosa · Soru-Cevap</Typography>
          </Box>
        </Stack>
        <Typography variant="h5" component="p" sx={{ mb: 0.5 }}>Akşam yürüyüşlerinde neler işinize yarıyor?</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Kızım hava kararınca dışarı çıkmakta zorlanıyor. Deneyip memnun kaldığınız bir şey var mı?
        </Typography>
      </Box>
      <Box sx={{ ...bubble, ml: { xs: 2.5, sm: 5 }, borderColor: 'primary.main', borderWidth: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
          <Companion name="baykus" size={36} />
          <Typography variant="subtitle2" component="p" sx={{ flex: 1 }}>10 yıldır bu yolda olan bir üye</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ px: 1, py: 0.25, borderRadius: `${radius.pill}px`, bgcolor: 'brand.primarySoft', color: 'primary.main' }}>
            <CheckCircleRounded sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 800 }}>En faydalı cevap</Typography>
          </Stack>
        </Stack>
        <Typography variant="body2">
          Telefonun fenerini sürekli açık tutmak ve kontrastlı baston ucu bizde çok fark yarattı. Bir de yürüyüşü
          alışık olduğu, iyi aydınlatılmış bir rotada yapmayı öneririm.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1.5, color: 'text.secondary' }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'brand.apricotInk' }}>
            <ThumbUpAltRounded sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 800 }}>24 kişi faydalı buldu</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>8 yanıt</Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  // ProtectedRoute, giriş gerektiren bir deep-link'ten (bildirim maili,
  // paylaşılan /post/:id, hikaye kartı QR'ı) buraya state.from ile yönlendirir
  // - login'e giderken o state taşınmazsa kullanıcı girişten sonra hep
  // /home'a düşüyor, asıl gitmek istediği sayfa kayboluyordu.
  const goLogin = () => navigate('/login', { state: location.state })
  const goRegister = () => navigate('/register')

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh', overflowX: 'hidden' }}>
      {/* Üst çubuk */}
      <Box
        component="header"
        sx={{
          position: 'sticky', top: 0, zIndex: 1000, bgcolor: 'background.default',
          borderBottom: '1px solid', borderColor: 'brand.border', pt: 'env(safe-area-inset-top)'
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.25, minHeight: 64 }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box component="img" src="/sagliktanLogo.png" alt="" sx={{ width: 40, height: 40, borderRadius: `${radius.sm}px` }} />
              <Typography variant="h5" component="p" sx={{ color: 'primary.main', fontWeight: 800 }}>Sağlıktan</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="text" onClick={goLogin} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Giriş Yap
              </Button>
              <Button variant="contained" onClick={goRegister}>
                Başla
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box component="main">
        {/* Karşılama */}
        <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 9 }, pb: { xs: 6, md: 10 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' }, gap: { xs: 2, md: 6 }, alignItems: 'center' }}>
            <Box className="page-transition" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                component="p"
                sx={{
                  display: 'inline-block', px: 1.5, py: 0.5, mb: 2, borderRadius: `${radius.pill}px`,
                  bgcolor: 'brand.apricotSoft', color: 'brand.apricotInk', fontWeight: 800, fontSize: '0.875rem'
                }}
              >
                Kronik ve nadir hastalıklar topluluğu
              </Typography>
              <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '2.4rem', sm: '3rem', md: '3.6rem' }, lineHeight: 1.08 }}>
                Aynı yoldan geçenlerle{' '}
                buluş.
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3.5, fontSize: { xs: '1.0625rem', md: '1.1875rem' }, maxWidth: 520, mx: { xs: 'auto', md: 0 } }}>
                Sağlıktan; kronik ve nadir hastalıklarla yaşayanların ve yakınlarının deneyimlerini paylaştığı,
                güvenli ve sıcak bir topluluk. Sorunu sor, hikâyeni anlat, seni gerçekten anlayan insanlarla tanış.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ maxWidth: { xs: 360, sm: 'none' }, mx: { xs: 'auto', md: 0 } }}>
                <Button variant="contained" size="large" onClick={goRegister} sx={{ minWidth: 200 }}>
                  Topluluğa katıl
                </Button>
                <Button variant="outlined" size="large" onClick={goLogin} sx={{ minWidth: 160 }}>
                  Giriş Yap
                </Button>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, fontWeight: 600 }}>
                Ücretsiz. Kayıt bir dakika sürer.
              </Typography>
            </Box>
            <Box sx={{ order: { xs: -1, md: 0 }, maxWidth: { xs: 420, md: 'none' }, width: '100%', mx: 'auto' }}>
              <PathScene />
            </Box>
          </Box>
        </Container>

        {/* Burada neler var */}
        <Box component="section" sx={{ bgcolor: 'background.paper', py: { xs: 7, md: 11 }, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'brand.border' }}>
          <Container maxWidth="lg">
            <SectionTitle
              title="Burada seni neler bekliyor?"
              lead="Teşhis koymayan, tavsiye satmayan; sadece aynı şeyleri yaşamış insanların birbirine el uzattığı bir yer."
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: { sm: 5, md: 8 }, rowGap: { xs: 3.5, md: 5 } }}>
              {FEATURES.map(f => (
                <Stack key={f.title} direction="row" spacing={2} alignItems="flex-start">
                  <Companion name={f.companion} size={60} />
                  <Box>
                    <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>{f.title}</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>{f.text}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Bir an */}
        <Container component="section" maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }, gap: { xs: 4, md: 8 }, alignItems: 'center' }}>
            <Box>
              <SectionTitle
                title="Bir soru, birçok deneyim"
                lead="Bir şeyi ilk kez yaşarken en çok ihtiyaç duyduğun şey, onu daha önce yaşamış birinin sesi olabiliyor. Burada sorular, deneyimle cevaplanır."
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: { xs: -1.5, md: -2.5 }, p: 1.75, borderRadius: `${radius.md}px`, bgcolor: 'brand.surfaceAlt' }}>
                Burada paylaşılanlar kişisel deneyimdir, tıbbi tavsiyenin yerini tutmaz. Tanı ve tedavi için
                her zaman doktoruna danış.
              </Typography>
            </Box>
            <SampleThread />
          </Box>
        </Container>

        {/* Yol arkadaşları */}
        <Box component="section" sx={{ bgcolor: 'brand.apricotSoft', py: { xs: 7, md: 10 } }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <SectionTitle
              align="center"
              title="Yol arkadaşların seni bekliyor"
              lead="Herkes ilk dört yol arkadaşıyla başlar. Paylaşımların başkalarına faydalı geldikçe yenileri açılır; profilinde seni onlar temsil eder."
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, auto)', justifyContent: 'center', gap: { xs: 1, sm: 2 } }} aria-hidden>
              {GALLERY.map((name, i) => {
                const locked = i >= GALLERY_OPEN
                return (
                  <Box key={name} sx={{ position: 'relative' }}>
                    <Companion
                      name={name}
                      size={64}
                      sx={{
                        width: { xs: 48, sm: 72 }, height: { xs: 48, sm: 72 },
                        border: '3px solid', borderColor: 'background.paper',
                        filter: locked ? 'grayscale(0.85)' : 'none', opacity: locked ? 0.55 : 1
                      }}
                    />
                    {locked && (
                      <Box sx={{ position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'background.paper', color: 'text.secondary' }}>
                        <LockRounded sx={{ fontSize: 13 }} />
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Container>
        </Box>

        {/* Güven */}
        <Container component="section" maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <SectionTitle title="Sana iyi gelecek kadar sakin, güvenli bir yer" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 4 } }}>
            {TRUST.map((item) => {
              const TrustIcon = item.Icon
              const text = item.text
              return (
              <Stack key={text} direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: `${radius.sm}px`, display: 'grid', placeItems: 'center', bgcolor: 'brand.primarySoft', color: 'primary.main' }}>
                  <TrustIcon />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, pt: 1 }}>{text}</Typography>
              </Stack>
              )
            })}
          </Box>
        </Container>

        {/* Son çağrı */}
        <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
          <Box
            sx={{
              position: 'relative', overflow: 'hidden', textAlign: 'center',
              px: { xs: 3, md: 8 }, py: { xs: 6, md: 8 }, borderRadius: { xs: `${radius.lg}px`, md: `${radius.xl}px` },
              bgcolor: 'primary.main', color: 'primary.contrastText'
            }}
          >
            <Stack direction="row" justifyContent="center" sx={{ mb: 2.5 }} aria-hidden>
              {['serce', 'filiz', 'kedi'].map((n, i) => (
                <Box key={n} sx={{ ml: i ? -1.5 : 0, borderRadius: '50%', border: '3px solid', borderColor: 'primary.main' }}>
                  <Companion name={n} size={i === 1 ? 68 : 56} />
                </Box>
              ))}
            </Stack>
            <Typography variant="h2" sx={{ color: 'inherit', mb: 1.25 }}>Yalnız değilsin.</Typography>
            <Typography variant="body1" sx={{ color: 'inherit', opacity: 0.92, mb: 3.5, maxWidth: 480, mx: 'auto', fontSize: { md: '1.125rem' } }}>
              Seni anlayan insanlar burada. Bir dakikada aramıza katıl, ilk yol arkadaşınla tanış.
            </Typography>
            <Button variant="contained" color="secondary" size="large" onClick={goRegister} sx={{ minWidth: 220 }}>
              Ücretsiz kayıt ol
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Alt bilgi */}
      <Box component="footer" sx={{ py: 4, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'brand.border' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box component="img" src="/sagliktanLogo.png" alt="" sx={{ width: 32, height: 32, borderRadius: '8px' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                © {new Date().getFullYear()} Sağlıktan. Tüm hakları saklıdır.
              </Typography>
            </Stack>
            <Stack component="nav" aria-label="Alt bağlantılar" direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ flexWrap: 'wrap', justifyContent: 'center', rowGap: 1 }}>
              {FOOTER_LINKS.map(link => (
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  variant="body2"
                  underline="hover"
                  sx={{ color: 'text.secondary', display: 'inline-block', py: 1.25, my: -1 }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Stack>
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <TrustBadges align={{ xs: 'center', sm: 'flex-end' }} />
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
