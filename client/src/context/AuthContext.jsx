import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser } from "../lib/api";

const AuthContext = createContext(null);
const UNAUTHORIZED_EVENT = "linkhub:unauthorized";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
    setSessionExpired(false);
  }, []);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    setLoading(false);
    setSessionExpired(false);
  }, []);

  useEffect(() => {
    const onUnauthorized = (event) => {
      const requestToken = event.detail?.token;
      if (!requestToken || requestToken !== localStorage.getItem("token")) return;
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setLoading(false);
      setSessionExpired(true);
    };
    const onStorage = (event) => {
      if (event.key !== "token") return;
      setToken(event.newValue || null);
      setUser(null);
      setLoading(Boolean(event.newValue));
      setSessionExpired(false);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    getCurrentUser()
      .then((data) => {
        if (active) {
          setUser(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    sessionExpired,
    login,
    logout,
    isAuthenticated: Boolean(token),
  }), [token, user, loading, sessionExpired, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
