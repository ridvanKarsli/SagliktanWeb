import React from 'react';
import SignUp from '../components/SignUp';

const SignUpPage = ({ onSignUp, onNavigateToLogin }) => {
  return (
    <SignUp
      onSignUp={onSignUp}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
};

export default SignUpPage; 