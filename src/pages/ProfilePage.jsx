import React from 'react';
import Profile from '../components/Profile';

const ProfilePage = ({ user, onNavigateToDashboard, onLogout }) => {
  return (
    <Profile
      user={user}
      onNavigateToDashboard={onNavigateToDashboard}
      onLogout={onLogout}
    />
  );
};

export default ProfilePage; 