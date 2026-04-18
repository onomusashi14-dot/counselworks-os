"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { session as sessionStore, type Session } from "@/lib/session";

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  setSession: (s: Session) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sess, setSess] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSess(sessionStore.get());
    setReady(true);
  }, []);

  const setSession = useCallback(
    (s: Session) => {
      sessionStore.set(s);
      setSess(s);
    },
    []
  );

  const signOut = useCallback(() => {
    sessionStore.clear();
    setSess(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ session: sess, ready, setSession, signOut }),
    [sess, ready, setSession, signOut]
  );

  useEffect(() => {
    if (!ready) return;
    const onLogin = pathname === "/login";
    if (!sess && !onLogin) router.replace("/login");
    if (sess && onLogin) router.replace("/dashboard");
  }, [ready, sess, pathname, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
