import { useAuth } from '@/auth/UseAuth';
import { PROFILE_UPDATE_EVENT, useAccount } from '@/hooks/account_hooks/useAccount';
import { canSwitchModule, modulePath } from '@/utils/roleAccess';
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
        const handleProfileUpdated = (event) => {
            if (event.detail) {
                setProfile(event.detail);
            }
        };
        window.addEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdated);
        return () => window.removeEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdated);
    })

    useEffect(() => {
        async function fetchCurrentUserData() {
            setProfile(await fetchAccountDetails(user.employeeId));
        }
        fetchCurrentUserData();
    }, [user.employeeId]); 

    const canSwitchAccess = canSwitchModule(user?.trueRole);

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
                navigate(modulePath(user, 'settings'));
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
                    const next = handleSwitchAccess();
                    // go straight to the other module instead of waiting for a redirect
                    if (next) navigate(modulePath(next), { replace: true });
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
                navigate(modulePath(user, 'faq'));
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