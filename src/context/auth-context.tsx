"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { apiClient } from "@/lib/api";

const USE_MOCK = true;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cw_token");
    const savedUser = localStorage.getItem("cw_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        apiClient.setToken(token);
      } catch {
        localStorage.removeItem("cw_token");
        localStorage.removeItem("cw_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (USE_MOCK) {
      const mockUser = mockUsers.find((u) => u.email === email);
      if (mockUser) {
        const token = "mock_token_" + mockUser.id;
        localStorage.setItem("cw_token", token);
        localStorage.setItem("cw_user", JSON.stringify(mockUser));
        apiClient.setToken(token);
        setUser(mockUser);
        return;
      }
      // Allow any email — detect role from email
      const role = email.includes("attorney") ? "attorney" : "staff";
      const newUser: User = {
        id: "usr_dynamic",
        email,
        firstName: email.split("@")[0],
        lastName: "",
        role,
        firmId: "firm_001",
      };
      const token = "mock_token_dynamic";
      localStorage.setItem("cw_token", token);
      localStorage.setItem("cw_user", JSON.stringify(newUser));
      apiClient.setToken(token);
      setUser(newUser);
      return;
    }

    const res = await apiClient.login(email, password);
    const token = res.token;
    localStorage.setItem("cw_token", token);
    apiClient.setToken(token);
    // In real mode, decode user from token/response
    localStorage.setItem("cw_user", JSON.stringify(res.user));
    setUser(res.user as User);
  };

  const logout = () => {
    localStorage.removeItem("cw_token");
    localStorage.removeItem("cw_user");
    apiClient.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
