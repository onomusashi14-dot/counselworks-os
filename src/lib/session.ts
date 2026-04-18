export type UserRole = "attorney" | "staff";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  firmId?: string;
};

export type Session = {
  token: string;
  user: SessionUser;
};

const STORAGE_KEY = "counselworks.session";

export const session = {
  get(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },
  set(s: Session) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
