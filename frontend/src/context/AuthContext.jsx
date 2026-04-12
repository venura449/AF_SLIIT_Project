import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getProfile } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () =>
      localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  );
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("rememberMe") === "true",
  );
  const [loading, setLoading] = useState(true);

  // Derive role directly from user object
  const role = user?.role || null;
  const isAuthenticated = !!token;

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await getProfile();
      setUser(data.user || data);
    } catch {
      // Token invalid or expired — clear session
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = (newToken, userData, remember = true) => {
    // Clear both storages first to avoid stale tokens from a previous session
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("rememberMe");

    if (remember) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("rememberMe", "true");
    } else {
      sessionStorage.setItem("token", newToken);
      localStorage.setItem("rememberMe", "false");
    }
    setToken(newToken);
    setUser(userData);
    setRememberMe(remember);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    setToken(null);
    setUser(null);
    setRememberMe(false);
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    rememberMe,
    login,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
