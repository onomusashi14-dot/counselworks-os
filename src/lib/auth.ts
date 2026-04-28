import { api } from "./api";
import type { Session, SessionUser, UserRole } from "./session";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: Partial<SessionUser> & { role?: string; firm_id?: string };
};

function normalizeRole(raw: unknown): UserRole {
  const r = String(raw || "").toLowerCase();
  if (r === "attorney" || r === "managing_attorney" || r === "lawyer" || r === "admin") return "attorney";
  return "staff";
}

function normalizeUser(u: LoginResponse["user"] | undefined, email: string): SessionUser {
  return {
    id: String(u?.id ?? ""),
    email: u?.email ?? email,
    name: u?.name,
    role: normalizeRole(u?.role),
    firmId: u?.firmId ?? u?.firm_id,
  };
}

export async function login(email: string, password: string): Promise<Session> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  const token = res.token ?? res.accessToken ?? res.access_token;
  if (!token) {
    throw {
      status: 200,
      code: "NO_TOKEN",
      message: "Login succeeded but no token was returned.",
    };
  }
  return { token, user: normalizeUser(res.user, email) };
}

export async function fetchMe(token: string): Promise<SessionUser> {
  const res = await api.get<LoginResponse["user"]>("/auth/me", token);
  return normalizeUser(res, res?.email ?? "");
}
