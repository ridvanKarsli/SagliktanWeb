import { Box, Divider, Typography } from '@mui/material'

// PrivacyPolicy/TermsOfService/AboutUs/CommunityGuidelines'ın hepsinde aynı
// "başlıklı bölümler + aralarında ayraç" deseni tekrarlanıyordu - bkz.
// StaticPageShell.jsx ile aynı gerekçe.
export default function StaticPageSections({ sections }) {
  return sections.map((section, i) => (
    <Box key={section.title} sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
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
  ))
}
