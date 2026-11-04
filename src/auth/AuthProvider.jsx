import apiClient from "@/services/APIClient";
import { MODULES, canSwitchModule, hasAnyAccess, normalizeUser } from "@/utils/roleAccess";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { IDLE_LIMIT_MS, LAST_ACTIVITY_KEY, LOGOUT_REASON_KEY } from "./authConstants";

const SESSION_CHECK_MS = 30000;
const IDLE_CHECK_MS = 15000;
const ACTIVITY_WRITE_MS = 5000;
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "wheel", "scroll"];

const readLastActivity = () => {
    try {
        return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
    } catch {
        return 0;
    }
};

const writeLastActivity = (time = Date.now()) => {
    try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(time));
    } catch {
        // storage blocked: the idle check falls back to this tab's own timer
    }
};

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
        writeLastActivity();
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

    useEffect(() => {
        if (!user?.accessToken) return;

        const checkSession = () => {
            if (document.visibilityState !== "visible") return;
            apiClient.get("/session/ping").catch(() => {});
        };

        const timer = setInterval(checkSession, SESSION_CHECK_MS);
        document.addEventListener("visibilitychange", checkSession);
        window.addEventListener("focus", checkSession);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", checkSession);
            window.removeEventListener("focus", checkSession);
        };
    }, [user?.accessToken]);

    useEffect(() => {
        if (!user?.accessToken) return;

        const limit = user.activeModule === MODULES.POS ? IDLE_LIMIT_MS.POS : IDLE_LIMIT_MS.DASHBOARD;
        let lastLocal = readLastActivity() || Date.now();
        let lastWrite = 0;

        if (!readLastActivity()) writeLastActivity(lastLocal);

        const onActivity = () => {
            const now = Date.now();
            lastLocal = now;
            if (now - lastWrite >= ACTIVITY_WRITE_MS) {
                lastWrite = now;
                writeLastActivity(now);
            }
        };

        const checkIdle = () => {
            const last = Math.max(lastLocal, readLastActivity());
            if (Date.now() - last >= limit) {
                window.dispatchEvent(new CustomEvent("session-expired", { detail: "idle" }));
            }
        };

        checkIdle();
        ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
        document.addEventListener("visibilitychange", checkIdle);
        const timer = setInterval(checkIdle, IDLE_CHECK_MS);

        return () => {
            clearInterval(timer);
            ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
            document.removeEventListener("visibilitychange", checkIdle);
        };
    }, [user?.accessToken, user?.activeModule]);

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