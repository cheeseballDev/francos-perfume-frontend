import { useAuth } from "@/auth/UseAuth";
import { login as loginApi } from "@/services/LoginService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const { login: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trueRole, setTrueRole] = useState('');
  const [pendingAuthData, setPendingAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const displayName = email ? email.split('@')[0] : 'User';

  const navigateByRole = (role) => {
    if (role === 'CASHIER') navigate('/pos');
    else if (role === 'OWNER' || role === 'ADMIN') navigate('/');
    else navigate('/home');
  };

  const processSuccessfulLogin = (result) => {
    const userData = {
      email: result.email,
      accessToken: result.accessToken,
      trueRole: result.role,
      activeRole: result.role,
      branchId: result.branchId,
      branchLocation: result.branchLocation
    };

    setTrueRole(result.role);

    if (result.role === 'MANAGER') {
      setPendingAuthData(userData);
      setView('module');
    } else {
      setAuthUser(userData);
      navigateByRole(result.role);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginApi(email, password);

      if (result.requiresPasswordChange) {
        setShowPasswordModal(true);
        return;
      }

      processSuccessfulLogin(result);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };


  const handlePasswordUpdate = async (newPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginApi(email, password, newPassword);
      
      setShowPasswordModal(false);
      processSuccessfulLogin(result);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleSelect = (selectedModule) => {
    if (!pendingAuthData) return;

    const finalUserData = {
      ...pendingAuthData,
      activeRole: selectedModule,
    };

    setAuthUser(finalUserData);
    navigateByRole(selectedModule);
  };

  return {
    error,
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
    handlePasswordUpdate
  };
};