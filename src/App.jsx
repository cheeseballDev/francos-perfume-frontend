import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/UseAuth';
import DeliveryConfirmationPage from './components/features/delivery_components/DeliveryConfirmationPage';
import DeliveryDetailsPage from './components/features/delivery_components/DeliveryDetailsPage';
import MobileBlocker from './components/features/point_of_sale_components/MobileBlocker';
import CreateTransferRequestPage from './components/features/request_components/CreateTransferRequestPage';
import RequestDetailsPage from './components/features/request_components/RequestDetailsPage';
import DashboardLayout from './layouts/DashboardLayout';
import FaqPage from './pages/dashboard/FaqPage';
import { ArchivesPage, AuditLogPage, BarcodePage, DeliveriesPage, DiscountPage, ForecastPage, HomePage, InventoryPage, ProductsPage, RequestPage, TransactionsPage } from './pages/dashboard/index.js';
import AccountsPage from './pages/dashboard/ManageAccountsPage';
import UserSettingsPage from './pages/dashboard/UserSettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import PointOfSalePage from './pages/PointOfSalePage';

const ProtectedRoute = ({ user, allowedRoles }) => {
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.activeRole)) { 
    return <Navigate to="/home" replace />; 
  }
  return <Outlet />;
}

const NavigationManager = ({ user }) => {
    const navigate = useNavigate();
    const path = useLocation().pathname;

    useEffect(() => {
        if (user) {
        const role = user.activeRole;
        
        if (role === 'CASHIER' && !path.startsWith('/pos')) {
            navigate('/pos', { replace: true });
        } 
        else if (['MANAGER', 'OWNER', 'ADMIN', 'STAFF'].includes(role)) {
            if (!path.startsWith('/home')) {
            navigate('/home', { replace: true });
            }
        }
        }
    }, [user, path, navigate]);

    return null;
};

const usePersistentSession = () => {
    useEffect(() => {
        const LOGIN_TIME_KEY = 'login_timestamp';
        const TOKEN_LIFETIME_MS = 86400000; 

        const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
        const now = Date.now();

        if (loginTime && now - Number(loginTime) > TOKEN_LIFETIME_MS) {
            window.dispatchEvent(new CustomEvent('session-expired'));
        }
    }, []);
};

const App = () => {
    const { user, logout } = useAuth();
    const { toast } = useToast();

    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    usePersistentSession();

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);
        const handleServerSuccess = () => setIsOffline(false);
        
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        window.addEventListener('server-connection-error', handleOffline);
        window.addEventListener('server-connection-success', handleServerSuccess);
        
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('server-connection-error', handleOffline);
            window.removeEventListener('server-connection-success', handleServerSuccess);
        };
    }, []);

    useEffect(() => {
        const handleSessionExpired = () => {
        toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            duration: 5000,
        });

        logout();
        };

        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, [toast, logout]);

    if (isMobileView) { return <MobileBlocker />; }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {isOffline && (
        <div className="w-full bg-destructive text-destructive-foreground text-center py-2 font-semibold text-sm z-[9999]">
          Lost internet connectivity! Contact administrators if problem is not on your end.
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        <Router>
          <NavigationManager user={user} />
          <Routes>
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
            <Route path='/login' 
              element={
                !user ? <LoginPage /> : <Navigate to={user.activeRole === 'CASHIER' ? '/pos' : '/home'} replace />
              }
            />
            <Route path='/home'
              element={
                user ? <DashboardLayout user={user} /> : <Navigate to='/login' replace /> 
              }
            >
              <Route index element={<HomePage role={user?.trueRole} />} />
              <Route path="settings" element={<UserSettingsPage />} />
              
              {/* ADDED: FAQ Page available for all Dashboard users */}
              <Route path="faq" element={<FaqPage />} />

              <Route element={<ProtectedRoute user={user} allowedRoles={['MANAGER', 'OWNER', 'STAFF']} />}>
                <Route path="inventory" element={<InventoryPage role={user?.trueRole} />} />
                <Route path="requests" element={<RequestPage />} />
                <Route path="requests/:requestId" element={<RequestDetailsPage />} />
                <Route path="requests/create" element={<CreateTransferRequestPage />} />
                <Route path="deliveries" element={<DeliveriesPage />} />
                <Route path="deliveries/:deliveryId" element={<DeliveryDetailsPage />} />
                {/* FIXED ROUTE TO MATCH BUTTON NAVIGATION */}
                <Route path="deliveries/:deliveryId/confirm" element={<DeliveryConfirmationPage />} />
                <Route path="barcode" element={<BarcodePage />} /> 
              </Route>

              <Route element={<ProtectedRoute user={user} allowedRoles={['MANAGER', 'OWNER']} />}>
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="forecast" element={<ForecastPage />} />
              </Route>

              <Route element={<ProtectedRoute user={user} allowedRoles={['OWNER']} />}>
                <Route path="products" element={<ProductsPage />} />
                <Route path="discount" element={<DiscountPage />} />
              </Route>

              <Route element={<ProtectedRoute user={user} allowedRoles={['MANAGER', 'OWNER', 'ADMIN']} />}>
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="archives" element={<ArchivesPage />} />
                <Route path="audit" element={<AuditLogPage />} />
              </Route>
            </Route>
            
            <Route element={<ProtectedRoute user={user} allowedRoles={['MANAGER', 'CASHIER']} />}>
              <Route path="/pos" element={<PointOfSalePage />} />
              <Route path="/pos/settings" element={<UserSettingsPage />} />
              
              {/* ADDED: FAQ Page available specifically for Cashiers */}
              <Route path="/pos/faq" element={<FaqPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </div>
      
      <Toaster />
    </div>
  );
};

export default App;