const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://counselworks-api-production.up.railway.app";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `API error: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: import("@/types").User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{ user: import("@/types").User }>("/api/auth/me");
  }

  // Cases
  async getCases() {
    return this.request<{ cases: import("@/types").Case[] }>("/api/cases");
  }

  async getCase(id: string) {
    return this.request<{ case: import("@/types").Case }>(`/api/cases/${id}`);
  }

  async createCase(data: Partial<import("@/types").Case>) {
    return this.request<{ case: import("@/types").Case }>("/api/cases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: Partial<import("@/types").Case>) {
    return this.request<{ case: import("@/types").Case }>(`/api/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Requests
  async getRequests() {
    return this.request<{ requests: import("@/types").Request[] }>("/api/requests");
  }

  async createRequest(data: Partial<import("@/types").Request>) {
    return this.request<{ request: import("@/types").Request }>("/api/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRequest(id: string, data: Partial<import("@/types").Request>) {
    return this.request<{ request: import("@/types").Request }>(`/api/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Documents / Files
  async getDocuments() {
    return this.request<{ files: import("@/types").Document[] }>("/api/files");
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: import("@/types").Notification[] }>("/api/notifications");
  }
}

export const api = new ApiClient();
