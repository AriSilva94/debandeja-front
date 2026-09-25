import { NextResponse } from "next/server";
import { readAuthCookies, clearAuthCookies } from "@/lib/server/auth-cookies";
import { assertSameOrigin } from "@/lib/server/same-origin";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
  const csrfBlock = assertSameOrigin(req);
  if (csrfBlock) return csrfBlock;

  const { refreshToken } = await readAuthCookies();
  if (refreshToken) {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
