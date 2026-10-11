// Sağlıktan'a bağlı yerlerin ve mola noktalarının sakin sayfası (EK v1.2 §B, §D).
// Gösterilen sayılar yalnızca bakan kişinin kendi verisi (GET /pulse).
import { Box, Button, ButtonBase, Link, Stack, Typography } from '@mui/material'
import {
  ArticleRounded, AutoAwesomeRounded, ChatRounded, EditRounded, EmojiFoodBeverageRounded, GavelRounded,
  GroupsRounded, HelpOutlineRounded, OpenInNewRounded, QuestionAnswerRounded, SelfImprovementRounded, WavesRounded,
  VolunteerActivismRounded,
} from '@mui/icons-material'
import { Garden } from '../art/index.js'
import { focusRingSx } from '../../design/focus.js'
import GameSheet from '../ui/GameSheet.jsx'

const PLACE_NAMES = {
  qa_cafe: 'Soru-Cevap Kahvesi',
  notice_board: 'Mahalle Panosu',
  library: 'Kütüphane',
  post_office: 'Mahalle Postanesi',
  checkin_bench: 'Bugün nasılsın?',
  checkin_pier: 'Biraz dinlenmek ister misin?',
  fountain: 'Bir dilek tut',
  tea_table: 'Bir çay molası?',
  garden_gate: 'Bahçene bak',
}

// Güvenilir kaynaklar: yalnızca resmî, köklü hizmetler; tıbbi tavsiye yok.
const TRUSTED = [
  {
    name: 'e-Nabız',
    desc: 'Sağlık Bakanlığı’nın kişisel sağlık kaydı sistemi: tahlil, reçete ve muayene bilgilerin.',
    href: 'https://enabiz.gov.tr',
    label: 'enabiz.gov.tr',
  },
  {
    name: 'MHRS randevu',
    desc: 'Merkezî Hekim Randevu Sistemi. Telefonla: ALO 182.',
    href: 'https://mhrs.gov.tr',
    label: 'mhrs.gov.tr',
  },
  {
    name: '112 Acil Çağrı',
    desc: 'Acil durumlarda ücretsiz arayabileceğin tek numara.',
    href: 'tel:112',
    label: '112’yi ara',
  },
]

const bigBtn = { minHeight: 56, justifyContent: 'flex-start', px: 2.25, borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', textTransform: 'none' }

function ActionButton({ icon, children, onClick, variant = 'contained' }) {
  return (
    <Button variant={variant} startIcon={icon} onClick={onClick} sx={bigBtn}>{children}</Button>
  )
}

// İyilik bahçesini büyükçe göster (sayı yok, yalnızca görüntü)
function GardenPreview({ garden }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', borderRadius: '20px', bgcolor: '#E9F6EC', py: 1 }}>
      <svg width="260" height="150" viewBox="-95 -60 190 110" role="img" aria-label="İyilik bahçen">
        <g transform="translate(-34 -18) scale(1.1)">
          <Garden flowers={garden?.flowers || 0} lanterns={garden?.lanterns || 0} width={3} depth={2} />
        </g>
      </svg>
    </Box>
  )
}

export default function PlaceSheet({ place, open, onClose, pulse, garden, onGo, onBreathe, onWaves, onWish, onTea }) {
  if (!place) return null
  const key = place.key
  const share = (ipucu) => onGo(`/home?yaz=1&ipucu=${ipucu}`)
  let subtitle = null
  let body = null

  if (key === 'qa_cafe') {
    const n = pulse?.openQuestionCount
    subtitle = typeof n === 'number'
      ? (n > 0 ? `Gruplarında ${n} soru cevap bekliyor` : 'Gruplarındaki her soru şimdilik bir cevap buldu')
      : 'Gruplarındaki sorulara bir göz at'
    body = (
      <Stack spacing={1}>
        <ActionButton icon={<QuestionAnswerRounded />} onClick={() => onGo('/home?tab=questions')}>Sorulara göz at</ActionButton>
        <ActionButton variant="outlined" icon={<EditRounded />} onClick={() => share('soru')}>Ben de soru sorayım</ActionButton>
      </Stack>
    )
  } else if (key === 'notice_board') {
    subtitle = 'Bu hafta gruplarında en çok faydalı bulunanlar'
    const items = pulse?.weeklyHighlights || []
    body = items.length ? (
      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {items.map((h) => (
          <li key={h.postId}>
            <ButtonBase
              onClick={() => onGo(`/post/${h.postId}`)}
              sx={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: 1.25, p: 1.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: '#FFFBF2', '&.Mui-focusVisible': focusRingSx, '&:hover': { bgcolor: '#FFF4E0' } }}
            >
              <ArticleRounded sx={{ color: '#A07250' }} aria-hidden="true" />
              <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>{h.title}</Typography>
            </ButtonBase>
          </li>
        ))}
      </Stack>
    ) : (
      <Typography sx={{ color: 'text.secondary', py: 2 }}>Bu hafta panoda henüz bir şey yok.</Typography>
    )
  } else if (key === 'library') {
    subtitle = 'Sakin bir köşe; aradığın bilgiye buradan ulaş'
    body = (
      <Stack spacing={1}>
        <ActionButton variant="outlined" icon={<GavelRounded />} onClick={() => onGo('/topluluk-kurallari')}>Topluluk kuralları</ActionButton>
        <ActionButton variant="outlined" icon={<HelpOutlineRounded />} onClick={() => onGo('/yardim')}>Yardım</ActionButton>
        <ActionButton variant="outlined" icon={<GroupsRounded />} onClick={() => onGo('/groups')}>Gruplarım</ActionButton>
        <Typography component="h3" sx={{ fontWeight: 800, pt: 1.5 }}>Güvenilir kaynaklar</Typography>
        {TRUSTED.map((t) => (
          <Box key={t.name} sx={{ p: 1.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 800 }}>{t.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>{t.desc}</Typography>
            <Link
              href={t.href}
              target={t.href.startsWith('http') ? '_blank' : undefined}
              rel={t.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              sx={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 0.5, minHeight: 44 }}
            >
              {t.label}{t.href.startsWith('http') && <OpenInNewRounded sx={{ fontSize: 16 }} aria-label="(yeni sekmede açılır)" />}
            </Link>
          </Box>
        ))}
      </Stack>
    )
  } else if (key === 'post_office') {
    const n = pulse?.unreadMessageCount
    subtitle = typeof n === 'number' ? (n > 0 ? `Okunmamış ${n} mesajın var` : 'Yeni mesajın yok') : 'Mesajların burada'
    body = <ActionButton icon={<ChatRounded />} onClick={() => onGo('/messages')}>Mesajlarıma git</ActionButton>
  } else if (key === 'checkin_bench') {
    subtitle = 'Bankta biraz otur, nefeslen'
    body = (
      <Stack spacing={1}>
        <ActionButton icon={<EditRounded />} onClick={() => share('nasilsin')}>Gruplarımla paylaş</ActionButton>
        <ActionButton variant="outlined" icon={<SelfImprovementRounded />} onClick={onBreathe}>1 dakikalık nefes</ActionButton>
      </Stack>
    )
  } else if (key === 'checkin_pier') {
    subtitle = 'Denize karşı bir mola'
    body = (
      <Stack spacing={1}>
        <ActionButton icon={<WavesRounded />} onClick={onWaves}>Dalgaları dinle</ActionButton>
        <ActionButton variant="outlined" icon={<EditRounded />} onClick={() => share('sevinc')}>Bugün sana iyi gelen bir şey</ActionButton>
      </Stack>
    )
  } else if (key === 'fountain') {
    subtitle = 'Çeşmenin başında küçük bir an'
    body = (
      <Stack spacing={1}>
        <ActionButton icon={<AutoAwesomeRounded />} onClick={onWish}>Dilek tut</ActionButton>
        <ActionButton variant="outlined" icon={<VolunteerActivismRounded />} onClick={() => share('tesekkur')}>Birine teşekkür et</ActionButton>
      </Stack>
    )
  } else if (key === 'tea_table') {
    subtitle = 'Bir bardak çay, birkaç dakika'
    body = (
      <Stack spacing={1}>
        <ActionButton icon={<EmojiFoodBeverageRounded />} onClick={onTea}>Çay iç</ActionButton>
        <ActionButton variant="outlined" icon={<QuestionAnswerRounded />} onClick={() => onGo('/home?tab=questions')}>Sorulara göz at</ActionButton>
      </Stack>
    )
  } else if (key === 'garden_gate') {
    body = (
      <Stack spacing={1.5}>
        <GardenPreview garden={garden} />
        <Typography sx={{ lineHeight: 1.5 }}>Bu çiçekler Sağlıktan’da birine iyi geldiğin anlarda açtı.</Typography>
      </Stack>
    )
  }

  return (
    <GameSheet open={open} onClose={onClose} title={PLACE_NAMES[key] || 'Mahalle'} subtitle={subtitle}>
      {body}
    </GameSheet>
  )
}
