import React, { useState } from 'react';
import StaffLogin from './pages/StaffLogin';
import DashboardLayout from './pages/DashboardLayout';

const App = () => {
  const [user, setUser] = useState(null);

  // Now accepts an object with multiple properties
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <StaffLogin onLogin={handleLogin} />
      ) : (
        <DashboardLayout 
          trueRole={user.trueRole} 
          activeRole={user.activeRole} 
          userEmail={user.email} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
};

export default App;