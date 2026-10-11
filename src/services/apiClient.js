import axios from "axios";
import { API_URL } from "../config/index.js";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (config.url.includes("/auth/login")) {
      return config;
    }

    const userData = sessionStorage.getItem("user");

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
  (response) => response,
  (error) => {
    if (!error.response || error.code === 'ERR_NETWORK') {
      window.dispatchEvent(new CustomEvent('server-connection-error'));
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized access - token may be invalid or expired.");
      window.dispatchEvent(new CustomEvent('session-expired'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;