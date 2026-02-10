import { createContext, useContext, useEffect, useState } from "react";

const RiderAuthContext = createContext(null);

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const RiderAuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("riderToken");

    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);
    } else {
      localStorage.removeItem("riderToken");
    }

    setAuthReady(true);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("riderToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderProfile");
    setToken(null);
    window.location.hash = "#/login"; // ✅ FIX
  };

  return (
    <RiderAuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: Boolean(token),
        authReady,
      }}
    >
      {children}
    </RiderAuthContext.Provider>
  );
};

export const useRiderAuth = () => useContext(RiderAuthContext);
