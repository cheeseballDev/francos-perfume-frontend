import { useAuth } from "@/auth/UseAuth";
import { login, login as loginApi } from "@/services/LoginService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const { login: setAuthUser } = useAuth();

    const navigate = useNavigate();
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pendingAuthData, setPendingAuthData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const navigateByRole = (role) => {
        if (role === 'CASHIER') navigate('/pos');
        else if (role === 'OWNER' || role === 'ADMIN') navigate('/');
        else navigate('/home');
    };

    const processSuccessfulLogin = (result) => {
        const userData = {
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            employeeId: result.employeeId,
            accessToken: result.accessToken,
            trueRole: result.role,
            activeRole: result.role,
            branchId: result.branchId,
            branchLocation: result.branchLocation
        };

        if (result.accessToken == null) return;

        if (result.role === 'MANAGER') {
            setPendingAuthData(userData);
            setView('module');
        } else {
            setAuthUser(userData);
            navigateByRole(result.role);
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(email, password);
            setFirstName(result.firstName);
            setLastName(result.lastName);

            if (result.requiresPasswordChange) {
                setShowPasswordModal(true);
                return;
            }

            processSuccessfulLogin(result);

        } catch (error) {
            setError(error.response?.data);
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
        } catch (error) {
            setError(error.response?.data);
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
    };
};