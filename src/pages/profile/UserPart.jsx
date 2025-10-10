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

export default function UserPart({ publicUserData, sectionKey }) {
  if (!publicUserData) return null

  if (sectionKey === 'diseases') {
    return (
      <SectionList
        emptyText="Kayıtlı hastalık bulunamadı."
        items={publicUserData?.diseases}
        renderItem={(d) => (
          <Stack spacing={0.5}>
            <SubRow label="Hastalık" value={d.name} />
            <SubRow label="Tanı Tarihi" value={prettyDate(d.dateOfDiagnosis)} />
          </Stack>
        )}
        getKey={(d, i) => d.diseaseID || i}
      />
    )
  }

  return null
}
