import OtpInput from "@/components/shared/OtpInput";
import PasswordConditionsList from "@/components/shared/PasswordConditionsList";
import { resetPassword, sendForgotPasswordOtp, verifyForgotPasswordOtp } from "@/services/LoginService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { allPasswordConditionsMet, getPasswordConditions } from "@/utils/validationUtils";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EMPTY_CODE = new Array(6).fill("");
const RESEND_SECONDS = 60;

const SUBTITLES = {
    email: "Enter your email address to receive a 6-digit code.",
    code: "Enter the 6-digit code we sent to your email. It expires in 5 minutes.",
    password: "Choose a new password for your account.",
};

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState("email"); // "email" | "code" | "password"
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(EMPTY_CODE);
    const [resetToken, setResetToken] = useState(null);
    const [names, setNames] = useState({ firstName: "", lastName: "" });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const conditions = getPasswordConditions({
        password: newPassword,
        firstName: names.firstName,
        lastName: names.lastName,
    });
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const canSubmitPassword = allPasswordConditionsMet(conditions) && passwordsMatch;

    const run = async (action) => {
        setIsLoading(true);
        setError(null);
        try {
            await action();
        } catch (err) {
            setError(getAPIError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendCode = (e) => {
        e?.preventDefault();
        if (!email.trim()) {
            setError("Enter your email address.");
            return;
        }
        run(async () => {
            await sendForgotPasswordOtp(email.trim());
            setOtp(EMPTY_CODE);
            setCooldown(RESEND_SECONDS);
            setStep("code");
        });
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) return;
        run(async () => {
            const result = await verifyForgotPasswordOtp(email.trim(), code);
            setResetToken(result.token);
            setNames({ firstName: result.firstName || "", lastName: result.lastName || "" });
            setStep("password");
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!canSubmitPassword) return;
        run(async () => {
            await resetPassword(email.trim(), resetToken, newPassword);
            navigate("/login", {
                replace: true,
                state: { notice: "Password changed. You can now log in with your new password." },
            });
        });
    };

    const inputClass = "w-full border border-input bg-background text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
    const buttonClass = "w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-colors";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background font-montserrat p-4">
            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-xl w-full max-w-md border border-border animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">Forgot Password</h2>
                    <p className="text-muted-foreground text-sm">{SUBTITLES[step]}</p>
                </div>

                {step === "email" && (
                    <form onSubmit={handleSendCode} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={inputClass}
                                autoFocus
                            />
                        </div>
                        {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className={buttonClass}>
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {isLoading ? "Sending code..." : "Send code"}
                        </button>
                    </form>
                )}

                {step === "code" && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
                        {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}
                        <button type="submit" disabled={isLoading || otp.join("").length < 6} className={buttonClass}>
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {isLoading ? "Verifying..." : "Verify code"}
                        </button>
                        <p className="text-center text-sm">
                            {cooldown > 0 ? (
                                <span className="text-muted-foreground">Resend code in <span className="text-foreground">{cooldown}s</span></span>
                            ) : (
                                <button type="button" onClick={handleSendCode} disabled={isLoading}
                                    className="font-bold text-primary underline underline-offset-4 disabled:opacity-50">
                                    Resend code
                                </button>
                            )}
                        </p>
                    </form>
                )}

                {step === "password" && (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4" noValidate>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-foreground mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    className={`${inputClass} pr-10`}
                                    autoComplete="new-password"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                className={`${inputClass} ${confirmPassword.length > 0 && !passwordsMatch ? "border-destructive focus:ring-destructive" : ""}`}
                                autoComplete="new-password"
                            />
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="text-xs text-destructive mt-1">Passwords do not match.</p>
                            )}
                        </div>

                        <PasswordConditionsList conditions={conditions} />

                        {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}

                        <button type="submit" disabled={!canSubmitPassword || isLoading} className={`${buttonClass} mt-2`}>
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {isLoading ? "Saving..." : "Reset password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
