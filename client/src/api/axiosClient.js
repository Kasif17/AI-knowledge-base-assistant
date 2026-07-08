import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly cookies set by the backend
});

// Also attach a Bearer token if we have one stored — backend accepts either,
// this covers cases where cookies aren't available (e.g. some dev setups).
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("kb_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirectingToLogin = false;

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isRedirectingToLogin) {
      localStorage.removeItem("kb_access_token");
      localStorage.removeItem("kb_user");
      if (!window.location.pathname.startsWith("/login")) {
        isRedirectingToLogin = true;
        window.location.href = "/login?expired=1";
      }
    }

    return Promise.reject(error);
  }
);

// Pulls a readable message out of any backend error shape (ApiError JSON)
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

export default axiosClient;
