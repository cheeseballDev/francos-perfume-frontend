import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const loadFromSession = () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        console.error("Failed to parse stored user session", error);
        localStorage.removeItem('user');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadFromSession);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const getTokenExpiry = (token) => {
        try {
            const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const { exp } = JSON.parse(atob(payload));
            return exp ? exp * 1000 : null;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        if (!user?.accessToken) return;

        const expiresAt = getTokenExpiry(user.accessToken);
        if (!expiresAt) return;

        const timeLeft = expiresAt - Date.now();

        if (timeLeft <= 0) {
            window.dispatchEvent(new CustomEvent("session-expired"));
            return;
        }

        const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent("session-expired"))
        }, timeLeft);

        return () => clearTimeout(timer);
    }, [user?.accessToken]);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    const switchRole = (newActiveRole) => {
        setUser((prev) => {
        if (!prev) return null;
        const updatedUser = { ...prev, activeRole: newActiveRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
        });
    };

    const handleSwitchAccess = () => {
        const newRole = user?.activeRole === 'MANAGER' ? 'CASHIER' : 'MANAGER';
        switchRole(newRole);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchRole, handleSwitchAccess }}>
        {children}
        </AuthContext.Provider>
    );
};