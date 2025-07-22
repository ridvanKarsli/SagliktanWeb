import React from 'react';
import styled from 'styled-components';
import { theme } from '../theme';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.xl};
`;

const Logo = styled.img`
  width: 160px;
  height: auto;
  margin-bottom: ${theme.spacing.xl};
  border-radius: 24px;
  border: 4px solid ${theme.colors.text};
  box-shadow: ${theme.shadows.lg};
  background: ${theme.colors.white};
  animation: pulse 2s infinite ease-in-out;
`;

const Title = styled.h1`
  font-size: ${theme.typography.h1.fontSize};
  font-weight: ${theme.typography.h1.fontWeight};
  color: ${theme.colors.text};
  text-align: center;
  margin-bottom: ${theme.spacing.md};
  animation: fadeInUp 0.5s ease-out;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.body.fontSize};
  color: ${theme.colors.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  animation: fadeInUp 0.5s ease-out 0.2s backwards;
`;

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-weight: 500;
  font-size: ${theme.typography.body.fontSize};
  transition: ${theme.transitions.default};
  animation: fadeInUp 0.5s ease-out 0.4s backwards;

  &:hover {
    background-color: ${theme.colors.secondary};
    transform: translateY(-2px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 195, 161, 0.3);
  }
`;

const LoadingPage = ({ onGetStarted }) => {
  return (
    <Container>
      <Logo src="/logo.png" alt="Sağlıktan Logo" />
      <Title>Sağlıktan</Title>
      <Subtitle>Yapay zekâ destekli dijital sağlık rehberiniz.</Subtitle>
      <Button onClick={onGetStarted}>Başla</Button>
    </Container>
  );
};

export default LoadingPage; 