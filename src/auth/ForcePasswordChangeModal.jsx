import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ForcePasswordChangeModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        onSubmit(newPassword);
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
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-input bg-background rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter new password"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-input bg-background rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {error && <p className="text-sm font-bold text-destructive">{error}</p>}

                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-6 mt-4 text-sm font-bold tracking-widest shadow-md"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "UPDATE & LOGIN"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;