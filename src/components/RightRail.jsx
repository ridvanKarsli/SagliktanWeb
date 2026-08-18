import { useEffect, useState } from 'react'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { GroupsRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import { getMyDiseaseGroups, joinDiseaseGroup, listDiseaseGroups } from '../services/api.js'

/**
 * Masaüstü üçüncü sütun - X.com'un "Bağlantıda kal" / Instagram web'in
 * "Önerilenler" widget'ıyla aynı fikir: sol nav + orta akış tek başına
 * kaldığında masaüstü genişliğin büyük kısmı boş kalıyordu (kullanıcı geri
 * bildirimi: "genel site yapısı ... x ve instagrama göre uyarla" - X/IG'de
 * geniş ekranda üçüncü bir sütun her zaman vardır). Sadece çok geniş
 * ekranlarda (lg+) görünür - dar/orta masaüstünde sıkışmasın diye. Mobilde
 * hiç render edilmiyor (bkz. ResponsiveShell.jsx).
 */
const RAIL_WIDTH = 320

export default function RightRail() {
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [joinedIds, setJoinedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState(null)

  useEffect(() => {
    if (!token) return
    let mounted = true
    Promise.all([listDiseaseGroups(token), getMyDiseaseGroups(token)])
      .then(([all, mine]) => {
        if (!mounted) return
        const sorted = (Array.isArray(all) ? all : [])
          .slice()
          .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0))
          .slice(0, 5)
        setGroups(sorted)
        setJoinedIds(new Set((Array.isArray(mine) ? mine : []).map(g => g.id)))
      })
      .catch(() => { /* widget ikincil - sessizce boş göster */ })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [token])

  const handleJoin = async (id) => {
    setPendingId(id)
    try {
      await joinDiseaseGroup(token, id)
      setJoinedIds(prev => new Set(prev).add(id))
      showSuccess('Gruba katıldınız.')
    } catch (err) {
      showError(err.message || 'Gruba katılınamadı.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Box
      component="aside"
      sx={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        py: 4,
        pr: 3,
        display: { xs: 'none', lg: 'block' }
      }}
    >
      <Box sx={{ position: 'sticky', top: 24 }}>
        <Box sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, px: 2.5, pt: 2.25, pb: 1.5 }}>
            Popüler Gruplar
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={20} />
            </Box>
          ) : groups.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', px: 2.5, pb: 2.25 }}>
              Şu an gösterilecek grup yok.
            </Typography>
          ) : (
            <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
              {groups.map(g => {
                const joined = joinedIds.has(g.id)
                return (
                  <Stack
                    key={g.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    onClick={() => navigate(`/groups/${g.id}`)}
                    sx={{ px: 2.5, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      display: 'grid', placeItems: 'center', bgcolor: 'rgba(76,184,159,0.16)', color: 'primary.main'
                    }}>
                      <GroupsRounded sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {g.memberCount ?? 0} üye
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant={joined ? 'outlined' : 'contained'}
                      disabled={joined || pendingId === g.id}
                      onClick={(e) => { e.stopPropagation(); handleJoin(g.id) }}
                      sx={{ flexShrink: 0, minHeight: 32, px: 1.5, fontSize: '0.75rem' }}
                    >
                      {pendingId === g.id ? <CircularProgress size={14} color="inherit" /> : joined ? 'Katıldın' : 'Katıl'}
                    </Button>
                  </Stack>
                )
              })}
            </Stack>
          )}
          <Box
            onClick={() => navigate('/groups')}
            sx={{ px: 2.5, py: 1.5, cursor: 'pointer', borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Tümünü Gör
            </Typography>
          </Box>
        </Box>

        {/* X'in sağ sütununun altındaki küçük yasal link satırı deseni */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2.5, px: 1 }}>
          {[
            { label: 'Hakkımızda', path: '/hakkimizda' },
            { label: 'Kullanım Şartları', path: '/kullanim-sartlari' },
            { label: 'Gizlilik Politikası', path: '/gizlilik-politikasi' },
            { label: 'Yardım', path: '/yardim' }
          ].map(link => (
            <Typography
              key={link.path}
              variant="caption"
              onClick={() => navigate(link.path)}
              sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {link.label}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
