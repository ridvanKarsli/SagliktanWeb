import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Card,
  CardContent,
  Fade,
  Tooltip,
  Modal,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { likeCommentPost, dislikeCommentPost, getCommentLikedPeople, getCommentDislikedPeople } from '../services/api';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Styled components
const CommentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'rgba(253, 253, 252, 0.98)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(52, 195, 161, 0.1)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    border: '1px solid rgba(52, 195, 161, 0.2)',
    boxShadow: '0px 8px 24px rgba(11, 58, 78, 0.1)',
    transform: 'translateY(-2px)',
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
  width: 40,
  height: 40,
  background: role === 'doctor' 
    ? `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.main} 100%)`
    : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.light} 100%)`,
  color: theme.palette.primary.main,
  fontWeight: 600,
  border: `2px solid ${role === 'doctor' ? theme.palette.info.main : theme.palette.secondary.main}`,
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

const Comment = ({ 
  comment, 
  onLike, 
  onDislike, 
  onReply, 
  currentUserID,
  showActions = true 
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount || 0);
  const [localDislikeCount, setLocalDislikeCount] = useState(comment.dislikeCount || 0);
  const [likedPeopleModal, setLikedPeopleModal] = useState({ open: false, people: [], type: 'like' });

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      console.log(`Yorum beğeniliyor: ${comment.commnetsID || comment.commentID}`); // Debug için
      await likeCommentPost(comment.commnetsID || comment.commentID);
      setLocalLikeCount(prev => prev + 1);
      if (onLike) onLike(comment.commnetsID || comment.commentID);
      console.log('✅ Yorum başarıyla beğenildi!');
    } catch (error) {
      console.error('Yorum beğeni hatası:', error);
      // Hata durumunda optimistic update'i geri al
      setLocalLikeCount(prev => Math.max(0, prev - 1));
      alert('Yorum beğenilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (isDisliking) return;
    
    setIsDisliking(true);
    try {
      console.log(`Yorum beğenilmiyor: ${comment.commnetsID || comment.commentID}`); // Debug için
      await dislikeCommentPost(comment.commnetsID || comment.commentID);
      setLocalDislikeCount(prev => prev + 1);
      if (onDislike) onDislike(comment.commnetsID || comment.commentID);
      console.log('✅ Yorum başarıyla beğenilmedi!');
    } catch (error) {
      console.error('Yorum beğenmeme hatası:', error);
      // Hata durumunda optimistic update'i geri al
      setLocalDislikeCount(prev => Math.max(0, prev - 1));
      alert('Yorum beğenilmezken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDisliking(false);
    }
  };

  const handleShowLikedPeople = async (type = 'like') => {
    try {
      console.log(`${type === 'like' ? 'Yorumu beğenen' : 'Yorumu beğenmeyen'} kişiler yükleniyor...`);
      
      const people = type === 'like' 
        ? await getCommentLikedPeople(comment.commnetsID || comment.commentID)
        : await getCommentDislikedPeople(comment.commnetsID || comment.commentID);
      
      setLikedPeopleModal({
        open: true,
        people: people || [],
        type
      });
      
      console.log(`✅ ${type === 'like' ? 'Yorumu beğenen' : 'Yorumu beğenmeyen'} kişiler yüklendi:`, people);
    } catch (error) {
      console.error(`${type === 'like' ? 'Yorumu beğenen' : 'Yorumu beğenmeyen'} kişiler yüklenirken hata:`, error);
      // Hata durumunda boş liste ile modal aç
      setLikedPeopleModal({
        open: true,
        people: [],
        type
      });
    }
  };

  const handleCloseLikedPeopleModal = () => {
    setLikedPeopleModal({ open: false, people: [], type: 'like' });
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

  const getUserInitials = (user) => {
    if (!user) return '?';
    const name = user.name || user.userName || 'Anonim';
    const surname = user.surname || '';
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const isDoctor = comment.user?.role === 'doctor' || comment.userRole === 'doctor';

  return (
    <Fade in={true} timeout={500}>
      <CommentCard elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {/* User Avatar */}
            <UserAvatar role={isDoctor ? 'doctor' : 'user'}>
              {getUserInitials(comment.user)}
            </UserAvatar>

            {/* Comment Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: '0.9375rem',
                  }}
                >
                  {comment.user?.name || 'Anonim Kullanıcı'} {comment.user?.surname || ''}
                </Typography>
                
                {isDoctor && (
                  <DoctorBadge
                    label="Doktor"
                    size="small"
                  />
                )}

                <Typography
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    opacity: 0.6,
                    fontSize: '0.75rem',
                  }}
                >
                  {formatDate(comment.uploadDate)}
                </Typography>
              </Box>

              {/* Comment Message */}
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  lineHeight: 1.6,
                  mb: 2,
                  fontSize: '0.9375rem',
                  wordBreak: 'break-word',
                }}
              >
                {comment.message}
              </Typography>

              {/* Action Buttons */}
              {showActions && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Beğen" arrow>
                    <ActionButton
                      size="small"
                      onClick={handleLike}
                      disabled={isLiking}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  
                  <Typography
                    variant="caption"
                    onClick={() => handleShowLikedPeople('like')}
                    sx={{
                      color: 'primary.main',
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      minWidth: '20px',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 1,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {localLikeCount}
                  </Typography>

                  <Tooltip title="Beğenme" arrow>
                    <ActionButton
                      size="small"
                      onClick={handleDislike}
                      disabled={isDisliking}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </ActionButton>
                  </Tooltip>
                  
                  <Typography
                    variant="caption"
                    onClick={() => handleShowLikedPeople('dislike')}
                    sx={{
                      color: 'primary.main',
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      minWidth: '20px',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 1,
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {localDislikeCount}
                  </Typography>

                  {onReply && (
                    <Tooltip title="Yanıtla" arrow>
                      <ActionButton
                        size="small"
                        onClick={() => onReply(comment)}
                        sx={{ ml: 1 }}
                      >
                        <ReplyIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>

            {/* More Options */}
            <Tooltip title="Daha fazla" arrow>
              <IconButton
                size="small"
                sx={{
                  color: 'primary.main',
                  opacity: 0.5,
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'rgba(52, 195, 161, 0.08)',
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </CommentCard>

      {/* Beğenen/Beğenmeyen Kişiler Modal */}
      <Modal open={likedPeopleModal.open} onClose={handleCloseLikedPeopleModal}>
        <Fade in={likedPeopleModal.open} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              maxHeight: 500,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 3,
              overflow: 'auto',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: 'primary.main',
                textAlign: 'center',
              }}
            >
              {likedPeopleModal.type === 'like' ? '❤️ Yorumu Beğenen Kişiler' : '👎 Yorumu Beğenmeyen Kişiler'}
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
                  ? 'Henüz kimse bu yorumu beğenmedi.' 
                  : 'Henüz kimse bu yorumu beğenmemiş.'}
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
                        {person.name?.charAt(0) || '?'}
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
          </Box>
        </Fade>
      </Modal>
    </Fade>
  );
};

export default Comment;