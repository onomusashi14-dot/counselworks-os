const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://counselworks-api-production.up.railway.app";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: unknown }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Cases
  async getCases() {
    return this.request<unknown[]>("/cases");
  }

  async getCase(id: string) {
    return this.request<unknown>(`/cases/${id}`);
  }

  // Requests
  async getRequests() {
    return this.request<unknown[]>("/requests");
  }

  // Documents
  async getDocuments() {
    return this.request<unknown[]>("/documents");
  }

  // Notifications
  async getNotifications() {
    return this.request<unknown[]>("/notifications");
  }
}

export const apiClient = new ApiClient();
