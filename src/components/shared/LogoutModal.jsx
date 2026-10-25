// FIXED: Changed 'useAuth' to 'UseAuth' to fix the casing conflict shown in your error image
import { useAuth } from '@/auth/UseAuth';
import { Button } from '@/components/ui/button';
import ModalOverlay from "@/components/shared/ModalOverlay";

const LogoutModal = ({ setShowLogoutModal }) => {
    const { logout } = useAuth();
    return (
        <ModalOverlay onClose={() => setShowLogoutModal(false)} className="z-50 bg-black/40 backdrop-blur-sm transition-all">
            {/* FIXED: Replaced bg-white and border-custom-gray-2 with semantic variables */}
            <div role="dialog" aria-modal="true" className="bg-card p-8 rounded-md shadow-2xl max-w-sm w-full mx-4 border border-border animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
            {/* FIXED: Replaced text-custom-black with text-foreground */}
            <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Sign Out</h3>
            
            {/* FIXED: Replaced text-custom-gray with text-muted-foreground */}
            <p className="text-muted-foreground mb-8 text-sm">Are you sure you want to end your current session?</p>
            
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                <Button variant="destructive" onClick={logout}>Yes, Sign Out</Button>
            </div>
            </div>
        </ModalOverlay>
    );
}

export default LogoutModal;