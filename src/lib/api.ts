export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://counselworks-api-production.up.railway.app";

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

function makeError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return { status, code, message, details };
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
          ? body
          : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    throw makeError(
      0,
      "NETWORK_ERROR",
      e instanceof Error ? e.message : "Network error reaching CounselWorks API"
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (isJson && payload && typeof payload === "object" && "ok" in payload) {
    const env = payload as Envelope<T>;
    if (env.ok) return env.data;
    throw makeError(
      res.status,
      env.error?.code || "API_ERROR",
      env.error?.message || `Request failed (${res.status})`,
      env.error?.details
    );
  }

  if (!res.ok) {
    throw makeError(
      res.status,
      "HTTP_ERROR",
      typeof payload === "string" && payload
        ? payload.slice(0, 200)
        : `Request failed (${res.status})`,
      payload
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "GET", token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: "POST", body, token }),
  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: "PUT", body, token }),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: "PATCH", body, token }),
  delete: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: "DELETE", token }),
};
