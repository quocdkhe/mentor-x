import axios from "axios";

// Create a custom Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend URL
  withCredentials: true, // send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle 401, 403 etc here
    return Promise.reject(error);
  }
);

export default api;
