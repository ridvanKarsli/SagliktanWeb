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
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Collapse,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import { getAllChats } from '../services/api';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

const style = {
  position: 'fixed',
  bottom: 32,
  right: 32,
  zIndex: 1000,
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 340,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getAllChats();
        setPosts(data);
      } catch (err) {
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
      setPosts([
        {
          chatID: Date.now(),
          message: newContent,
          likedUser: [],
          dislikedUser: [],
          uploadDate: new Date().toISOString().split('T')[0],
          userID: 999,
          category: newCategory || 'Genel',
          author: { name: 'Sen', surname: '' },
          comments: []
        },
        ...posts,
      ]);
      handleClose();
    }
  };

  const handleLike = (chatID) => {
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? { ...post, likedUser: [...(post.likedUser || []), { userID: 1, name: 'Sen', surname: '', role: 'HASTA' }] }
        : post
    ));
  };

  const handleDislike = (chatID) => {
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? { ...post, dislikedUser: [...(post.dislikedUser || []), { userID: 1, name: 'Sen', surname: '', role: 'HASTA' }] }
        : post
    ));
  };

  const handleCommentInput = (chatID, value) => {
    setCommentInputs(inputs => ({ ...inputs, [chatID]: value }));
  };

  const handleAddComment = (chatID) => {
    const value = commentInputs[chatID];
    if (!value?.trim()) return;
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? {
            ...post,
            comments: [
              ...post.comments,
              {
                commnetsID: Date.now(),
                message: value,
                likedUser: [],
                dislikedUser: [],
                uploadDate: new Date().toISOString().split('T')[0],
                chatID,
                userID: 1,
                userName: 'Sen'
              }
            ]
          }
        : post
    ));
    setCommentInputs(inputs => ({ ...inputs, [chatID]: '' }));
  };

  // Yorumlar için like/dislike
  const handleCommentLike = (chatID, commnetsID) => {
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? {
            ...post,
            comments: post.comments.map(c =>
              c.commnetsID === commnetsID
                ? { ...c, likedUser: [...(c.likedUser || []), { userID: 1, name: 'Sen' }] }
                : c
            )
          }
        : post
    ));
  };

  const handleCommentDislike = (chatID, commnetsID) => {
    setPosts(posts => posts.map(post =>
      post.chatID === chatID
        ? {
            ...post,
            comments: post.comments.map(c =>
              c.commnetsID === commnetsID
                ? { ...c, dislikedUser: [...(c.dislikedUser || []), { userID: 1, name: 'Sen' }] }
                : c
            )
          }
        : post
    ));
  };

  const toggleComments = (chatID) => {
    setOpenComments((prev) => ({ ...prev, [chatID]: !prev[chatID] }));
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Gönderiler
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.map((post) => (
            <Paper key={post.chatID} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={post.category} size="small" color="info" />
                <Typography variant="caption" color="text.secondary">
                  {post.uploadDate}
                </Typography>
                <Typography variant="caption" color="primary.main" sx={{ ml: 1, fontWeight: 600 }}>
                  {post.author?.name || post.name || ''} {post.author?.surname || post.surname || ''}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>{post.message}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Tooltip title="Beğen">
                  <IconButton size="small" onClick={() => handleLike(post.chatID)}>
                    <ThumbUpAltRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption">{post.likedUser?.length || 0}</Typography>
                <Tooltip title="Beğenme">
                  <IconButton size="small" onClick={() => handleDislike(post.chatID)}>
                    <ThumbDownAltRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption">{post.dislikedUser?.length || 0}</Typography>
                <Tooltip title="Yorumları göster/gizle">
                  <IconButton size="small" onClick={() => toggleComments(post.chatID)}>
                    <ForumRoundedIcon fontSize="small" />
                    {openComments[post.chatID] ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Typography variant="caption">{post.comments?.length || 0}</Typography>
              </Box>
              <Collapse in={!!openComments[post.chatID]} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Yorumlar</Typography>
                <List dense>
                  {post.comments?.map((c) => (
                    <ListItem key={c.commnetsID} alignItems="flex-start" secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title="Beğen">
                          <IconButton size="small" onClick={() => handleCommentLike(post.chatID, c.commnetsID)}>
                            <ThumbUpAltRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption">{c.likedUser?.length || 0}</Typography>
                        <Tooltip title="Beğenme">
                          <IconButton size="small" onClick={() => handleCommentDislike(post.chatID, c.commnetsID)}>
                            <ThumbDownAltRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption">{c.dislikedUser?.length || 0}</Typography>
                      </Box>
                    }>
                      <ListItemText
                        primary={<>
                          <Typography component="span" variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, mr: 1 }}>
                            {c.userName || (c.userID === 1 ? 'Sen' : `Kullanıcı ${c.userID}`)}
                          </Typography>
                          {c.message}
                        </>}
                        secondary={c.uploadDate}
                      />
                    </ListItem>
                  ))}
                  {(!post.comments || post.comments.length === 0) && (
                    <ListItem>
                      <ListItemText primary="Henüz yorum yok." />
                    </ListItem>
                  )}
                </List>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Yorum ekle..."
                    value={commentInputs[post.chatID] || ''}
                    onChange={e => handleCommentInput(post.chatID, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddComment(post.chatID)}
                  >
                    Ekle
                  </Button>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}
      <Box sx={style}>
        <Fab color="primary" aria-label="add" onClick={handleOpen}>
          <AddCircleRoundedIcon />
        </Fab>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Yeni Gönderi
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Gönderinizi yazın..."
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Kategori (örn: işitme)"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleAddPost} fullWidth>
            Paylaş
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Posts; 