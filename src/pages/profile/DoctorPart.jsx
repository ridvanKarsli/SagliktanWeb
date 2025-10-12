import {
  Box, Stack, Typography, Divider, Chip
} from '@mui/material'
import {
  LocalHospital, WorkHistory, Business, Place, Phone, Email, Campaign
} from '@mui/icons-material'

/* ------- Shared UI ------- */
function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}

function GlassTile({ icon, label, value, inline = false }) {
  return (
    <Box
      sx={{
        display: inline ? 'grid' : 'flex',
        gridTemplateColumns: inline ? { xs: '1fr', sm: '180px 1fr' } : undefined,
        alignItems: 'flex-start',
        gap: 1,
        p: { xs: 1, sm: 1.25 },
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(7,20,28,0.36), rgba(7,20,28,0.20))',
        backdropFilter: 'blur(8px)',
        wordBreak: 'break-word'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="overline" sx={{ letterSpacing: 0.5, opacity: 0.85 }}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{ fontWeight: 700, color: '#FAF9F6', wordBreak: 'break-word' }}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}

function Section({ title, children, chipIcon }) {
  return (
    <Stack spacing={1.25} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          icon={chipIcon ?? <LocalHospital sx={{ fontSize: 18 }} />}
          label={title}
          color="primary"
          variant="outlined"
          sx={{
            borderColor: 'rgba(52,195,161,0.45)',
            bgcolor: 'rgba(52,195,161,0.08)',
            '& .MuiChip-label': { fontWeight: 700 }
          }}
        />
      </Box>
      <Stack spacing={1}>
        {children}
      </Stack>
      <Divider sx={{ opacity: 0.16, mt: 0.5 }} />
    </Stack>
  )
}

/* ------- Component ------- */
export default function DoctorPart({ doctorData, sectionKey }) {
  if (!doctorData) return null

  if (sectionKey === 'spec') {
    const items = Array.isArray(doctorData?.specialization) ? doctorData.specialization : []
    if (items.length === 0) {
      return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Uzmanlık alanı bulunamadı.</Typography>
    }
    return (
      <Section title="Uzmanlık" chipIcon={<LocalHospital sx={{ fontSize: 18 }} />}>
        {items.map((spec, i) => (
          <Box key={spec.specializationID || i} sx={{ display: 'grid', gap: 1 }}>
            <GlassTile
              icon={<LocalHospital fontSize="small" />}
              label="Uzmanlık"
              value={spec.nameOfSpecialization}
              inline
            />
            <GlassTile
              icon={<WorkHistory fontSize="small" />}
              label="Deneyim"
              value={
                (spec.specializationExperience ?? spec.experienceYears) != null
                  ? `${spec.specializationExperience ?? spec.experienceYears} yıl`
                  : '—'
              }
              inline
            />
          </Box>
        ))}
      </Section>
    )
  }

  if (sectionKey === 'addr') {
    const items = Array.isArray(doctorData?.worksAddress) ? doctorData.worksAddress : []
    if (items.length === 0) {
      return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Çalışma adresi bulunamadı.</Typography>
    }
    return (
      <Section title="Adresler" chipIcon={<Business sx={{ fontSize: 18 }} />}>
        {items.map((a, i) => (
          <Box key={a.adressID || a.addressID || i} sx={{ display: 'grid', gap: 1 }}>
            <GlassTile
              icon={<Business fontSize="small" />}
              label="İş Yeri"
              value={a.workPlaceName}
              inline
            />
            <GlassTile
              icon={<Place fontSize="small" />}
              label="Adres"
              value={[a.street, a.county, a.city, a.country].filter(Boolean).join(', ')}
              inline
            />
          </Box>
        ))}
      </Section>
    )
  }

  if (sectionKey === 'contact') {
    const items = Array.isArray(doctorData?.contactInfor) ? doctorData.contactInfor : []
    if (items.length === 0) {
      return <Typography variant="body2" sx={{ color: 'text.secondary' }}>İletişim bilgisi bulunamadı.</Typography>
    }
    return (
      <Section title="İletişim" chipIcon={<Phone sx={{ fontSize: 18 }} />}>
        {items.map((c, i) => (
          <Box key={c.contactID || i} sx={{ display: 'grid', gap: 1 }}>
            <GlassTile
              icon={<Email fontSize="small" />}
              label="E-posta"
              value={c.email}
              inline
            />
            <GlassTile
              icon={<Phone fontSize="small" />}
              label="Telefon"
              value={c.phoneNumber}
              inline
            />
          </Box>
        ))}
      </Section>
    )
  }

  if (sectionKey === 'ann') {
    const items = Array.isArray(doctorData?.announcement) ? doctorData.announcement : []
    if (items.length === 0) {
      return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Duyuru bulunamadı.</Typography>
    }
    return (
      <Section title="Duyurular" chipIcon={<Campaign sx={{ fontSize: 18 }} />}>
        {items.map((a, i) => (
          <Box key={a.announcementID || i} sx={{ display: 'grid', gap: 1 }}>
            <GlassTile icon={<Campaign fontSize="small" />} label="Başlık" value={a.title} inline />
            <GlassTile label="İçerik" value={a.content} inline />
            <GlassTile label="Tarih" value={prettyDate(a.uploadDate)} inline />
          </Box>
        ))}
      </Section>
    )
  }

  return null
}
