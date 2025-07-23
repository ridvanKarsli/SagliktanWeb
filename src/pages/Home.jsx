import { Box, Typography, Container, useMediaQuery, useTheme, Grid, Paper, Avatar } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import SpaIcon from '@mui/icons-material/Spa';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import MedicalInformationRoundedIcon from '@mui/icons-material/MedicalInformationRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SelfImprovementRoundedIcon from '@mui/icons-material/SelfImprovementRounded';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          flexGrow: 1,
          p: 0,
          bgcolor: 'linear-gradient(135deg, #FAF9F6 0%, #E6F4F1 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <Avatar
            src="/sagliktanLogo.png"
            alt="Sağlıktan Logo"
            sx={{ width: 120, height: 120, mx: 'auto', mb: 3, boxShadow: 3, bgcolor: 'white' }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main', mb: 2, letterSpacing: '-0.02em' }}>
            SAĞLIKTAN
          </Typography>
          <Typography variant="h5" sx={{ color: 'info.main', mb: 3, fontWeight: 500 }}>
            Kronik Hastalıklar İçin Sosyal ve Bilgilendirici Platform
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: 18 }}>
            Kronik hastalığa sahip bireyleri, sağlık çalışanlarını ve bilgi arayanları bir araya getiren dijital sosyal platform.
            Yapay zeka destekli içerik önerileri, topluluk desteği ve uzman katkılarıyla donatıldı.
          </Typography>
        </Container>
      </Box>

      {/* Platform Özellikleri */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'center' }}>
          Platform Özellikleri
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: '#FDFDFC' }}>
              <Diversity3RoundedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Topluluk Etkileşimi</Typography>
              <Typography color="text.secondary">
                Başlık aç, yorum yap, katkı sun. Şeffaf ve açık iletişimle bilgiyi paylaş.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: '#FDFDFC' }}>
              <MedicalInformationRoundedIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Uzman Katılımı</Typography>
              <Typography color="text.secondary">
                Doktorlar, hemşireler ve diğer sağlık profesyonellerinden güvenilir bilgi alın.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: '#FDFDFC' }}>
              <SmartToyRoundedIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Yapay Zeka Desteği</Typography>
              <Typography color="text.secondary">
                Yapay zeka ile içerik önerisi ve sağlık görevlisi analizleri elinizin altında.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: '#FDFDFC' }}>
              <SelfImprovementRoundedIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Huzurlu Deneyim</Typography>
              <Typography color="text.secondary">
                Yumuşak renkler ve sade tasarım ile gözünüz ve ruhunuz dinlensin.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Hedef Kullanıcılar */}
      <Box sx={{ bgcolor: '#FDFDFC', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'center' }}>
            Kimler İçin Tasarlandı?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontSize: 17 }}>
            <b>1. Toplum Üyeleri:</b> Kronik hastalığa sahip bireyler, hasta yakınları ve sağlık hakkında bilinçlenmek isteyen herkes.
            <br />
            <b>2. Sağlık Görevlileri:</b> Doktorlar, hemşireler, paramedikler, diyetisyenler ve eczacılar platformda bilgi paylaşabilir.
          </Typography>
        </Container>
      </Box>

      {/* AI Analizi Özeti */}
      <Box sx={{ py: 6, bgcolor: 'linear-gradient(90deg, #E6F4F1 0%, #FAF9F6 100%)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            Yapay Zeka ile Katkı Analizi
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontSize: 17 }}>
            Uzman katkıları şu kriterlere göre analiz edilir:
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <ul style={{ paddingLeft: 24 }}>
              <li><b>Çözüm Odaklılık</b> – Net ve uygulanabilir öneriler</li>
              <li><b>Bilgiyi Aktarabilme</b> – Anlaşılır ve sade anlatım</li>
              <li><b>Empati</b> – Duyarlılık ve insani yaklaşım</li>
              <li><b>Güncellik & Tutarlılık</b> – Doğru ve güvenilir bilgi</li>
            </ul>
          </Box>
        </Container>
      </Box>

      {/* Nasıl Kullanılır */}
      <Box sx={{ bgcolor: '#FDFDFC', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'center' }}>
            Platformu Nasıl Kullanabilirim?
          </Typography>
          <Box sx={{ maxWidth: 700, mx: 'auto', color: 'text.secondary', fontSize: 18 }}>
            <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
              <li style={{ marginBottom: 16 }}><b>Gönderi Oluştur</b> ve tartışmaya başla.</li>
              <li style={{ marginBottom: 16 }}><b>AI ile Konuş</b> seçeneğiyle hızlı yanıt al.</li>
              <li style={{ marginBottom: 16 }}><b>Profil Ara</b> ile sağlık görevlilerini keşfet.</li>
              <li style={{ marginBottom: 16 }}>Topluluğun desteğiyle yalnız hissetmeden bilgiye ulaş.</li>
            </ul>
          </Box>
        </Container>
      </Box>

      <Footer />
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default Home;
