import React, { useState, useEffect } from 'react';
import {
  Fab,
  Box,
  Paper,
  Typography,
  Modal,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Collapse,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Stack,
  Fade,
  Grow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { getAllChats, likeChatPost, dislikeChatPost, getLikedPeople, getDislikedPeople } from '../services/api';
import CommentSection from './CommentSection';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  background: 'rgba(253, 253, 252, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(52, 195, 161, 0.1)',
  borderRadius: theme.spacing(2.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    border: '1px solid rgba(52, 195, 161, 0.2)',
    boxShadow: '0px 12px 40px rgba(11, 58, 78, 0.1)',
    transform: 'translateY(-4px)',
  },
}));

const FloatingFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  zIndex: 1000,
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  color: theme.palette.primary.main,
  boxShadow: '0px 12px 40px rgba(52, 195, 161, 0.3)',
  animation: `${float} 3s ease-in-out infinite`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.info.light} 100%)`,
    boxShadow: '0px 16px 48px rgba(52, 195, 161, 0.4)',
    transform: 'scale(1.1)',
  },
}));

const ActionButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  color: active ? theme.palette.secondary.main : theme.palette.primary.main,
  backgroundColor: active ? 'rgba(52, 195, 161, 0.1)' : 'transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: active 
      ? 'rgba(52, 195, 161, 0.2)' 
      : 'rgba(52, 195, 161, 0.08)',
    transform: 'scale(1.1)',
  },
  '&:active': {
    animation: `${pulse} 0.3s ease-in-out`,
  },
}));

const UserAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'role',
})(({ theme, role }) => ({
  width: 48,
  height: 48,
  background: role === 'doctor' || role === 'DOKTOR'
    ? `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.main} 100%)`
    : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.light} 100%)`,
  color: theme.palette.primary.main,
  fontWeight: 600,
  border: `2px solid ${role === 'doctor' || role === 'DOKTOR' ? theme.palette.info.main : theme.palette.secondary.main}`,
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(52, 195, 161, 0.1)',
  color: theme.palette.info.main,
  border: '1px solid rgba(52, 195, 161, 0.2)',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'rgba(52, 195, 161, 0.15)',
  },
}));

const DoctorBadge = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.65rem',
  fontWeight: 600,
  backgroundColor: 'rgba(27, 122, 133, 0.1)',
  color: theme.palette.info.main,
  border: `1px solid ${theme.palette.info.main}`,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  background: 'rgba(253, 253, 252, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(52, 195, 161, 0.2)',
  boxShadow: '0px 24px 80px rgba(11, 58, 78, 0.25)',
  padding: theme.spacing(4),
  width: '90%',
  maxWidth: '500px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
  position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  },
}));

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [openComments, setOpenComments] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [likedPeopleModal, setLikedPeopleModal] = useState({ open: false, chatID: null, people: [], type: 'like' });

  useEffect(() => {
    setIsVisible(true);
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getAllChats();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Gönderiler yüklenemedi:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewContent('');
    setNewCategory('');
  };

  const handleAddPost = () => {
    if (newContent.trim()) {
      const newPost = {
          chatID: Date.now(),
          message: newContent,
          likedUser: [],
          dislikedUser: [],
          uploadDate: new Date().toISOString().split('T')[0],
          userID: 999,
          category: newCategory || 'Genel',
          author: { name: 'Sen', surname: '' },
          comments: []
      };
      setPosts([newPost, ...posts]);
      handleClose();
    }
  };

  const handleLike = async (chatID) => {
    try {
      console.log(`Gönderi beğeniliyor: ${chatID}`); // Debug için
      
      // Optimistic update - UI'ı hemen güncelle
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? { ...post, likedUser: [...(post.likedUser || []), { userID: 1, name: 'Sen', surname: '', role: 'HASTA' }] }
        : post
    ));

      // API çağrısı yap
      await likeChatPost(chatID);
      console.log('✅ Gönderi başarıyla beğenildi!');
      
    } catch (error) {
      console.error('Beğeni hatası:', error);
      
      // Hata durumunda optimistic update'i geri al
      setPosts(posts => posts.map(post =>
        post.chatID === chatID
          ? { ...post, likedUser: (post.likedUser || []).slice(0, -1) }
          : post
      ));
      
      // Kullanıcıya hata mesajı göster (isteğe bağlı)
      alert('Gönderi beğenilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDislike = async (chatID) => {
    try {
      console.log(`Gönderi beğenilmiyor: ${chatID}`); // Debug için
      
      // Optimistic update - UI'ı hemen güncelle
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? { ...post, dislikedUser: [...(post.dislikedUser || []), { userID: 1, name: 'Sen', surname: '', role: 'HASTA' }] }
        : post
    ));

      // API çağrısı yap
      await dislikeChatPost(chatID);
      console.log('✅ Gönderi başarıyla beğenilmedi!');

    } catch (error) {
      console.error('Beğenmeme hatası:', error);

      // Hata durumunda optimistic update'i geri al
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
          ? { ...post, dislikedUser: (post.dislikedUser || []).slice(0, -1) }
        : post
    ));
      
      // Kullanıcıya hata mesajı göster (isteğe bağlı)
      alert('Gönderi beğenilmezken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const toggleComments = (chatID) => {
    setOpenComments((prev) => ({ ...prev, [chatID]: !prev[chatID] }));
  };

  const handleCommentAdded = (chatID, newComment) => {
    // Posts state'ini güncelle - yeni yorumu ilgili post'un comments array'ine ekle
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? { ...post, comments: [newComment, ...(post.comments || [])] }
        : post
    ));
    console.log('✅ Posts state güncellendi, yeni yorum eklendi');
  };

  const handleShowLikedPeople = async (chatID, type = 'like') => {
    try {
      console.log(`${type === 'like' ? 'Beğenen' : 'Beğenmeyen'} kişiler yükleniyor...`);
      
      const people = type === 'like' 
        ? await getLikedPeople(chatID)
        : await getDislikedPeople(chatID);
      
      setLikedPeopleModal({
        open: true,
        chatID,
        people: people || [],
        type
      });
      
      console.log(`✅ ${type === 'like' ? 'Beğenen' : 'Beğenmeyen'} kişiler yüklendi:`, people);
    } catch (error) {
      console.error(`${type === 'like' ? 'Beğenen' : 'Beğenmeyen'} kişiler yüklenirken hata:`, error);
      // Hata durumunda boş liste ile modal aç
      setLikedPeopleModal({
        open: true,
        chatID,
        people: [],
        type
      });
    }
  };

  const handleCloseLikedPeopleModal = () => {
    setLikedPeopleModal({ open: false, chatID: null, people: [], type: 'like' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getUserInitials = (post) => {
    const name = post.author?.name || post.name || 'A';
    const surname = post.author?.surname || post.surname || '';
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const isDoctor = (post) => {
    return post.author?.role === 'doctor' || post.author?.role === 'DOKTOR' || post.role === 'DOKTOR';
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Fade in={isVisible} timeout={800}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: 'text.light',
              textAlign: 'center',
              background: `linear-gradient(135deg, #34C3A1 0%, #1B7A85 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Topluluk Gönderileri
      </Typography>

      {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress
                size={60}
                sx={{
                  color: 'secondary.main',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
        </Box>
          ) : posts.length === 0 ? (
            <Fade in={true} timeout={1000}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  color: 'text.light',
                  opacity: 0.8,
                }}
              >
                <ForumRoundedIcon sx={{ fontSize: 64, mb: 3, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Henüz gönderi yok
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  İlk gönderiyi paylaşan siz olun ve topluluğu canlandırın!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddCircleRoundedIcon />}
                  onClick={handleOpen}
                  sx={{
                    background: `linear-gradient(135deg, #34C3A1 0%, #1B7A85 100%)`,
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                  }}
                >
                  İlk Gönderiyi Paylaş
                </Button>
              </Box>
            </Fade>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {posts.map((post, index) => (
                <Grow key={post.chatID} in={true} timeout={800 + index * 100}>
                  <PostCard elevation={0}>
                    <CardContent sx={{ p: 4 }}>
                      {/* Post Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <UserAvatar role={isDoctor(post) ? 'doctor' : 'user'}>
                          {getUserInitials(post)}
                        </UserAvatar>
                        
                        <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: 'primary.main',
                                fontSize: '1.0625rem',
                              }}
                            >
                              {post.author?.name || post.name || 'Anonim'} {post.author?.surname || post.surname || ''}
                            </Typography>
                            
                            {isDoctor(post) && (
                              <DoctorBadge
                                label="Doktor"
                                size="small"
                                icon={<MedicalServicesIcon sx={{ fontSize: 12 }} />}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryChip 
                              label={post.category || 'Genel'} 
                              size="small" 
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'primary.main',
                                opacity: 0.6,
                                fontSize: '0.8125rem',
                              }}
                            >
                              {formatDate(post.uploadDate)}
                            </Typography>
                          </Box>
              </Box>
                      </Box>

                      {/* Post Content */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'primary.main',
                          lineHeight: 1.7,
                          mb: 3,
                          fontSize: '1.0625rem',
                          wordBreak: 'break-word',
                        }}
                      >
                        {post.message}
                      </Typography>

                      {/* Post Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Tooltip title="Beğen" arrow>
                            <ActionButton size="small" onClick={() => handleLike(post.chatID)}>
                              <ThumbUpAltRoundedIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            onClick={() => handleShowLikedPeople(post.chatID, 'like')}
                            sx={{
                              color: 'primary.main',
                              opacity: 0.7,
                              fontWeight: 500,
                              minWidth: '24px',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 1,
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {post.likedUser?.length || 0}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Tooltip title="Beğenme" arrow>
                            <ActionButton size="small" onClick={() => handleDislike(post.chatID)}>
                              <ThumbDownAltRoundedIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            onClick={() => handleShowLikedPeople(post.chatID, 'dislike')}
                            sx={{
                              color: 'primary.main',
                              opacity: 0.7,
                              fontWeight: 500,
                              minWidth: '24px',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 1,
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {post.dislikedUser?.length || 0}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Tooltip title={openComments[post.chatID] ? "Yorumları gizle" : "Yorumları göster"} arrow>
                            <ActionButton 
                    size="small"
                              onClick={() => toggleComments(post.chatID)}
                              active={openComments[post.chatID]}
                            >
                              <ForumRoundedIcon fontSize="small" />
                            </ActionButton>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'primary.main',
                              opacity: 0.7,
                              fontWeight: 500,
                              minWidth: '24px',
                            }}
                          >
                            {post.comments?.length || 0}
                          </Typography>
                        </Stack>
                </Box>

                      {/* Comments Section */}
                      <Collapse in={!!openComments[post.chatID]} timeout="auto" unmountOnExit>
                        <Divider sx={{ mb: 3, borderColor: 'rgba(52, 195, 161, 0.1)' }} />
                        <CommentSection 
                          chatID={post.chatID}
                          postTitle={post.message?.substring(0, 50) + (post.message?.length > 50 ? '...' : '')}
                          comments={post.comments || []}
                          onCommentAdded={handleCommentAdded}
                        />
              </Collapse>
                    </CardContent>
                  </PostCard>
                </Grow>
          ))}
        </Box>
      )}
        </Box>
      </Fade>

      {/* Floating Action Button */}
      <FloatingFab aria-label="add" onClick={handleOpen}>
          <AddCircleRoundedIcon />
      </FloatingFab>

      {/* Add Post Modal */}
      <StyledModal open={open} onClose={handleClose}>
        <Fade in={open} timeout={300}>
          <ModalContent>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'primary.main',
                textAlign: 'center',
              }}
            >
              Yeni Gönderi Oluştur
          </Typography>
            
          <TextField
            fullWidth
            multiline
              minRows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
              placeholder="Gönderinizi yazın... Topluluğa ne paylaşmak istiyorsunuz?"
              sx={{ mb: 3 }}
          />
            
          <TextField
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Kategori (örn: Beslenme, Egzersiz, Tedavi)"
              sx={{ mb: 4 }}
            />
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleClose}
                fullWidth
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    backgroundColor: 'rgba(52, 195, 161, 0.08)',
                  },
                }}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                onClick={handleAddPost}
                fullWidth
                disabled={!newContent.trim()}
                sx={{
                  background: `linear-gradient(135deg, #34C3A1 0%, #1B7A85 100%)`,
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    background: `linear-gradient(135deg, #5CCFB3 0%, #4A9CA5 100%)`,
                  },
                }}
              >
            Paylaş
          </Button>
            </Stack>
          </ModalContent>
        </Fade>
      </StyledModal>

      {/* Beğenen/Beğenmeyen Kişiler Modal */}
      <StyledModal open={likedPeopleModal.open} onClose={handleCloseLikedPeopleModal}>
        <Fade in={likedPeopleModal.open} timeout={300}>
          <ModalContent sx={{ maxWidth: 500, maxHeight: 600, overflow: 'auto' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'primary.main',
                textAlign: 'center',
              }}
            >
              {likedPeopleModal.type === 'like' ? '❤️ Beğenen Kişiler' : '👎 Beğenmeyen Kişiler'}
            </Typography>
            
            {likedPeopleModal.people.length === 0 ? (
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  color: 'primary.main',
                  opacity: 0.7,
                  py: 4,
                }}
              >
                {likedPeopleModal.type === 'like' 
                  ? 'Henüz kimse bu gönderiyi beğenmedi.' 
                  : 'Henüz kimse bu gönderiyi beğenmemiş.'}
              </Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {likedPeopleModal.people.map((person, index) => (
                  <ListItem key={person.userID || index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: person.role === 'DOKTOR' ? 'secondary.main' : 'primary.main',
                          color: 'white',
                        }}
                      >
                        {person.role === 'DOKTOR' ? (
                          <MedicalServicesIcon />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                            }}
                          >
                            {person.name} {person.surname}
                          </Typography>
                          {person.role === 'DOKTOR' && (
                            <Chip
                              label="Doktor"
                              size="small"
                              icon={<MedicalServicesIcon sx={{ fontSize: 12 }} />}
                              sx={{
                                bgcolor: 'secondary.main',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            opacity: 0.6,
                          }}
                        >
                          {person.email}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleCloseLikedPeopleModal}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    backgroundColor: 'rgba(52, 195, 161, 0.08)',
                  },
                }}
              >
                Kapat
          </Button>
        </Box>
          </ModalContent>
        </Fade>
      </StyledModal>
    </Box>
  );
};

export default Posts; 