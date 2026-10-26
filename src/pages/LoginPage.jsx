import { LOGOUT_REASON_KEY } from '@/auth/authConstants';
import ForcePasswordChangeModal from '@/components/features/settings_component/ForcePasswordChangeModal';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/useLogin';
import { useTheme } from '@/theme/useTheme';
import { ChevronLeft, Loader2, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/FrancoPerfumeLogo.png';
import OtpVerification from './OtpVerification';

const LOGOUT_MESSAGES = {
    expired: "Your session has expired. Please log in again.",
};

const readLogoutReason = () => {
    try {
        return LOGOUT_MESSAGES[sessionStorage.getItem(LOGOUT_REASON_KEY)] || null;
    } catch {
        return null;
    }
};

const LoginPage = () => {
    const {
        isLoading,
        handleLogin, 
        handleModuleSelect,
        view, 
        setView, 
        password, 
        setPassword,
        email, 
        setEmail, 
        showPasswordModal,
        setShowPasswordModal,
        handlePasswordUpdate,
        firstName,
        lastName,
        error,
        handleVerifyOtp,
        handleResendOtp,
        cancelOtp
    } = useLogin();

    const { isDark, toggleTheme } = useTheme();

    const [logoutMessage, setLogoutMessage] = useState(readLogoutReason);

    useEffect(() => {
        try {
            sessionStorage.removeItem(LOGOUT_REASON_KEY);
        } catch {
            // ignore
        }
    }, []);

    const onSubmit = async (e) => { 
        e.preventDefault();
        e.stopPropagation();
        setLogoutMessage(null);
        await handleLogin(); 
    };

    const message = error || logoutMessage;
                

    if (view === 'module') {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background font-montserrat p-4 relative">
            <div 
                onClick={() => { setView('login') }}
                className="absolute top-8 left-8 flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Go back and logout</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">Select A Module</h2>
            <p className="text-muted-foreground mb-10 text-sm">Welcome back {firstName + " " + lastName}.</p>
            
            <div className="w-full max-w-sm flex flex-col gap-4">
            <Button 
                onClick={() => handleModuleSelect('CASHIER')}
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
            >
                Access POS
            </Button>
            
            <Button
                onClick={() => handleModuleSelect('MANAGER')}
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
            >
                Access Dashboard
            </Button>
            </div>
        </div>
        )
    }

    if (view === 'otp') {
        return (
            <OtpVerification
                email={email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onCancel={cancelOtp}
                isLoading={isLoading}
                error={error}
            />
        );
    }

    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-montserrat p-4 relative">
        <button
            onClick={toggleTheme}
            className="absolute top-6 right-6 p-3 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none border border-border shadow-sm"
            aria-label="Toggle Dark Mode"
        >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <div className="w-full max-w-sm flex flex-col items-center text-center">
            <img src={logo} alt="Franco Perfume" className="h-24 w-auto max-w-[200px] object-contain mb-6"/>
            <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">OneFrancoScentHub</h1>
            <p className="text-muted-foreground mb-8 text-sm">Welcome back!</p>

            <form onSubmit={onSubmit} noValidate className="w-full flex flex-col gap-4 text-left">
                <FormField
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setLogoutMessage(null);
                    }}
                />

                <FormField
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setLogoutMessage(null);
                    }}
                />

                {message && (
                    <p role="alert" className="text-sm text-destructive text-center -mt-1">{message}</p>
                )}

                <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="mt-2 w-full bg-primary text-primary-foreground hover:opacity-90"
                    >
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                    </>
                    ) : (
                    "Login"
                    )}
                </Button>
            </form>
        
            <p className="mt-6 text-sm text-muted-foreground">
            Forgot password? <a href="/forgot-password" className="text-destructive font-medium hover:underline">Reset it here</a>.
            </p>
        </div>



        <ForcePasswordChangeModal 
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handlePasswordUpdate}
            oldPassword={password}
            firstName={firstName}
            lastName={lastName}
        />
    </div>
  )
};

export default LoginPage;