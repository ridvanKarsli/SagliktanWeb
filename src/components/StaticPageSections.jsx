import { Box, Divider, Typography } from '@mui/material'

// PrivacyPolicy/TermsOfService/AboutUs/CommunityGuidelines'ın hepsinde aynı
// "başlıklı bölümler + aralarında ayraç" deseni tekrarlanıyordu - bkz.
// StaticPageShell.jsx ile aynı gerekçe.
export default function StaticPageSections({ sections }) {
  return sections.map((section, i) => (
    <Box key={section.title} sx={{ mb: i < sections.length - 1 ? 4 : 0 }}>
      <Typography variant="h4" component="h2" sx={{ mb: 1.25, color: 'text.primary' }}>
        {section.title}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.primary', whiteSpace: 'pre-line', lineHeight: 1.75 }}
      >
        {section.body}
      </Typography>
      {i < sections.length - 1 && <Divider sx={{ mt: 4 }} />}
    </Box>
  ))
}
