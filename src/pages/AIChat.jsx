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
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import dayjs from 'dayjs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNavigation';
import { aiService } from '../services/aiService';
// import Posts from '../components/Posts'; // gönderiler kaldırıldı

const AIChat = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', content: 'Merhaba! Ben Sağlıktan AI. Size nasıl yardımcı olabilirim?', timestamp: new Date() },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Add user message to chat
      const userMessage = { type: 'user', content: message, timestamp: new Date() };
      setChatHistory(prev => [...prev, userMessage]);
      setMessage('');

      // Get AI response
      const response = await aiService.askAI(message);
      // Add AI response to chat
      const aiMessage = { type: 'ai', content: response.message, timestamp: new Date() };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      {/* Chat Container */}
      <Box
        sx={{
          flexGrow: 1,
          py: { xs: 0, sm: 4 },
          px: { xs: 0, sm: 4 },
          pb: isMobile ? 0 : 4,
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'calc(100vh - 120px)' : 'auto',
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: isMobile ? '100%' : 'auto',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              boxShadow: 'none',
              overflow: 'hidden',
              height: '100%',
              bgcolor: 'background.default',
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
                bgcolor: 'background.default',
              }}
            >
              {chatHistory.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                    gap: 1,
                  }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      bgcolor: msg.type === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.type === 'user' ? 'white' : 'text.primary',
                      borderRadius: 3,
                      minWidth: 80,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(msg.timestamp).format('HH:mm')}
                      </Typography>
                      {msg.type === 'ai' && (
                        <Tooltip title="Kopyala">
                          <IconButton size="small" onClick={() => handleCopy(msg.content)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Paper>
                </Box>
              ))}
              {loading && (
                <Box sx={{ alignSelf: 'flex-start', py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Paper elevation={2} sx={{ p: 2, bgcolor: 'grey.100', color: 'text.primary', borderRadius: 3, minWidth: 80 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">AI yazıyor</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <span className="dot" style={{ animation: 'blink 1s infinite' }}>.</span>
                        <span className="dot" style={{ animation: 'blink 1s infinite 0.2s' }}>.</span>
                        <span className="dot" style={{ animation: 'blink 1s infinite 0.4s' }}>.</span>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mx: 2, mt: 2, fontWeight: 700, fontSize: 16 }}>
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
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
              }}
            >
              <TextField
                fullWidth
                inputRef={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Mesajınızı yazın..."
                disabled={loading}
                multiline
                minRows={2}
                maxRows={6}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                  fontSize: 18,
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !message.trim()}
                sx={{
                  minWidth: 48,
                  height: 48,
                  borderRadius: 3,
                  fontSize: 18,
                }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
      {isMobile && <BottomNav />}
      <style>{`
        .dot { font-size: 2rem; color: #1B7A85; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 1; }
          40% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default AIChat; 