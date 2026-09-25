import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-fetch";
import { setTenantCookie } from "@/lib/server/auth-cookies";
import { assertSameOrigin } from "@/lib/server/same-origin";
import type { MyTenant } from "@/lib/api/types";

export async function POST(req: Request) {
  const csrfBlock = assertSameOrigin(req);
  if (csrfBlock) return csrfBlock;

  const { tenantId } = (await req.json()) as { tenantId: string };

  const response = await backendFetch(req, "/me/tenants", { skipTenantHeader: true });
  if (!response.ok) {
    return NextResponse.json({ error: "Não foi possível validar suas distribuidoras" }, { status: 502 });
  }
  const tenants = (await response.json()) as MyTenant[];
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) {
    return NextResponse.json({ error: "Você não tem acesso a esta distribuidora" }, { status: 403 });
  }

  await setTenantCookie(tenantId);
  return NextResponse.json({ ok: true, screen: tenant.defaultScreen });
}
