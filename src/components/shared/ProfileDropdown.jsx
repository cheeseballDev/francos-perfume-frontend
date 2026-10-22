import { useAuth } from '@/auth/UseAuth';
import { useAccount } from '@/hooks/account_hooks/useAccount';
import { ArrowRightLeft, HelpCircle, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const ProfileDropdown = () => {
    const { user, handleSwitchAccess } = useAuth();
    const navigate = useNavigate();
    const { 
        fetchAccountDetails 
    } = useAccount();
    
    const [profile, setProfile] = useState([]);

    useEffect(() => {
        async function fetchCurrentUserData() {
            setProfile(await fetchAccountDetails(user.employeeId));
        }
        fetchCurrentUserData();
    }, [user.employeeId]); 

    const canSwitchAccess = 
        user?.trueRole?.toLowerCase() === 'manager' || 
        user?.role?.toLowerCase() === 'manager';

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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
        <div className="relative" ref={dropdownRef}>
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
        >
            {profile?.employeeImageUrl 
            ? <img 
                src={profile.employeeImageUrl}
                alt={"user picture"}
                className="w-10 h-10 rounded-full"
                />
            : <User size={24} />
            }

            <span className="font-medium text-[15px]">{profile.lastName}</span>
            <span className="text-xs">▼</span>
        </div>
        
        {isOpen && (
            <div className="absolute right-0 top-full mt-3 w-48 bg-card text-card-foreground rounded shadow-2xl overflow-hidden flex flex-col border border-border">
            
            <div 
                onClick={() => {
                setIsOpen(false);
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
                navigate(user?.activeRole === 'CASHIER' ? '/pos/faq' : '/home/faq');
                }}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted transition-colors border-t border-border"
            >
                <HelpCircle size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">Help / FAQ</span>
            </div>

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