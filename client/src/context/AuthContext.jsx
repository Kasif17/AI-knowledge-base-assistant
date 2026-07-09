import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getCurrentUserRequest,
} from "../services/authService";
import { getErrorMessage } from "../api/axiosClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("kb_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = (userData, accessToken) => {
    setUser(userData);
    localStorage.setItem("kb_user", JSON.stringify(userData));
    if (accessToken) {
      localStorage.setItem("kb_access_token", accessToken);
    }
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem("kb_user");
    localStorage.removeItem("kb_access_token");
  };

  // Validate any stored session on first load — a stale/expired token
  // shouldn't leave the UI showing "logged in" until the first API call fails.
  useEffect(() => {
    const stored = localStorage.getItem("kb_user");
    if (!stored) {
      setLoading(false);
      return;
    }
    getCurrentUserRequest()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("kb_user", JSON.stringify(res.data.user));
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginRequest({ email, password });
      persistSession(res.data.user, res.data.accessToken);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

const register = async (firstName, lastName, email, password, confirmPassword) => {
  try {
    const res = await registerRequest({ firstName, lastName, email, password, confirmPassword });
    persistSession(res.data.user, res.data.accessToken);
    return { success: true };
  } catch (err) {
    return { success: false, message: getErrorMessage(err) };
  }
};

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Even if the server call fails, clear the local session so the
      // user isn't stuck "logged in" on their end with no way out.
    } finally {
      clearSession();
      toast.success("Logged out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
