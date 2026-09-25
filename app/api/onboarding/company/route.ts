import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-fetch";
import { setTenantCookie } from "@/lib/server/auth-cookies";
import { assertSameOrigin } from "@/lib/server/same-origin";

export async function POST(req: Request) {
  const csrfBlock = assertSameOrigin(req);
  if (csrfBlock) return csrfBlock;

  const body = await req.text();
  const response = await backendFetch(req, "/onboarding/company", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    skipTenantHeader: true,
  });

  const payload = await response.text();
  if (response.ok) {
    const data = JSON.parse(payload) as { tenantId: string };
    await setTenantCookie(data.tenantId);
  }

  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
