import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const response = await api.get("/auth/me");
        if (active && response.data?.success) {
          setUser(response.data.user);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    authReady,
    login: setUser,
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // Clear local state even if the logout request fails.
      } finally {
        setUser(null);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
