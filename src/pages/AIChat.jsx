import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import { aiService } from '../services/aiService';

const AIChat = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Add user message to chat
      const userMessage = { type: 'user', content: message };
      setChatHistory(prev => [...prev, userMessage]);
      setMessage('');

      // Get AI response
      const response = await aiService.askAI(message);
      
      // Add AI response to chat
      const aiMessage = { type: 'ai', content: response.message };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* Chat Container */}
      <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, sm: 4 }, pb: isMobile ? 8 : 4 }}>
        <Container maxWidth="md" sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <Paper
            elevation={3}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <Typography variant="h6">AI Asistan</Typography>
            </Box>

            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {chatHistory.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: msg.type === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.type === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {loading && (
                <Box sx={{ alignSelf: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Message Input */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !message.trim()}
                  sx={{
                    minWidth: 48,
                    height: 48,
                    borderRadius: 2,
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
      <BottomNav />
    </Box>
  );
};

export default AIChat; 