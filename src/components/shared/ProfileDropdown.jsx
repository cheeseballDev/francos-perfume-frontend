import { useAuth } from '@/auth/UseAuth';
import { ArrowRightLeft, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const ProfileDropdown = () => {
  const { user, handleSwitchAccess } = useAuth();
  const navigate = useNavigate();
  
  const canSwitchAccess = 
    user?.trueRole?.toLowerCase() === 'manager' || 
    user?.role?.toLowerCase() === 'manager';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayUsername = user?.email ? user.email.split('@')[0] : 'Employee Name';
    
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50 pt-2" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
      >
        <User size={20} />
        <span className="font-medium text-[15px]">{displayUsername}</span>
        <span className="text-xs">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-48 bg-card text-card-foreground rounded shadow-2xl overflow-hidden flex flex-col border border-border">
          
          <div 
            onClick={() => {
              setIsOpen(false);
              // FIXED: Only route cashiers to /pos/settings. Everyone else goes to /home/settings.
              navigate(user?.activeRole === 'CASHIER' ? '/pos/settings' : '/home/settings');
            }}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
          >
            <Settings size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
          </div>

          {canSwitchAccess && (
            <div
              onClick={() => {
                setIsOpen(false);
                handleSwitchAccess();
              }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
            >
              <ArrowRightLeft size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium">Switch Module</span>
            </div>
          )}

          <div
            onClick={() => {
              setIsOpen(false);
              setShowLogoutModal(true);
            }}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-destructive hover:bg-destructive/90 transition-colors"
          >
            <LogOut size={18} className="text-destructive-foreground" />
            <span className="text-sm font-medium text-destructive-foreground">Logout</span>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <LogoutModal setShowLogoutModal={setShowLogoutModal} />
      )}
    </div>
  );
};

export default ProfileDropdown;