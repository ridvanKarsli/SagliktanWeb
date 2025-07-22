import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage = ({ user, onNavigateToChat, onNavigateToProfile, onLogout }) => {
  return (
    <Dashboard
      user={user}
      onNavigateToChat={onNavigateToChat}
      onNavigateToProfile={onNavigateToProfile}
      onLogout={onLogout}
    />
  );
};

export default DashboardPage; 