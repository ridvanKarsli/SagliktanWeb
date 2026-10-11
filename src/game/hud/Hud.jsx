// Dünyanın üstündeki arayüz: üstte kimlik + tohum + günlük ödül, sağda
// ayarlar/çıkış; altta büyük ikonlu gezinme çubuğu. Dünya hep gündüz
// paletinde olduğundan HUD da uygulama temasından bağımsız açık renktedir.
// Ölçüler rem: büyük yazı modunda birlikte büyür.
import { Badge, Box, ButtonBase, Typography } from '@mui/material'
import { AddRounded, LogoutRounded, RemoveRounded, SettingsRounded } from '@mui/icons-material'
import { CharacterBust } from '../art/index.js'
import { focusRingSx } from '../../design/focus.js'
import { SeedGlyph } from '../ui/SeedGlyph.jsx'
import { HUD_INK, pillSx } from './hudStyle.js'


export function RoundButton({ label, onClick, children, sx, badge, showLabel = false }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      title={label}
      sx={{
        ...pillSx, minWidth: '2.9rem', height: '2.9rem', px: showLabel ? 1.5 : 0, gap: 0.75,
        '&.Mui-focusVisible': focusRingSx, '&:hover': { bgcolor: '#FFFFFF' }, pointerEvents: 'auto', ...sx,
      }}
    >
      <Badge color="error" badgeContent={badge || 0} max={99} overlap="circular">
        <Box sx={{ display: 'flex', '& svg': { fontSize: '1.45rem' } }}>{children}</Box>
      </Badge>
      {showLabel && <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>{label}</Typography>}
    </ButtonBase>
  )
}

export function TopHud({ profile, zoneName, onProfile, onSettings, onExit, onDaily, dailyBusy, extraLeft, rightExtra }) {
  return (
    <Box
      sx={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, pointerEvents: 'none',
        pt: 'calc(env(safe-area-inset-top) + 0.6rem)', px: 'calc(env(safe-area-inset-left) + 0.6rem)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-start', minWidth: 0 }}>
        <ButtonBase
          onClick={onProfile}
          aria-label={`${profile.nickname}, ${profile.seeds} tohum. Ayarları aç`}
          sx={{ ...pillSx, pointerEvents: 'auto', pl: 0.5, pr: 1.5, py: 0.5, gap: 1, maxWidth: '100%', '&.Mui-focusVisible': focusRingSx }}
        >
          <CharacterBust appearance={profile.appearance} size={40} />
          <Box sx={{ textAlign: 'left', minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.15, maxWidth: '9.5rem' }} noWrap>{profile.nickname}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <SeedGlyph size={16} />
              <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#2F8F78' }}>{profile.seeds}</Typography>
              {zoneName && <Typography component="span" sx={{ fontSize: '0.8rem', color: '#4A635D', ml: 0.5 }} noWrap>· {zoneName}</Typography>}
            </Box>
          </Box>
        </ButtonBase>
        {profile.dailyAvailable && onDaily && (
          <ButtonBase
            onClick={onDaily}
            disabled={dailyBusy}
            className="smg-glow"
            sx={{ ...pillSx, pointerEvents: 'auto', bgcolor: '#FFF4E0', px: 1.5, height: '2.6rem', gap: 0.75, border: '2px solid #F2A33A', '&.Mui-focusVisible': focusRingSx }}
          >
            <SeedGlyph size={20} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#8A5300', whiteSpace: 'nowrap' }}>Günlük tohumunu al</Typography>
          </ButtonBase>
        )}
        {extraLeft}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75, flexShrink: 0, pr: 'env(safe-area-inset-right)' }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <RoundButton label="Ayarlar" onClick={onSettings}><SettingsRounded /></RoundButton>
          <RoundButton label="Sağlıktan’a dön" onClick={onExit} sx={{ bgcolor: '#2F8F78', color: '#fff', '&:hover': { bgcolor: '#2A806B' } }}>
            <LogoutRounded />
          </RoundButton>
        </Box>
        {rightExtra}
      </Box>
    </Box>
  )
}

// items: [{ key, label, icon, onClick, badge, active }]
export function BottomBar({ items }) {
  return (
    <Box
      component="nav"
      aria-label="Mahalle menüsü"
      sx={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
        px: 'calc(env(safe-area-inset-left) + 0.5rem)', pb: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          ...pillSx, borderRadius: '22px', pointerEvents: 'auto', display: 'grid',
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, width: '100%', maxWidth: 560, p: 0.5,
        }}
      >
        {items.map((it) => (
          <ButtonBase
            key={it.key}
            onClick={it.onClick}
            aria-label={it.badge ? `${it.label}, ${it.badge} yeni` : it.label}
            sx={{
              flexDirection: 'column', gap: 0.25, minHeight: '3.6rem', borderRadius: '18px', px: 0.25,
              color: it.active ? '#2F8F78' : HUD_INK,
              '&:hover': { bgcolor: 'rgba(76,184,159,0.12)' }, '&.Mui-focusVisible': focusRingSx,
            }}
          >
            <Badge color="error" badgeContent={it.badge || 0} max={99}>
              <Box sx={{ display: 'flex', '& svg': { fontSize: '1.7rem' } }} aria-hidden="true">{it.icon}</Box>
            </Badge>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', lineHeight: 1.1, maxWidth: '100%', '@media (max-width: 359px)': { fontSize: '0.68rem' } }} noWrap>{it.label}</Typography>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  )
}

export function ZoomControls({ onIn, onOut, canIn, canOut, sx }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pointerEvents: 'auto', ...sx }}>
      <RoundButton label="Yakınlaştır" onClick={onIn} sx={{ opacity: canIn ? 1 : 0.5 }}><AddRounded /></RoundButton>
      <RoundButton label="Uzaklaştır" onClick={onOut} sx={{ opacity: canOut ? 1 : 0.5 }}><RemoveRounded /></RoundButton>
    </Box>
  )
}
