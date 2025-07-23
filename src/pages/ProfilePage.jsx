import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Avatar,
  Grid
} from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import { getLoggedUser, getDoctorDetails, getUserById, getPublicUserById } from '../services/api';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [publicUserDetails, setPublicUserDetails] = useState(null);
  const { userID } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        if (userID) {
          data = await getUserById(userID);
          if (!data || !data.userID) throw new Error();
        } else {
          data = await getLoggedUser();
        }
        setUser(data);
        if (data.role === 'doctor') {
          const docData = await getDoctorDetails(data.userID);
          setDoctorDetails(docData);
        } else if (userID && (data.role === 'user' || data.role === 'hasta')) {
          const pubData = await getPublicUserById(data.userID);
          setPublicUserDetails(pubData);
        }
      } catch (err) {
        setError('Bu kullanıcıya ulaşılamıyor.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userID]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'background.default', pb: isMobile ? 8 : 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 5,
                maxWidth: 520,
                width: '100%',
                boxShadow: '0 4px 32px 0 rgba(11,58,78,0.10)',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', mb: 2, fontSize: 40 }}>
                  <AccountCircleRoundedIcon fontSize="inherit" />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {user.name} {user.surname}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'info.main', fontWeight: 500, mb: 1 }}>
                  {user.role === 'doctor' ? 'Doktor' : 'Kullanıcı'}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlternateEmailRoundedIcon color="info" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventRoundedIcon color="info" />
                    <Typography variant="body1">{user.dateOfBirth}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FingerprintRoundedIcon color="info" />
                    <Typography variant="body1">ID: {user.userID}</Typography>
                  </Box>
                </Grid>
              </Grid>
              {/* Doktor detayları */}
              {user.role === 'doctor' && doctorDetails && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    Doktor Detayları
                  </Typography>
                  {/* Uzmanlıklar */}
                  {doctorDetails.specialization && doctorDetails.specialization.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main' }}>Uzmanlıklar</Typography>
                      {doctorDetails.specialization.map((spec) => (
                        <Box key={spec.specializationID} sx={{ ml: 2, mb: 1 }}>
                          <Typography variant="body2">- {spec.nameOfSpecialization} ({spec.specializationExperience} yıl)</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {/* Çalışma Adresleri */}
                  {doctorDetails.worksAddress && doctorDetails.worksAddress.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main' }}>Çalışma Adresleri</Typography>
                      {doctorDetails.worksAddress.map((addr) => (
                        <Box key={addr.adressID} sx={{ ml: 2, mb: 1 }}>
                          <Typography variant="body2">- {addr.workPlaceName}, {addr.street}, {addr.county}, {addr.city}, {addr.country}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {/* İletişim Bilgileri */}
                  {doctorDetails.contactInfor && doctorDetails.contactInfor.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main' }}>İletişim Bilgileri</Typography>
                      {doctorDetails.contactInfor.map((c) => (
                        <Box key={c.contactID} sx={{ ml: 2, mb: 1 }}>
                          <Typography variant="body2">- {c.email} / {c.phoneNumber}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {/* Duyurular */}
                  {doctorDetails.announcement && doctorDetails.announcement.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main' }}>Duyurular</Typography>
                      {doctorDetails.announcement.map((a) => (
                        <Box key={a.announcementID} sx={{ ml: 2, mb: 1 }}>
                          <Typography variant="body2">- <b>{a.title}:</b> {a.content} <span style={{ color: '#888', fontSize: 12 }}>({a.uploadDate})</span></Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              {/* Public user detayları */}
              {userID && publicUserDetails && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    Kullanıcı Detayları
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <b>Hastalıklar:</b> {publicUserDetails.diseases || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        ) : null}
      </Box>
      <Footer />
      {isMobile && <BottomNav />}
    </Box>
  );
};

export default ProfilePage; 