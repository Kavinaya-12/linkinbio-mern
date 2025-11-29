import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token")||null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {                
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      setIsExpired(isExpired);
      if (isExpired) logout();
    }
  }, [token]);
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsExpired(false);
  };
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsExpired(true);
  };
  return (
    <AuthContext.Provider value={{ token, login, logout, isExpired }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);