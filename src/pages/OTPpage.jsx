import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const OtpPage = () => {
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Timer countdown logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle individual input changes
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last entered character to prevent multiple numbers in one box
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace to auto-focus previous input
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle pasting a full 6-digit code
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

    // Focus the next empty box or the last box
    const focusIndex = pastedArray.length < 6 ? pastedArray.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(new Array(6).fill(""));
    inputRefs.current[0].focus();
    // TODO for Matthew/Leo: Trigger resend API call here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length < 6) return;

    setIsLoading(true);
    // Simulated network request (TODO for Matthew/Leo: Connect verification API here)
    setTimeout(() => {
      setIsLoading(false);
      alert(`Verified OTP: ${otpString}`);
      navigate("/login"); 
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-montserrat p-4">
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-xl w-full max-w-md border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Verify Your Email
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We have sent a 6-digit one-time password to your email address. Please enter it below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
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
                className="w-12 h-14 text-center text-2xl font-bold border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:scale-105 transition-all duration-200"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button 
              type="submit" 
              disabled={isLoading || otp.join("").length < 6}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-muted-foreground font-medium">
                  Resend code in <span className="text-foreground">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm text-primary hover:text-primary/80 font-bold transition-colors underline underline-offset-4"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors inline-flex items-center gap-1.5"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel and go back
          </button>
        </div>

      </div>
    </div>
  );
};

export default OtpPage;