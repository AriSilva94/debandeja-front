import { NextResponse } from "next/server";
import type { DefaultScreen } from "@/lib/api/types";
import { setAuthCookies, setTenantCookie } from "./auth-cookies";
import { publicBackendFetch } from "./backend-fetch";
import { assertSameOrigin } from "./same-origin";

type SessionResult = {
  accessToken: string;
  refreshToken: string;
  tenants: { tenantId: string; name: string; role: string; defaultScreen: DefaultScreen }[];
};

export type PostAuthResponse =
  | { ok: true; destination: "onboarding" }
  | { ok: true; destination: "dashboard"; screen: DefaultScreen }
  | { ok: true; destination: "select-tenant"; tenants: SessionResult["tenants"] };

export async function establishSessionAndResolveDestination(result: SessionResult): Promise<PostAuthResponse> {
  await setAuthCookies(result.accessToken, result.refreshToken);

  if (result.tenants.length === 0) {
    return { ok: true, destination: "onboarding" };
  }
  if (result.tenants.length === 1) {
    await setTenantCookie(result.tenants[0].tenantId);
    return { ok: true, destination: "dashboard", screen: result.tenants[0].defaultScreen };
  }
  return { ok: true, destination: "select-tenant", tenants: result.tenants };
}

export async function forwardSessionRequest(req: Request, backendPath: string): Promise<NextResponse> {
  const csrfBlock = assertSameOrigin(req);
  if (csrfBlock) return csrfBlock;

  const response = await publicBackendFetch(req, backendPath, {
    method: "POST",
    body: await req.text(),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const payload = await response.text();
    return new NextResponse(payload, { status: response.status, headers: { "Content-Type": "application/json" } });
  }

  const data = (await response.json()) as SessionResult | { status: "verification_required" };
  if ("status" in data) return NextResponse.json(data);
  return NextResponse.json(await establishSessionAndResolveDestination(data));
}
