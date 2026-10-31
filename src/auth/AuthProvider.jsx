import { MODULES, canSwitchModule, hasAnyAccess, normalizeUser } from "@/utils/roleAccess";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { LOGOUT_REASON_KEY } from "./authConstants";

const loadFromSession = () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;

    try {
        const user = normalizeUser(JSON.parse(savedUser));
        if (!hasAnyAccess(user?.trueRole)) {
            localStorage.removeItem('user');
            return null;
        }
        return user;
    } catch (error) {
        console.error("Failed to parse stored user session", error);
        localStorage.removeItem('user');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadFromSession);

    const login = (userData) => {
        const normalized = normalizeUser(userData);
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
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

    const logout = (reason) => {
        localStorage.clear();
        if (typeof reason === "string") {
            try {
                sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
            } catch {
                // storage blocked: the user still gets logged out, just without the message
            }
        }
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (changes) => {
        setUser((prev) => {
            if (!prev) return prev;

            const next = {...prev, ...changes};
            localStorage.setItem('user', JSON.stringify(next));
            return next;
        });
    };

    const switchModule = (module) => {
        const next = normalizeUser({ ...user, activeModule: module });
        localStorage.setItem('user', JSON.stringify(next));
        setUser(next);
        return next;
    };

    /** Toggles the module. Returns the updated user, or null when the role can't switch. */
    const handleSwitchAccess = () => {
        if (!user || !canSwitchModule(user.trueRole)) return null;
        return switchModule(user.activeModule === MODULES.POS ? MODULES.DASHBOARD : MODULES.POS);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchModule, updateUser, handleSwitchAccess }}>
        {children}
        </AuthContext.Provider>
    );
};