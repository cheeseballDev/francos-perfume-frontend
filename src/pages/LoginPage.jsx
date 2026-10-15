import ForcePasswordChangeModal from '@/components/features/settings_component/ForcePasswordChangeModal';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/useLogin';
import { ChevronLeft, Loader2 } from 'lucide-react';
import logo from '../assets/FrancoPerfumeLogo.png';

const LoginPage = () => {
    const {
        isLoading,
        displayName, 
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
        lastName
    } = useLogin();
  
    if (view === 'module') {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background font-montserrat p-4 relative">
            <div 
                onClick={() => { setView('login') }}
                className="absolute top-8 left-8 flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Go Back</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">Select A Module</h2>
            <p className="text-muted-foreground mb-10 text-sm">Welcome back {displayName}.</p>
            
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-montserrat p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <img src={logo} alt="Franco Perfume" className="h-24 w-auto max-w-[200px] object-contain mb-6"/>
        <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">OneFrancoScentHub</h1>
        <p className="text-muted-foreground mb-8 text-sm">Welcome back!</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 text-left">
            <FormField
                label="Email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <FormField
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

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