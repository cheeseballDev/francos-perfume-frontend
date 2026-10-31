import { useAuth } from "@/auth/UseAuth";
import { login, login as loginApi, resendOtp, verifyLoginOtp } from "@/services/LoginService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { MODULES, canSwitchModule, defaultModuleFor, hasAnyAccess } from "@/utils/roleAccess";
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

    const navigateToModule = (module) => {
        navigate(module === MODULES.POS ? '/pos' : '/home', { replace: true });
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
            activeModule: defaultModuleFor(result.role),
            branchId: result.branchId,
            branchLocation: result.branchLocation
        };

        if (result.accessToken == null) return;

        if (!hasAnyAccess(result.role)) {
            setError("This account's role no longer has access. Ask an admin to update it.");
            return;
        }

        if (canSwitchModule(result.role)) {
            setPendingAuthData(userData);
            setView('module');
        } else {
            setAuthUser(userData);
            navigateToModule(userData.activeModule);
        }
    };

    const continueLogin = (result) => {
        setFirstName(result.firstName);
        setLastName(result.lastName);

        if (result.requiresPasswordChange) {
                setShowPasswordModal(true);
                return;
            }

            if (result.requiresOtp) {
                setView('otp');
                return;
            }

        processSuccessfulLogin(result);
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
            continueLogin(await login(email, password));

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
            setPassword(newPassword);
            setShowPasswordModal(false);
            continueLogin(result);
        } catch (error) {
            setError(error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (code) => {
        setIsLoading(true);
        setError(null);

        try {
            processSuccessfulLogin(await verifyLoginOtp(email, code));
        } catch (err) {
            setError(getAPIError(err, "Invalid or expired code"));
        } finally {
            setIsLoading(false);
        }
    }

    const handleResendOtp = async () => {
        setError(null);
        try {
            await resendOtp(email);
            return true;
        } catch (err) {
            setError(getAPIError(err, "Could not send new code"));
            return false;
        }
    }

    const cancelOtp = () => {
        setView("login");
        setPassword("");
        setError(null);
    }


    const handleModuleSelect = (selectedModule) => {
        if (!pendingAuthData) return;

        const finalUserData = {
            ...pendingAuthData,
            activeModule: selectedModule,
        };

        setAuthUser(finalUserData);
        navigateToModule(selectedModule);
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
        handleVerifyOtp,
        handleResendOtp,
        cancelOtp
    };
};