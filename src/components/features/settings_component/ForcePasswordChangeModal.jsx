import PasswordConditionsList from "@/components/shared/PasswordConditionsList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { allPasswordConditionsMet, getPasswordConditions } from "@/utils/validationUtils";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState } from "react";

const ForcePasswordChangeModal = ({ isOpen, onClose, onSuccess, oldPassword, firstName, lastName }) => {
    const { toast } = useToast();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const conditions = getPasswordConditions({ password, firstName, lastName, oldPassword });
    const passwordsMatch = password === confirmPassword && password.length > 0;
    const canSubmit = allPasswordConditionsMet(conditions) && passwordsMatch;


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!canSubmit) return;
    
        try {
            setIsSubmitting(true);
            await onSuccess(password);
            
            toast({
                title: "Success",
                description: "Password updated successfully.",
                className: "bg-emerald-600 text-white border-emerald-700",
            });

            onClose();

        } catch (error) {
            toast({
                title: "Update Password Failed",
                description: `An error occurred while updating the password.\n${error.response?.data}`,
                variant: "destructive",
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-[450px] overflow-hidden p-8 relative">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Update Password</h2>
                    <p className="text-sm text-muted-foreground">
                        You are using a temporary password. Please set a new, secure password to continue accessing your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Password:</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter your password here..." 
                                required
                                className="w-full border border-input bg-background rounded-md p-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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

                    <PasswordConditionsList conditions={conditions} />

                    <Button 
                        type="submit" 
                        disabled={!canSubmit || isSubmitting}
                        className="w-full py-6 mt-4 text-sm font-bold tracking-widest shadow-md"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "UPDATE & LOGIN"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;