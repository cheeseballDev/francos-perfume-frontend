import { ArrowLeft, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPage = () => {
    const navigate = useNavigate();
    
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill("")); // Changed to 6-box array
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const inputRefs = useRef([]);

    // --- OTP Input Handlers ---
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Take only the last entered character
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (isNaN(pastedData)) return;

        const pastedArray = pastedData.slice(0, 6).split("");
        const newOtp = [...otp];
        
        pastedArray.forEach((char, i) => {
            newOtp[i] = char;
        });
        
        setOtp(newOtp);

        const focusIndex = pastedArray.length < 6 ? pastedArray.length : 5;
        inputRefs.current[focusIndex].focus();
    };
    // --------------------------

    const handleSendOtp = (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Simulated network request
        setTimeout(() => {
            setIsLoading(false);
            setIsForgotPassword(true);
        }, 1000);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length < 6 || !newPassword) return;

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Password reset simulation successful! Sending you back to login...");
            setOtp(new Array(6).fill(""));
            setNewPassword('');
            navigate('/login');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background font-montserrat p-4">
            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-xl w-full max-w-md border border-border animate-fade-in">
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {!isForgotPassword 
                        ? "Enter your email address to receive a password reset OTP." 
                        : "Enter the OTP sent to your email and your new password."}
                    </p>
                </div>
                
                {isForgotPassword ? (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            One-Time Password (OTP)
                        </label>
                        <div className="flex justify-between gap-2 sm:gap-3">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    value={data}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    className="w-full h-12 text-center text-xl font-bold border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:scale-105 transition-all duration-200"
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-foreground mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || otp.join("").length < 6}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors mt-2"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {isLoading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>
                ) : (
                <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors mt-2"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>
                )}

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors inline-flex items-center gap-1.5"
                        type="button"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ForgotPage;