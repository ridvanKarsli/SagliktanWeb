import { Box, Collapse } from '@mui/material'
import SettingsRow from './SettingsRow.jsx'

// Dokununca altında bir panel açılan ayar satırı.
export default function ExpandableSettingsRow({ icon, label, danger, open, onToggle, children }) {
  return (
    <Box>
      <SettingsRow icon={icon} label={label} danger={danger} open={open} onClick={onToggle} />
      <Collapse in={open} unmountOnExit>
        {children}
      </Collapse>
    </Box>
  )
}
