// Shared keys for the auth flow (kept out of AuthProvider.jsx so Fast Refresh keeps working)
export const LOGOUT_REASON_KEY = "logout_reason";
export const LAST_ACTIVITY_KEY = "last_activity";
export const IDLE_LIMIT_MS = {
    POS: 15 * 60 * 1000,
    DASHBOARD: 30 * 60 * 1000,
};
