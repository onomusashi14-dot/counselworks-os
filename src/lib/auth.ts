import { api } from "./api";
import type { Session, SessionUser, UserRole } from "./session";

type Membership = {
  firmId?: string;
  firm_id?: string;
  role?: string;
  isPrimary?: boolean;
  is_primary?: boolean;
};

type LoginResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: Partial<SessionUser> & {
    role?: string;
    firm_id?: string;
    fullName?: string;
    memberships?: Membership[];
  };
};

const ATTORNEY_ROLES = new Set(["attorney", "managing_attorney", "lawyer", "admin"]);

function normalizeRole(raw: unknown): UserRole {
  const r = String(raw || "").toLowerCase();
  if (ATTORNEY_ROLES.has(r)) return "attorney";
  return "staff";
}

function isAttorneyRole(raw: string | undefined): boolean {
  return ATTORNEY_ROLES.has((raw || "").toLowerCase());
}

/**
 * Pick the membership that matches the selected login tab.
 * If selectedRole is "attorney", find a membership with an attorney-class role.
 * If selectedRole is "staff", find a membership with a staff-class role.
 * Falls back to primary membership, then first membership.
 */
function pickMembership(
  memberships: Membership[] | undefined,
  selectedRole?: UserRole
): Membership | undefined {
  if (!memberships || memberships.length === 0) return undefined;

  if (selectedRole) {
    const wantAttorney = selectedRole === "attorney";
    const match = memberships.find((m) =>
      wantAttorney ? isAttorneyRole(m.role) : !isAttorneyRole(m.role)
    );
    if (match) return match;
  }

  // Fall back: primary membership, then first
  return (
    memberships.find((m) => m.isPrimary || m.is_primary) ?? memberships[0]
  );
}

function normalizeUser(
  u: LoginResponse["user"] | undefined,
  email: string,
  selectedRole?: UserRole
): SessionUser {
  const memberships = u?.memberships;
  const membership = pickMembership(memberships, selectedRole);

  // Role: prefer top-level u.role, then membership role
  const rawRole = u?.role ?? membership?.role;
  const firmId =
    u?.firmId ?? u?.firm_id ?? membership?.firmId ?? membership?.firm_id;

  return {
    id: String(u?.id ?? ""),
    email: u?.email ?? email,
    name: u?.name ?? u?.fullName,
    role: normalizeRole(rawRole),
    firmId,
  };
}

export async function login(
  email: string,
  password: string,
  selectedRole?: UserRole
): Promise<Session> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  const token = res.token ?? res.accessToken ?? res.access_token;
  if (!token) {
    throw {
      status: 200,
      code: "NO_TOKEN",
      message: "Login succeeded but no token was returned.",
    };
  }
  return { token, user: normalizeUser(res.user, email, selectedRole) };
}

export async function fetchMe(token: string): Promise<SessionUser> {
  const res = await api.get<LoginResponse["user"]>("/auth/me", token);
  return normalizeUser(res, res?.email ?? "");
}
