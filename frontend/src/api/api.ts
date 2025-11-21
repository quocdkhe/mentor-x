import type { Message } from "@/types/common";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Extend the Axios request config to include a retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create a custom Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend URL
  withCredentials: true, // send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Message>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Check if:
    // 1. Status is 401
    // 2. We haven't already tried to retry this specific request (prevent infinite loop)
    // 3. The specific condition: The error response specifically lacks a 'message' field
    //    (checking both for no data, or data exists but message is falsy)
    const hasMessage = error.response?.data && error.response.data.message;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !hasMessage
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        // This assumes your backend sets the new access token in a cookie
        await api.post("/auth/refresh");

        // If successful, retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), reject the promise
        // You might want to trigger a logout action here via a store or event
        return Promise.reject(refreshError);
      }
    }

    // If it's a 401 WITH a message, or any other error, just reject
    return Promise.reject(error);
  }
);

export default api;
