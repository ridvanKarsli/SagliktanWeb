// Yumuşak "kapsül" sekmeler: seçili sekmenin arkasındaki yeşil kapsül
// (MUI göstergesi) sekmeler arasında yaylanarak kayar. Ana sayfa ve arama
// sekmeleri aynı görünümü kullanır. <Tabs sx={pillTabsSx}> ile.
export const pillTabsSx = {
  minHeight: 48,
  p: 0.5,
  borderRadius: '999px',
  bgcolor: 'brand.surfaceAlt',
  '& .MuiTabs-indicator': {
    height: '100%',
    top: 0,
    borderRadius: '999px',
    bgcolor: 'background.paper',
    boxShadow: (t) => `0 2px 10px rgba(${t.palette.brand.shadowRgb}, 0.12)`,
    transition: 'left 360ms var(--ease-spring), width 360ms var(--ease-spring)'
  },
  '& .MuiTabs-flexContainer': { gap: 0.5 },
  '& .MuiTab-root': {
    zIndex: 1,
    minHeight: 44,
    borderRadius: '999px',
    px: 2,
    color: 'text.secondary',
    transition: 'color 200ms ease',
    '&.Mui-selected': { color: 'primary.main' },
    '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: -3 }
  },
  '& .MuiTabs-scrollButtons': { width: 32, borderRadius: '999px' }
}
