import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import MobileBlocker from './components/features/pos_components/MobileBlocker';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ArchivesPage from './pages/dashboard/ArchivesPage';
import AuditLogPage from './pages/dashboard/AuditLogPage';
import BarcodePage from './pages/dashboard/BarcodePage';
import DiscountPage from './pages/dashboard/DiscountPage';
import ForecastPage from './pages/dashboard/ForecastPage';
import HomePage from './pages/dashboard/HomePage';
import InventoryPage from './pages/dashboard/InventoryPage';
import AccountsPage from './pages/dashboard/ManageAccountsPage';
import RequestPage from './pages/dashboard/RequestPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import PointOfSalePage from './pages/pos/PointOfSalePage';
import { UseAuth } from './services/UseAuth';

const ProtectedRoute = ({ user, allowedRoles }) => {
  if (!user) return <Navigate to="/login" />;
  // Check if the current active role is in the allowed list
  if (allowedRoles && !allowedRoles.includes(user.activeRole)) { 
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
      
      // Redirect Cashiers away from Dashboard
      if (role === 'cashier' && path !== '/pos') {
        navigate('/pos', { replace: true });
      } 
      // Redirect Dashboard Roles (Manager, Owner, Admin, Staff) to Dashboard
      else if (['manager', 'owner', 'admin', 'staff'].includes(role)) {
        if (!path.startsWith('/home') && path !== '/pos') {
          navigate('/home', { replace: true });
        }
      }
    }
  }, [user?.activeRole, path, navigate]);

  return null;
}

const App = () => {
  const { user, login, logout, switchRole } = UseAuth();

  const handleSwitchAccess = () => {
    const nextRole = user.activeRole === 'manager' ? 'cashier' : 'manager';
    switchRole(nextRole);
  };

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileView) { return <MobileBlocker />; }

  return (
    <Router>
      <NavigationManager user={user} />
      <Routes>
        <Route path='/login' 
          element={
            !user ? <LoginPage onLogin={login} /> : <Navigate to={user.activeRole === 'cashier' ? '/pos' : '/home'} replace />
          }
        />

        <Route path='/home'
          element={
            user ? <DashboardLayout user={user} onSwitchAccess={handleSwitchAccess} onLogout={logout} /> : <Navigate to='/login' replace /> 
          }
        >
          {/* 1. PUBLIC DASHBOARD PAGES (All Dashboard Roles) */}
          <Route index element={<HomePage role={user?.trueRole} />} />

          {/* 2. INVENTORY OPS (Manager, Owner, & Staff) */}
          <Route element={<ProtectedRoute user={user} allowedRoles={['manager', 'owner', 'staff']} />}>
            <Route path="inventory" element={<InventoryPage role={user?.trueRole} />} />
            <Route path="requests" element={<RequestPage />} />
            <Route path="forecast" element={<ForecastPage />} />
          </Route>

          {/* 3. SALES OPS (Manager & Owner Only - Hidden from Staff) */}
          <Route element={<ProtectedRoute user={user} allowedRoles={['manager', 'owner']} />}>
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="discount" element={<DiscountPage />} />
          </Route>

          {/* 4. SYSTEM MANAGEMENT (Manager, Owner, & Admin) */}
          <Route element={<ProtectedRoute user={user} allowedRoles={['manager', 'owner', 'admin']} />}>
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="archives" element={<ArchivesPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>

          {/* 5. TOOLS (Manager Only) */}
          <Route element={<ProtectedRoute user={user} allowedRoles={['manager']} />}>
            <Route path="barcode" element={<BarcodePage />} />
          </Route>
        </Route>
        
        {/* POS Access (Managers and Cashiers) */}
        <Route element={<ProtectedRoute user={user} allowedRoles={['manager', 'cashier']} />}>
          <Route path="/pos" element={<PointOfSalePage user={user} onLogout={logout} onSwitchAccess={handleSwitchAccess} />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;