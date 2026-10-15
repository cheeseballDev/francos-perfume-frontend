import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { isValid } from "@/utils/validationUtils";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState } from "react";

const ForcePasswordChangeModal = ({ isOpen, onClose, onSuccess, oldPassword, firstName, lastName }) => {
    const { toast } = useToast();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const checkNameCondition = () => {
        if (password.length === 0) return false;
        const passLower = password.toLowerCase();

        const first = firstName?.toLowerCase();
        const last = lastName?.toLowerCase();

        if (first && passLower.includes(first)) return false;
        if (last && passLower.includes(last)) return false;
        return true;
    };

    const isDifferentFromOld = password !== oldPassword && password.length > 0;
    const passwordsMatch = password === confirmPassword && password.length > 0;
    const passwordError = isValid.password(password);
    const canSubmit = !passwordError && checkNameCondition() && passwordsMatch;

    const conditions = {
        hasNoName: checkNameCondition(),
        hasMinLength: password.length >= 12,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[#.\-?!@$%^&*]/.test(password),
        isNotOld: isDifferentFromOld,
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errorCheck = isValid.password(password);
        if (errorCheck || !checkNameCondition() || !passwordsMatch) return;
    
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
                description: `An error occurred while updating the password.\n${error}`,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getConditionClass = (isMet) => {
        return isMet ? "text-green-500 font-medium transition-colors" : "text-destructive transition-colors";
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

                    <div className="pt-2">
                        <p className="text-[15px] font-bold text-foreground mb-2">Password conditions (MUST HAVE):</p>
                        <ul className="text-sm space-y-1.5 ml-4">
                            <li className={getConditionClass(conditions.isNotOld)}>Must be different from temporary password</li>
                            <li className={getConditionClass(conditions.hasNoName)}>Must not include your name</li>
                            <li className={getConditionClass(conditions.hasMinLength)}>12 characters minimum</li>
                            <li className={getConditionClass(conditions.hasUpper)}>Include uppercase letter</li>
                            <li className={getConditionClass(conditions.hasLower)}>Include lowercase letter</li>
                            <li className={getConditionClass(conditions.hasNumber)}>Include number</li>
                            <li className={getConditionClass(conditions.hasSpecial)}>Include a special character: (#.-?!@$%^&*)</li>
                        </ul>
                    </div>

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