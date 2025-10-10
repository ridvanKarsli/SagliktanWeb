import { Box, Stack, Typography, Divider } from '@mui/material'

function prettyDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !isNaN(dt) ? dt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'
}

function SectionList({ items, renderItem, getKey, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emptyText}</Typography>
  }
  return (
    <Stack divider={<Divider sx={{ my: 1 }} />} spacing={1}>
      {items.map((it, i) => (
        <Box key={getKey?.(it, i) ?? i}>{renderItem(it, i)}</Box>
      ))}
    </Stack>
  )
}

function SubRow({ label, value }) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
      gap: { xs: 0.5, sm: 1 },
      alignItems: 'start'
    }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value || '—'}</Typography>
    </Box>
  )
}

export default function DoctorPart({ doctorData, sectionKey }) {
  if (!doctorData) return null

  if (sectionKey === 'spec') {
    return (
      <SectionList
        emptyText="Uzmanlık alanı bulunamadı."
        items={doctorData?.specialization}
        renderItem={(spec) => (
          <Stack spacing={0.5}>
            <SubRow label="Uzmanlık" value={spec.nameOfSpecialization} />
            <SubRow label="Deneyim" value={
              (spec.specializationExperience ?? spec.experienceYears) != null
                ? `${spec.specializationExperience ?? spec.experienceYears} yıl`
                : '—'
            } />
          </Stack>
        )}
        getKey={(spec, i) => spec.specializationID || i}
      />
    )
  }

  if (sectionKey === 'addr') {
    return (
      <SectionList
        emptyText="Çalışma adresi bulunamadı."
        items={doctorData?.worksAddress}
        renderItem={(a) => (
          <Stack spacing={0.5}>
            <SubRow label="İş Yeri" value={a.workPlaceName} />
            <SubRow label="Adres" value={[a.street, a.county, a.city, a.country].filter(Boolean).join(', ')} />
          </Stack>
        )}
        getKey={(a, i) => a.adressID || a.addressID || i}
      />
    )
  }

  if (sectionKey === 'contact') {
    return (
      <SectionList
        emptyText="İletişim bilgisi bulunamadı."
        items={doctorData?.contactInfor}
        renderItem={(c) => (
          <Stack spacing={0.5}>
            <SubRow label="E-posta" value={c.email} />
            <SubRow label="Telefon" value={c.phoneNumber} />
          </Stack>
        )}
        getKey={(c, i) => c.contactID || i}
      />
    )
  }

  if (sectionKey === 'ann') {
    return (
      <SectionList
        emptyText="Duyuru bulunamadı."
        items={doctorData?.announcement}
        renderItem={(a) => (
          <Stack spacing={0.5}>
            <SubRow label="Başlık" value={a.title} />
            <SubRow label="İçerik" value={a.content} />
            <SubRow label="Tarih" value={prettyDate(a.uploadDate)} />
          </Stack>
        )}
        getKey={(a, i) => a.announcementID || i}
      />
    )
  }

  return null
}
