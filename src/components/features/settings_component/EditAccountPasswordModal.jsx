import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { isValid } from "@/utils/validationUtils";
import { ChevronLeft, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import ModalOverlay from "@/components/shared/ModalOverlay";

const EditAccountPasswordModal = ({ isOpen, onClose, user, accountId, updatePassword }) => {
    const { toast } = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState(null);
    const [currentPasswordError, setCurrentPasswordError] = useState('');

    if (!isOpen) return null;

    const checkNameCondition = () => {
        if (newPassword.length === 0) return false;
        const passLower = newPassword.toLowerCase();
        const first = user?.firstName?.toLowerCase();
        const last = user?.lastName?.toLowerCase();

        if (first && passLower.includes(first)) return false;
        if (last && passLower.includes(last)) return false;
        return true;
    };

    const isDifferentFromOld = newPassword !== currentPassword && newPassword.length > 0;
    const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
    const passwordError = isValid.password(newPassword);
    const canSubmit = !passwordError && checkNameCondition() && passwordsMatch;

    const conditions = {
        isNotOld: isDifferentFromOld,
        hasNoName: checkNameCondition(),
        hasMinLength: newPassword.length >= 12,
        hasUpper: /[A-Z]/.test(newPassword),
        hasLower: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[#.\-?!@$%^&*]/.test(newPassword),
    };

    
    const handleClose = () => {
        setNewPassword('');
        setCurrentPassword('');
        setConfirmPassword('');
        setCurrentPasswordError('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setConfig(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errorCheck = isValid.password(newPassword);
        if (errorCheck || !checkNameCondition() || !passwordsMatch) return;

        if (!accountId) {
            setConfig({
                isAlert: true,
                title: "Authentication Error",
                description: "Could not find your User ID in the authentication state. Please log out and log back in.",
                confirmVariant: "destructive",
                confirmText: "Acknowledge",
                onConfirm: () => setConfig(null)
            });
            return;
        }
    
        try {
            setIsSubmitting(true);
            const data = {
                oldPassword: currentPassword,
                newPassword
            };

            await updatePassword(accountId, data);
            
            toast({
                title: "Success",
                description: "Password updated successfully.",
                className: "bg-emerald-600 text-white border-emerald-700",
            });

            handleClose();

        } catch (error) {
            const errorMessage = error.response?.data;
            setCurrentPasswordError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
 
    const getConditionClass = (isMet) => {
        return isMet ? "text-green-500 font-medium transition-colors" : "text-destructive transition-colors";
    };

    return (
        <ModalOverlay onClose={handleClose} disabled={isSubmitting || !!config} className="bg-black/50 z-50 p-4 font-montserrat animate-fade-in">
            <div role="dialog" aria-modal="true" className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-[500px] p-8 relative text-card-foreground">
                
                <div className="flex justify-between items-center mb-6">
                    <button type="button" onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Edit Account Password</h2>
                    <button type="button" onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Current Password:</label>
                        <div className="relative">
                            <input 
                                type={showCurrentPassword ? "text" : "password"} 
                                placeholder="Enter current password..." 
                                required
                                className={`w-full border bg-background rounded-md p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 text-foreground transition-colors ${
                                    currentPasswordError ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'
                                }`}
                                value={currentPassword} 
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value)
                                    setCurrentPasswordError('');
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {currentPasswordError && (
                            <p className="text-xs text-destructive mt-1">{currentPasswordError}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Password:</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter your new password here..." 
                                required
                                className="w-full border border-input bg-background rounded-md p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Confirm password:</label>
                        <div className="relative">
                            <input 
                                type={"password"} 
                                placeholder="Confirm your password" 
                                required
                                className={`w-full border bg-background rounded-md p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground transition-colors ${
                                    confirmPassword.length > 0 && !passwordsMatch ? 'border-destructive focus:ring-destructive' : 'border-input'
                                }`}
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-xs text-destructive mt-1">Passwords do not match.</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <p className="text-[15px] font-bold text-foreground mb-2">Password conditions (MUST HAVE):</p>
                        <ul className="text-sm space-y-1.5 ml-4">
                            <li className={getConditionClass(conditions.isNotOld)}>Must be different from current password</li>
                            <li className={getConditionClass(conditions.hasNoName)}>Must not include your name</li>
                            <li className={getConditionClass(conditions.hasMinLength)}>12 characters minimum</li>
                            <li className={getConditionClass(conditions.hasUpper)}>Include uppercase letter</li>
                            <li className={getConditionClass(conditions.hasLower)}>Include lowercase letter</li>
                            <li className={getConditionClass(conditions.hasNumber)}>Include number</li>
                            <li className={getConditionClass(conditions.hasSpecial)}>Include a special character: (#.-?!@$%^&*)</li>
                        </ul>
                    </div>

                    <div className="flex justify-center gap-6 pt-6">
                        <Button 
                            type="button" 
                            onClick={handleClose} 
                            disabled={isSubmitting}
                        >
                            <span className="text-lg font-bold mr-2">✕</span> Discard Changes
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!canSubmit || isSubmitting}
                        >
                            <span className="text-lg font-bold mr-2">✓</span> {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmDialog
                isOpen={!!config}
                onClose={() => setConfig(null)}
                config={config}
                isLoading={isSubmitting}
            />
        </ModalOverlay>
    );
};

export default EditAccountPasswordModal;