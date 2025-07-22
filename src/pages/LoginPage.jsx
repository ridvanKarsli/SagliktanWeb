import React from 'react';
import Login from '../components/Login';

const LoginPage = ({ onLogin, onNavigateToSignUp }) => {
  return (
    <Login
      onLogin={onLogin}
      onNavigateToSignUp={onNavigateToSignUp}
    />
  );
};

export default LoginPage; 