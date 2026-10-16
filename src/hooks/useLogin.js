import { useAuth } from "@/auth/UseAuth";
import { useToast } from "@/components/ui/use-toast";
import { login as loginApi } from "@/services/LoginService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const { login: setAuthUser } = useAuth();
    const { toast } = useToast();

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

    const displayName = email ? email.split('@')[0] : 'User';

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
            setFirstName(result.firstName);
            setLastName(result.lastName);
        if (result.requiresPasswordChange) {
            setShowPasswordModal(true);
            return;
        }

        processSuccessfulLogin(result);
        } catch (error) {
            toast({
                title: "Login Failed",
                description: `An error occurred while logging in.${error.response?.data}`,
                variant: "destructive",
                duration: 5000
            })
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
            toast({
                title: "Update Password Failed",
                description: `An error occurred while updating the password.${error}`,
                variant: "destructive",
            })
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
        handlePasswordUpdate,
        firstName,
        lastName
    };
};