import { useState } from "react";
import { Loader2 } from "lucide-react";

const ForgotPage = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = () => {
    setIsLoading(true);
    // Simulated network request
    setTimeout(() => {
      setIsLoading(false);
      setIsForgotPassword(true);
    }, 1000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulated network request
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset simulation! Sending you back to login...");
      setOtp('');
      setConfirmPassword('');
    }, 1000);
  };

  return (
    // FIXED: Replaced bg-gray-100 with bg-background
    <div className="min-h-screen flex items-center justify-center bg-background font-montserrat">
      {/* FIXED: Replaced bg-white and added semantic border/text variables */}
      <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md w-full max-w-md border border-border">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Forgot Password</h2>
        
        {isForgotPassword ? (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              {/* FIXED: Replaced text-gray-700 with text-foreground */}
              <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-1">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                // FIXED: Replaced static border-gray-300 with semantic border-input and bg-transparent
                className="block w-full border border-input bg-transparent text-foreground rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full border border-input bg-transparent text-foreground rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            
            {/* FIXED: Replaced hardcoded bg-[#7D162E] with bg-primary and text-primary-foreground */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 rounded flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div>
            <p className="mb-6 text-muted-foreground text-center text-sm">
              Please enter your email to receive a password reset link.
            </p>
            <button 
              onClick={handleSendOtp} 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 rounded flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPage;