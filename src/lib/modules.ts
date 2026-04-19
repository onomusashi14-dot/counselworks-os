import { api } from "./api";
import type {
  Case,
  ClientRequest,
  Draft,
  Firm,
  Notification,
} from "./types";

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    for (const key of ["items", "data", "results", "records", "cases", "requests", "drafts", "notifications"]) {
      if (Array.isArray(p[key])) return p[key] as T[];
    }
  }
  return [];
}

export const firmsApi = {
  me: (token: string) => api.get<Firm>("/firms/me", token),
};

export const casesApi = {
  list: async (token: string) => {
    const payload = await api.get<unknown>("/firms/me/cases", token);
    return asList<Case>(payload);
  },
  get: (token: string, id: string) =>
    api.get<Case>(`/firms/me/cases/${id}`, token),
};

export type RequestPatch = Partial<
  Pick<
    ClientRequest,
    "status" | "caseId" | "case_id" | "assigneeId" | "assignee_id"
  >
>;

export type RequestCreate = {
  subject: string;
  clientName?: string;
  email?: string;
  note?: string;
};

export const requestsApi = {
  list: async (token: string) => {
    const payload = await api.get<unknown>("/firms/me/requests", token);
    return asList<ClientRequest>(payload);
  },
  get: (token: string, id: string) =>
    api.get<ClientRequest>(`/firms/me/requests/${id}`, token),
  update: (token: string, id: string, patch: RequestPatch) =>
    api.patch<ClientRequest>(`/firms/me/requests/${id}`, patch, token),
  create: (token: string, body: RequestCreate) =>
    api.post<ClientRequest>("/firms/me/requests", body, token),
};

export const draftsApi = {
  list: async (token: string) => {
    const payload = await api.get<unknown>("/firms/me/drafts", token);
    return asList<Draft>(payload);
  },
  get: (token: string, id: string) =>
    api.get<Draft>(`/firms/me/drafts/${id}`, token),
  approve: (token: string, id: string) =>
    api.post<Draft>(`/firms/me/drafts/${id}/approve`, {}, token),
  reject: (token: string, id: string, reason?: string) =>
    api.post<Draft>(`/firms/me/drafts/${id}/reject`, { reason }, token),
};

export const notificationsApi = {
  list: async (token: string) => {
    const payload = await api.get<unknown>("/notifications", token);
    return asList<Notification>(payload);
  },
};
