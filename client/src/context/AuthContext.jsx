import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isExpired, setIsExpired] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setIsExpired(true);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsExpired(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expired = payload.exp * 1000 < Date.now();
      setIsExpired(expired);
      if (expired) {
        logout();
      }
    } catch {
      setIsExpired(true);
      logout();
    }
  }, [token]);

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsExpired(false);
  }, []);

  const value = useMemo(() => ({ token, login, logout, isExpired }), [token, login, logout, isExpired]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);