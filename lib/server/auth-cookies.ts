import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "debandeja_access";
export const REFRESH_TOKEN_COOKIE = "debandeja_refresh";
export const TENANT_ID_COOKIE = "debandeja_tenant";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
const TENANT_ID_MAX_AGE = 30 * 24 * 60 * 60;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...baseCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE });
}

export async function setTenantCookie(tenantId: string) {
  const store = await cookies();
  store.set(TENANT_ID_COOKIE, tenantId, { ...baseCookieOptions, maxAge: TENANT_ID_MAX_AGE });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(TENANT_ID_COOKIE);
}

export async function readAuthCookies() {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: store.get(REFRESH_TOKEN_COOKIE)?.value,
    tenantId: store.get(TENANT_ID_COOKIE)?.value,
  };
}
