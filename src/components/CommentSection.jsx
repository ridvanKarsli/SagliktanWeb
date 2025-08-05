import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Skeleton,
  Fade,
  Grow,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Comment from './Comment';
import { addComment, getLoggedUser } from '../services/api';

// Animation keyframes
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled components
const CommentSectionContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  background: 'rgba(253, 253, 252, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2.5),
  border: '1px solid rgba(52, 195, 161, 0.1)',
}));

const CommentInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(253, 253, 252, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(52, 195, 161, 0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      border: '2px solid rgba(52, 195, 161, 0.3)',
      transform: 'translateY(-1px)',
      boxShadow: '0px 6px 20px rgba(52, 195, 161, 0.1)',
    },
    '&.Mui-focused': {
      border: `2px solid ${theme.palette.secondary.main}`,
      boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.2)',
      transform: 'translateY(-1px)',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.info.main,
    fontWeight: 500,
    '&.Mui-focused': {
      color: theme.palette.secondary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    color: theme.palette.primary.main,
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(27, 122, 133, 0.6)',
      opacity: 1,
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
  color: theme.palette.primary.main,
  boxShadow: '0px 6px 20px rgba(52, 195, 161, 0.25)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    )`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.info.light} 100%)`,
    boxShadow: '0px 8px 24px rgba(52, 195, 161, 0.35)',
    transform: 'translateY(-2px)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(0px)',
  },
  '&:disabled': {
    background: 'rgba(52, 195, 161, 0.3)',
    color: 'rgba(11, 58, 78, 0.5)',
    boxShadow: 'none',
    transform: 'none',
  },
}));

const CommentSection = ({ chatID, postTitle, comments: initialComments = [], onCommentAdded }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    loadCurrentUser();
  }, []);

  // Comments prop'u değiştiğinde local state'i güncelle
  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const loadCurrentUser = async () => {
    try {
      const user = await getLoggedUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser) return;
    
    setSubmitting(true);
    setError('');

    try {
      const commentData = {
        message: newComment.trim(),
        userID: currentUser.userID || currentUser.id
      };

      console.log('Yorum gönderiliyor:', { chatID, commentData }); // Debug için

      const addedComment = await addComment(chatID, commentData);
      
      console.log('Yorum başarıyla eklendi:', addedComment); // Debug için
      
      // Yeni yorumu listeye ekle (optimistic update)
      const newCommentWithUser = {
        commnetsID: addedComment.commnetsID || addedComment.commentID || Date.now(),
        message: newComment.trim(),
        likedUser: [],
        dislikedUser: [],
        uploadDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        chatID: parseInt(chatID),
        userID: currentUser.userID || currentUser.id,
        user: currentUser // Kullanıcı bilgilerini ekle
      };
      
      setComments(prev => [newCommentWithUser, ...prev]);
      setNewComment('');

      // Parent component'e yeni yorumu bildir (posts state'ini güncellemek için)
      if (onCommentAdded) {
        onCommentAdded(chatID, newCommentWithUser);
      }
      
      // Başarılı mesajı göster
      console.log('✅ Yorum başarıyla eklendi ve listeye dahil edildi');
      
    } catch (error) {
      console.error('Yorum eklenemedi:', error);
      
      // Hata tipine göre farklı mesajlar
      if (error.message.includes('Veritabanı hatası')) {
        setError('Veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      } else if (error.message.includes('column index')) {
        setError('Veri formatı hatası. Teknik ekip bilgilendirildi.');
      } else if (error.message.includes('500')) {
        setError('Sunucu hatası. Lütfen bir kaç dakika sonra tekrar deneyin.');
      } else {
        setError(error.message || 'Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (commentID) => {
    // Optimistic update - gerçek API response'u beklemeden UI'ı güncelle
    setComments(prev => 
      prev.map(comment => 
        (comment.commnetsID || comment.commentID) === commentID
          ? { ...comment, likeCount: (comment.likeCount || 0) + 1 }
          : comment
      )
    );
  };

  const handleDislike = (commentID) => {
    // Optimistic update
    setComments(prev => 
      prev.map(comment => 
        (comment.commnetsID || comment.commentID) === commentID
          ? { ...comment, dislikeCount: (comment.dislikeCount || 0) + 1 }
          : comment
      )
    );
  };

  const handleReply = (comment) => {
    setNewComment(`@${comment.user?.name || 'Kullanıcı'} `);
  };

  if (!chatID) {
    return null;
  }

  return (
    <Fade in={isVisible} timeout={800}>
      <CommentSectionContainer>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CommentIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              fontSize: '1.25rem',
            }}
          >
            Yorumlar ({comments.length})
          </Typography>
        </Box>

        {postTitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              opacity: 0.7,
              mb: 3,
              fontStyle: 'italic',
            }}
          >
            "{postTitle}" gönderisine yapılan yorumlar
          </Typography>
        )}

        {/* Comment Form */}
        <Grow in={isVisible} timeout={1000}>
          <Box
            component="form"
            onSubmit={handleSubmitComment}
            sx={{ mb: 4 }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                }}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              <CommentInput
                fullWidth
                multiline
                rows={3}
                label="Yorumunuzu yazın..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bu gönderi hakkında ne düşünüyorsunuz?"
                disabled={submitting || !currentUser}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        sx={{
                          color: 'secondary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(52, 195, 161, 0.08)',
                          },
                        }}
                      >
                        <EmojiEmotionsIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SubmitButton
                  type="submit"
                  disabled={!newComment.trim() || submitting || !currentUser}
                  startIcon={<SendIcon />}
                >
                  {submitting ? 'Gönderiliyor...' : 'Yorum Yap'}
                </SubmitButton>
              </Box>
            </Stack>
          </Box>
        </Grow>

        <Divider sx={{ mb: 3, borderColor: 'rgba(52, 195, 161, 0.1)' }} />

        {/* Comments List */}
        <Box>
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton
                  variant="rectangular"
                  height={120}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'rgba(52, 195, 161, 0.05)',
                  }}
                  animation="wave"
                />
              </Box>
            ))
          ) : comments.length === 0 ? (
            <Fade in={true} timeout={500}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  color: 'primary.main',
                  opacity: 0.6,
                }}
              >
                <CommentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Henüz yorum yapılmamış
                </Typography>
                <Typography variant="body2">
                  İlk yorumu yapan siz olun!
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Box>
              {comments.map((comment, index) => (
                <Grow
                  key={comment.commnetsID || comment.commentID || index}
                  in={true}
                  timeout={500 + index * 100}
                >
                  <Box>
                    <Comment
                      comment={comment}
                      onLike={handleLike}
                      onDislike={handleDislike}
                      onReply={handleReply}
                      currentUserID={currentUser?.userID || currentUser?.id}
                    />
                  </Box>
                </Grow>
              ))}
            </Box>
          )}
        </Box>
      </CommentSectionContainer>
    </Fade>
  );
};

export default CommentSection;