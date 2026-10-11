import { useAuth } from '@/auth/UseAuth';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserSettingsCard from '../../components/features/settings_component/UserSettingsCard';

const UserSettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Dynamically route based on the active role defined in your App.jsx guards
    if (user?.activeRole === 'CASHIER') {
      navigate('/pos');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="bg-background h-full font-montserrat flex flex-col items-center animate-fade-in overflow-y-auto p-6">
      
      {/* HEADER TITLE */}
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors font-bold uppercase text-sm tracking-widest"
        >
          <ArrowLeft size={18} />
          <span>Back to {user?.activeRole === 'CASHIER' ? 'POS' : 'Dashboard'}</span>
        </button>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">User Settings</h1>
        <p className="text-sm text-muted-foreground">Change device settings, personal information, and more</p>
      </div>
      
      {/* CONTENT AREA */}
      <div className="w-full max-w-4xl">
        <UserSettingsCard user={user} />
      </div>

    </div>
  );
};

export default UserSettingsPage;