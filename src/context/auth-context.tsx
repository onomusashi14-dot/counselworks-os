"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, UserRole } from "@/types";
import { api } from "@/lib/api";
import { mockUser, mockStaffUser } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAttorney: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USE_MOCK = true; // Toggle when backend is live

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("cw_token") : null;
    if (token) {
      if (USE_MOCK) {
        const savedRole = localStorage.getItem("cw_role") as UserRole | null;
        setUser(savedRole === "staff" ? mockStaffUser : mockUser);
        setLoading(false);
      } else {
        api.setToken(token);
        api
          .getMe()
          .then((res) => setUser(res.user))
          .catch(() => {
            localStorage.removeItem("cw_token");
            api.setToken(null);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (USE_MOCK) {
      const role: UserRole = email.includes("staff") ? "staff" : "attorney";
      const u = role === "staff" ? mockStaffUser : mockUser;
      localStorage.setItem("cw_token", "mock-token");
      localStorage.setItem("cw_role", role);
      setUser(u);
      return;
    }

    const res = await api.login(email, password);
    localStorage.setItem("cw_token", res.token);
    api.setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cw_token");
    localStorage.removeItem("cw_role");
    api.setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAttorney: user?.role === "attorney",
        isStaff: user?.role === "staff",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
