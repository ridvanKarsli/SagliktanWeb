import { useMemo, useState, useEffect } from 'react'
import { Box, Button, Avatar, Grid, TextField, Stack, Typography, Divider } from '@mui/material'
import { mockUsers } from '../data/fakeData.js'
import { useLocation, useNavigate } from 'react-router-dom'
import Surface from '../components/Surface.jsx'

function initialsFrom(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) {
    const s = parts[0]
    return ((s[0] || '') + (s[1] || '')).toUpperCase()
  }
  return '?'
}

export default function Search() {
  const loc = useLocation()
  const nav = useNavigate()
  const params = new URLSearchParams(loc.search)
  const initialQ = params.get('q') || ''
  const [q, setQ] = useState(initialQ)
  const [connected, setConnected] = useState({})

  useEffect(() => { setQ(initialQ) }, [initialQ])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return mockUsers
    return mockUsers.filter(u => u.name.toLowerCase().includes(s) || u.title.toLowerCase().includes(s))
  }, [q])

  const toggleConnect = (id) => setConnected(prev => ({ ...prev, [id]: !prev[id] }))
  const onLocalSearch = (e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q.trim())}`) }

  return (
    <Surface sx={{ borderRadius: 10 }}>
      <Stack spacing={2} component="form" onSubmit={onLocalSearch} sx={{ mb: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>Kişi Ara</Typography>
        <TextField fullWidth placeholder="Uzman veya kullanıcı ara…" value={q} onChange={e => setQ(e.target.value)} />
      </Stack>

      <Grid container>
        {results.map((u, i) => (
          <Grid item xs={12} key={u.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: { xs: 0.5, md: 1 } }}>
              <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 800 }}>
                {initialsFrom(u.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }} noWrap>{u.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>{u.title}</Typography>
              </Box>
              <Button onClick={() => toggleConnect(u.id)} size="small" sx={{ whiteSpace: 'nowrap' }}>
                {connected[u.id] ? 'Bağlantıyı Kes' : 'Bağlan'}
              </Button>
            </Box>
            {i < results.length - 1 && <Divider />}
          </Grid>
        ))}
      </Grid>
    </Surface>
  )
}
