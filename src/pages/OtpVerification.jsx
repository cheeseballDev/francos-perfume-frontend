import OtpInput from "@/components/shared/OTPInput";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY_CODE = new Array(6).fill("");

const OtpVerification = ({ email, onVerify, onResend, onCancel, isLoading, error }) => {
    const [otp, setOtp] = useState(EMPTY_CODE);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (timer <= 0) return;
        const t = setTimeout(() => setTimer((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [timer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length === 6) onVerify(code);
    };

    const handleResend = async () => {
        if (await onResend()) {
            setOtp(EMPTY_CODE);
            setTimer(60);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background font-montserrat p-4">
            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-xl w-full max-w-md border border-border">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">Verify it's you</h2>
                    <p className="text-muted-foreground text-sm">
                        We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. It expires in 5 minutes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
                    {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}
                    <button type="submit" disabled={isLoading || otp.join("").length < 6}
                        className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold flex items-center justify-center hover:opacity-90 disabled:opacity-50">
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {isLoading ? "Verifying..." : "Verify"}
                    </button>
                    <p className="text-center text-sm">
                        {timer > 0 ? (
                            <span className="text-muted-foreground">Resend code in {timer}s</span>
                        ) : (
                            <button type="button" onClick={handleResend} className="font-bold text-primary underline underline-offset-4">
                                Resend code
                            </button>
                        )}
                    </p>
                </form>

                <div className="mt-8 text-center">
                    <button type="button" onClick={onCancel}
                        className="text-sm text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> Use a different account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;