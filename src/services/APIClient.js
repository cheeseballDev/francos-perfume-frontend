import axios from "axios";
import { API_URL } from "../config/index.js";
import { toUtcDateValues } from "../utils/formattingUtils.jsx";

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            if (config.headers && typeof config.headers.delete === 'function') {
                config.headers.delete('Content-Type');
            } else {
                delete config.headers['Content-Type'];
            }
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        // The backend accepts UTC only: picked dates ("2026-10-31") are sent as the
        // start/end of that day in Philippine time, in UTC. See toUtcDateValues.
        if (config.params) config.params = toUtcDateValues(config.params);
        if (config.data && !(config.data instanceof FormData)) config.data = toUtcDateValues(config.data);

        if (config.url.includes("/auth/login")) {
            return config;
        }

        const userData = localStorage.getItem("user");

        if (userData) {
        try {
            const { accessToken } = JSON.parse(userData);
            if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            }
        } catch (error) {
            console.error("Failed to parse user session token:", error);
        }
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        window.dispatchEvent(new CustomEvent('server-connection-success'));
        return response;
    },
    (error) => {
        if (!error.response || error.code === 'ERR_NETWORK') {
            window.dispatchEvent(new CustomEvent('server-connection-error'));
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            const isAuthCall = error.config?.url?.toLowerCase().startsWith("/auth/");
            const hadToken = Boolean(error.config?.headers?.Authorization);
            if (!isAuthCall && hadToken) {
                window.dispatchEvent(new CustomEvent("session-expired"));
            }
        }
        
        return Promise.reject(error);
    }
);
export default apiClient;