import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import { Box, Container, TextField, InputAdornment, Paper, Typography, useMediaQuery, useTheme, CircularProgress, Grid, Avatar, Chip, IconButton, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { getAllUsers } from '../services/api';
import { useNavigate } from 'react-router-dom';

const roleColor = (role) => {
  if (!role) return 'default';
  if (role.toLowerCase().includes('doctor') || role.toLowerCase().includes('doktor')) return 'info';
  if (role.toLowerCase().includes('hasta') || role.toLowerCase().includes('user')) return 'secondary';
  return 'default';
};

const normalize = (str) => (str || '').toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

const roleFilterOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'user', label: 'Kullanıcı' },
  { value: 'doctor', label: 'Doktor' },
];

const SearchUserPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const navigate = useNavigate();

  // Load search history and recent profiles from localStorage
  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem('searchUserHistory') || '[]');
    setSearchHistory(hist);
    const rec = JSON.parse(localStorage.getItem('recentProfiles') || '[]');
    setRecentProfiles(rec);
  }, []);

  // Save search to history
  const saveSearchToHistory = (term) => {
    if (!term) return;
    let hist = JSON.parse(localStorage.getItem('searchUserHistory') || '[]');
    hist = hist.filter((h) => normalize(h) !== normalize(term));
    hist.unshift(term);
    if (hist.length > 5) hist = hist.slice(0, 5);
    setSearchHistory(hist);
    localStorage.setItem('searchUserHistory', JSON.stringify(hist));
  };

  // Remove from history
  const removeFromHistory = (term) => {
    let hist = JSON.parse(localStorage.getItem('searchUserHistory') || '[]');
    hist = hist.filter((h) => normalize(h) !== normalize(term));
    setSearchHistory(hist);
    localStorage.setItem('searchUserHistory', JSON.stringify(hist));
  };

  // Save recent profile
  const saveRecentProfile = (user) => {
    let rec = JSON.parse(localStorage.getItem('recentProfiles') || '[]');
    rec = rec.filter((u) => u.userID !== user.userID);
    rec.unshift({ userID: user.userID, name: user.name, surname: user.surname, email: user.email, role: user.role });
    if (rec.length > 5) rec = rec.slice(0, 5);
    setRecentProfiles(rec);
    localStorage.setItem('recentProfiles', JSON.stringify(rec));
  };

  // Remove from recent profiles
  const removeFromRecentProfiles = (userID) => {
    let rec = JSON.parse(localStorage.getItem('recentProfiles') || '[]');
    rec = rec.filter((u) => u.userID !== userID);
    setRecentProfiles(rec);
    localStorage.setItem('recentProfiles', JSON.stringify(rec));
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    getAllUsers()
      .then(data => setUsers(data))
      .catch(() => setError('Kullanıcılar alınamadı.'))
      .finally(() => setLoading(false));
  }, []);

  // Arama kutusunda enter veya arama ikonuna tıklanınca geçmişe ekle
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (normalize(search)) {
      saveSearchToHistory(search);
    }
  };

  // Arama kutusunda enter ile arama
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleRoleFilter = (e, value) => {
    if (value) setRoleFilter(value);
  };

  const filtered = users.filter(u => {
    const q = normalize(search);
    if (!q) return false;
    const keywords = q.split(' ');
    const fields = [normalize(u.name), normalize(u.surname), normalize(u.email), normalize(u.role)];
    const roleOk =
      roleFilter === 'all' ||
      (roleFilter === 'user' && (normalize(u.role) === 'user' || normalize(u.role) === 'hasta')) ||
      (roleFilter === 'doctor' && normalize(u.role) === 'doctor');
    return (
      roleOk && keywords.every(kw => fields.some(field => field.includes(kw)))
    );
  });

  const handleUserClick = (userID) => {
    const user = users.find(u => u.userID === userID);
    if (user) saveRecentProfile(user);
    navigate(`/profile/${userID}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="sm" sx={{ flexGrow: 1, pt: 6, pb: isMobile ? 8 : 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            Kişi Ara
          </Typography>
          <form onSubmit={handleSearch} autoComplete="off">
            <TextField
              fullWidth
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Doktor, kullanıcı veya uzman ara..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="info" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" edge="end" aria-label="ara">
                      <SearchRoundedIcon color="primary" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 1.5, borderRadius: 2, bgcolor: 'background.default' }}
            />
          </form>
          {/* Rol filtresi */}
          <ToggleButtonGroup
            value={roleFilter}
            exclusive
            onChange={handleRoleFilter}
            sx={{ mb: 2 }}
            size="small"
            color="primary"
            fullWidth
          >
            {roleFilterOptions.map(opt => (
              <ToggleButton key={opt.value} value={opt.value} sx={{ fontWeight: 600, px: 2 }}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {/* Arama geçmişi */}
          {searchHistory.length > 0 && (
            <Box sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ color: 'info.main', mb: 1, fontWeight: 600 }}>
                <HistoryRoundedIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> Son Aramalar
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {searchHistory.map((item, idx) => (
                  <Chip
                    key={item + idx}
                    label={item}
                    onClick={() => setSearch(item)}
                    onDelete={() => removeFromHistory(item)}
                    sx={{ mb: 1, bgcolor: 'grey.100', fontWeight: 500 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          {/* Son profiller */}
          {!normalize(search) && recentProfiles.length > 0 && (
            <Box sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1, fontWeight: 600 }}>
                <PersonSearchRoundedIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> Son Ziyaret Edilen Profiller
              </Typography>
              <Stack direction="column" spacing={1}>
                {recentProfiles.map((user) => (
                  <Paper
                    key={user.userID}
                    elevation={1}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 3, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6, bgcolor: 'grey.50' } }}
                    onClick={() => handleUserClick(user.userID)}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.info.light, width: 40, height: 40 }}>
                      <PersonSearchRoundedIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {user.name} {user.surname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <Chip label={user.role} color={roleColor(user.role)} sx={{ fontWeight: 600, fontSize: 13 }} />
                    <IconButton size="small" onClick={e => { e.stopPropagation(); removeFromRecentProfiles(user.userID); }}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ py: 2 }}>{error}</Typography>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              {filtered.length === 0 && normalize(search) ? (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    Sonuç bulunamadı.
                  </Typography>
                </Grid>
              ) : filtered.map(user => (
                <Grid item xs={12} key={user.userID}>
                  <Paper
                    elevation={1}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6, bgcolor: 'grey.50' } }}
                    onClick={() => handleUserClick(user.userID)}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.info.light, width: 48, height: 48 }}>
                      <PersonSearchRoundedIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {user.name} {user.surname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Doğum Tarihi: {user.dateOfBirth}
                      </Typography>
                    </Box>
                    <Chip label={user.role} color={roleColor(user.role)} sx={{ fontWeight: 600, fontSize: 14 }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
      <Footer />
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default SearchUserPage; 