import { useEffect, useState } from 'react'
import { Box, Button, Container, Link, Stack, Typography } from '@mui/material'
import { CheckCircleRounded, LockOutlined } from '@mui/icons-material'
import { Link as RouterLink, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getPublicGroup } from '../services/api.js'
import { pathFromRef, rememberAfterAuthPath } from '../utils/afterAuth.js'
import { truncate } from '../utils/text.js'
import { radius } from '../design/tokens.js'
import TrustBadges from '../components/TrustBadges.jsx'
import NotFound from './NotFound.jsx'
import FullScreenLoader from '../components/common/FullScreenLoader.jsx'

// index.html'deki varsayılan başlık; sayfadan çıkarken geri yüklenir.
const DEFAULT_TITLE = document.title
// Küçük topluluklarda sayı göstermek hem yanıltıcı hem de kimliklendirme
// açısından gereksiz; üye sayısı ancak bu eşiğin üstünde gösterilir.
const MEMBER_COUNT_MIN = 20

const FOR_WHOM = [
  'Bu hastalıkla yaşayan kişiler',
  'Anne babalar, eşler ve diğer hasta yakınları',
  'Deneyimini paylaşmak isteyen sağlık çalışanları',
]

// Kayıt olmayan ziyaretçiler için hastalık grubu tanıtım sayfası (/g/:slug).
// İçerik veritabanındaki grup ve alt grup bilgisinden gelir: yönetici yeni
// bir grup eklediğinde sayfası kendiliğinden oluşur. Üye gönderileri burada
// yer almaz (bkz. backend PublicGroupResponse).
export default function GroupIntro() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const targetPath = pathFromRef(params.get('ref'))
  // { slug, status: 'ready' | 'missing' | 'error', group }
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getPublicGroup(slug, { signal: controller.signal })
      .then(group => setResult({ slug, status: 'ready', group }))
      .catch(err => {
        if (err?.name === 'AbortError') return
        setResult({ slug, status: err?.status === 404 ? 'missing' : 'error', group: null })
      })
    return () => controller.abort()
  }, [slug, attempt])

  // Paylaşım bağlantısıyla gelindiyse kayıt/giriş sonrası o gönderiye dönülsün.
  useEffect(() => {
    if (targetPath) rememberAfterAuthPath(targetPath)
  }, [targetPath])

  const current = result?.slug === slug ? result : null
  const group = current?.group || null

  // Sayfaya özel başlık ve açıklama (çıkarken varsayılana döner).
  useEffect(() => {
    if (!group) return undefined
    const meta = document.querySelector('meta[name="description"]')
    const previous = meta?.getAttribute('content')
    document.title = `${group.name} topluluğu | Sağlıktan`
    meta?.setAttribute('content', truncate(
      `${group.name} ile yaşayanların ve hasta yakınlarının deneyim paylaştığı topluluk. ${group.description || ''}`, 155
    ))
    return () => {
      document.title = DEFAULT_TITLE
      if (meta && previous != null) meta.setAttribute('content', previous)
    }
  }, [group])

  if (authLoading) return <FullScreenLoader />
  // Üye zaten içeride: paylaşılan gönderiye ya da gruplara git.
  if (isAuthenticated) return <Navigate to={targetPath || '/groups'} replace />
  if (!current) return <FullScreenLoader />
  if (current.status === 'missing') return <NotFound />

  const goRegister = () => navigate('/register')
  const goLogin = () => navigate('/login', targetPath ? { state: { from: { pathname: targetPath } } } : undefined)

  const card = { p: { xs: 2.5, sm: 3 }, borderRadius: `${radius.lg}px`, bgcolor: 'background.paper', border: '1px solid', borderColor: 'brand.border' }

  const header = (
    <Container maxWidth="md">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 'calc(env(safe-area-inset-top) + 12px)', pb: 1 }}>
        <Link component={RouterLink} to="/" underline="none" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, minHeight: 44 }}>
          <Box component="img" src="/sagliktanLogo-96.png" alt="" sx={{ width: 32, height: 32, borderRadius: '8px' }} />
          <Typography variant="subtitle1" component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>Sağlıktan</Typography>
        </Link>
        <Button variant="text" onClick={goLogin}>Giriş yap</Button>
      </Stack>
    </Container>
  )

  if (current.status === 'error') {
    return (
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        {header}
        <Container component="main" maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>Sayfa şu an açılamadı</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Bağlantını kontrol edip tekrar dene.
          </Typography>
          <Button variant="contained" onClick={() => { setResult(null); setAttempt(n => n + 1) }}>Tekrar dene</Button>
        </Container>
      </Box>
    )
  }

  const topics = Array.isArray(group.topics) ? group.topics : []
  const showMemberCount = group.memberCount >= MEMBER_COUNT_MIN

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      {header}

      <Container component="main" maxWidth="md" sx={{ pb: 8, pt: { xs: 3, md: 5 } }} className="page-transition">
        <Typography
          component="p"
          sx={{ display: 'inline-block', px: 1.5, py: 0.5, mb: 2, borderRadius: `${radius.pill}px`, bgcolor: 'brand.apricotSoft', color: 'brand.apricotInk', fontWeight: 800, fontSize: '0.875rem' }}
        >
          Hastalık topluluğu{showMemberCount ? ` · ${group.memberCount} üye` : ''}
        </Typography>
        <Typography variant="h1" sx={{ mb: 1.5, fontSize: { xs: '2rem', md: '2.6rem' } }}>{group.name} topluluğu</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, fontSize: { md: '1.125rem' }, maxWidth: 640 }}>
          {group.description || `${group.name} ile yaşayanlar ve yakınları burada deneyimlerini paylaşıyor.`}
        </Typography>

        {targetPath && (
          <Box sx={{ ...card, mb: 3, borderColor: 'primary.main', borderWidth: 2 }}>
            <Typography variant="subtitle1" component="p" sx={{ fontWeight: 800, mb: 0.5 }}>
              Seninle bir paylaşım paylaşıldı
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Paylaşımlar yalnızca üyelere açık. Katıldıktan ya da giriş yaptıktan sonra seni doğrudan o paylaşıma götüreceğiz.
            </Typography>
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
          <Button variant="contained" size="large" onClick={goRegister} sx={{ minWidth: 220 }}>Ücretsiz katıl</Button>
          <Button variant="outlined" size="large" onClick={goLogin} sx={{ minWidth: 160 }}>Giriş yap</Button>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 4 }}>
          Kayıt bir dakika sürer. İstersen adın yerine takma ad kullanabilirsin.
        </Typography>

        {topics.length > 0 && (
          <>
            <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>Bu toplulukta neler konuşuluyor?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 4 }}>
              {topics.map(topic => (
                <Box key={topic.name} sx={card}>
                  <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800, mb: topic.description ? 0.5 : 0 }}>{topic.name}</Typography>
                  {topic.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{topic.description}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}

        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>Kimler için?</Typography>
        <Stack spacing={1} sx={{ mb: 4 }}>
          {FOR_WHOM.map(item => (
            <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
              <CheckCircleRounded sx={{ fontSize: 22, color: 'primary.main', mt: '1px' }} />
              <Typography variant="body1">{item}</Typography>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ ...card, mb: 4 }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <LockOutlined sx={{ fontSize: 24, color: 'primary.main', mt: '2px' }} />
            <Box>
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, mb: 0.5 }}>Paylaşımlar yalnızca üyelere açık</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Üyelerin yazdıkları bu sayfada ve arama motorlarında görünmez. Sana ancak kabul ettiğin kişiler mesaj
                yazabilir; profilini istediğin zaman kapatabilirsin.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sağlıktan teşhis koymaz ve tedavi önermez. Burada paylaşılanlar kişisel deneyimdir, tıbbi tavsiye
                yerine geçmez.{' '}
                <Link component={RouterLink} to="/topluluk-kurallari">Topluluk kuralları</Link>
                {' · '}
                <Link component={RouterLink} to="/gizlilik-politikasi">Gizlilik</Link>
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ textAlign: 'center', px: { xs: 3, md: 6 }, py: { xs: 4, md: 5 }, borderRadius: `${radius.lg}px`, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h2" sx={{ color: 'inherit', mb: 1, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>Yalnız değilsin.</Typography>
          <Typography variant="body1" sx={{ color: 'inherit', opacity: 0.92, mb: 3 }}>Seni anlayan insanlar burada.</Typography>
          <Button variant="contained" color="secondary" size="large" onClick={goRegister} sx={{ minWidth: 220 }}>Ücretsiz katıl</Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <TrustBadges />
        </Box>
      </Container>
    </Box>
  )
}
