import { clearAuthCookies, readAuthCookies, setAuthCookies } from "./auth-cookies";
import { getClientMeta } from "./client-meta";

const BACKEND_URL = process.env.BACKEND_URL;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

type BackendFetchOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipTenantHeader?: boolean;
};

export async function backendFetch(
  req: Request,
  path: string,
  options: BackendFetchOptions = {},
): Promise<Response> {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL não configurada");
  }

  const clientMeta = getClientMeta(req);
  const { accessToken, refreshToken, tenantId } = await readAuthCookies();

  const refreshedFirst = !accessToken && refreshToken ? await tryRefresh(clientMeta) : null;
  const token = accessToken ?? refreshedFirst?.accessToken;

  const response = await doFetch(path, options, token, tenantId, clientMeta);
  if (response.status !== 401) {
    return response;
  }

  const refreshed = accessToken ? await tryRefresh(clientMeta) : null;
  if (!refreshed) {
    await clearAuthCookies();
    return response;
  }

  return doFetch(path, options, refreshed.accessToken, tenantId, clientMeta);
}

export async function publicBackendFetch(req: Request, path: string, options: BackendFetchOptions = {}): Promise<Response> {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL não configurada");
  }
  return doFetch(path, options, undefined, undefined, getClientMeta(req));
}

function clientHeaders(clientMeta: { ip?: string; userAgent?: string }): Record<string, string> {
  const headers: Record<string, string> = {};
  if (INTERNAL_API_TOKEN) headers["X-Internal-Token"] = INTERNAL_API_TOKEN;
  if (clientMeta.ip) headers["X-Client-IP"] = clientMeta.ip;
  if (clientMeta.userAgent) headers["User-Agent"] = clientMeta.userAgent;
  return headers;
}

async function doFetch(
  path: string,
  options: BackendFetchOptions,
  accessToken: string | undefined,
  tenantId: string | undefined,
  clientMeta: { ip?: string; userAgent?: string },
): Promise<Response> {
  const headers: Record<string, string> = { ...options.headers, ...clientHeaders(clientMeta) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (tenantId && !options.skipTenantHeader) headers["X-Tenant-Id"] = tenantId;

  return fetch(`${BACKEND_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    signal: options.signal,
    cache: "no-store",
  });
}

type RefreshedTokens = { accessToken: string; refreshToken: string };

const REFRESH_REUSE_WINDOW_MS = 30_000;
const refreshInFlight = new Map<string, Promise<RefreshedTokens | null>>();

function refreshOnce(refreshToken: string, clientMeta: { ip?: string; userAgent?: string }) {
  const pending = refreshInFlight.get(refreshToken);
  if (pending) return pending;

  const request = fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...clientHeaders(clientMeta) },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).then((response) => (response.ok ? (response.json() as Promise<RefreshedTokens>) : null));

  refreshInFlight.set(refreshToken, request);
  request.finally(() => setTimeout(() => refreshInFlight.delete(refreshToken), REFRESH_REUSE_WINDOW_MS));
  return request;
}

async function tryRefresh(clientMeta: {
  ip?: string;
  userAgent?: string;
}): Promise<{ accessToken: string } | null> {
  const { refreshToken } = await readAuthCookies();
  if (!refreshToken) return null;

  const tokens = await refreshOnce(refreshToken, clientMeta);
  if (!tokens) return null;

  await setAuthCookies(tokens.accessToken, tokens.refreshToken);
  return { accessToken: tokens.accessToken };
}
