import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: ${theme.colors.text};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  color: ${theme.colors.white};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: ${theme.shadows.md};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${theme.spacing.lg};
  align-items: center;
`;

const NavLink = styled.a`
  color: ${theme.colors.white};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  padding-top: calc(80px + ${theme.spacing.xl});
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Message = styled.div`
  max-width: 70%;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${props => props.isUser ? theme.colors.primary : theme.colors.white};
  color: ${props => props.isUser ? theme.colors.white : theme.colors.text};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  box-shadow: ${theme.shadows.sm};
`;

const InputContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const Input = styled.input`
  flex: 1;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.secondary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.body.fontSize};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const SendButton = styled.button`
  background-color: ${theme.colors.secondary};
  color: ${theme.colors.white};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${theme.colors.primary};
  }

  &:disabled {
    background-color: ${theme.colors.secondary}80;
    cursor: not-allowed;
  }
`;

const Chat = ({ onNavigateToDashboard, onLogout }) => {
  const [messages, setMessages] = useState([
    { text: 'Merhaba! Ben Sağlıktan AI asistanınız. Size nasıl yardımcı olabilirim?', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
    setInputValue('');

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: 'Bu bir örnek yanıttır. Gerçek API entegrasyonu yapılacak.',
        isUser: false
      }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>Sağlıktan</Logo>
          <Nav>
            <NavLink href="#" onClick={onNavigateToDashboard}>Ana Sayfa</NavLink>
            <NavLink href="#" onClick={onLogout}>Çıkış Yap</NavLink>
          </Nav>
        </HeaderContent>
      </Header>

      <ChatContainer>
        <MessagesContainer>
          {messages.map((message, index) => (
            <Message key={index} isUser={message.isUser}>
              {message.text}
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
          />
          <SendButton
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            Gönder
          </SendButton>
        </InputContainer>
      </ChatContainer>
    </Container>
  );
};

export default Chat; 