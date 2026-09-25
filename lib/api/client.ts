export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload: unknown = isJson && text ? JSON.parse(text) : text || undefined;

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "message" in payload ? String(payload.message) : String(payload);
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

type QueryParams = Record<string, string | number | undefined>;

function withQuery(path: string, params?: QueryParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const api = {
  get: <T>(path: string, params?: QueryParams) => request<T>(`/api/backend${withQuery(path, params)}`),
  post: <T>(path: string, body?: unknown) =>
    request<T>(`/api/backend${path}`, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(`/api/backend${path}`, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(`/api/backend${path}`, { method: "DELETE" }),
};

export const authApi = {
  post: <T>(path: string, body?: unknown) =>
    request<T>(`/api${path}`, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
};

export const TOO_MANY_REQUESTS_MESSAGE = "Muitas tentativas seguidas. Aguarde um minuto e tente novamente.";

export function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status === 429) return TOO_MANY_REQUESTS_MESSAGE;
  if (error instanceof ApiError && error.status < 500 && error.message) return error.message;
  return fallback;
}
