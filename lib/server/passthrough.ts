import { NextResponse } from "next/server";
import { publicBackendFetch } from "./backend-fetch";
import { assertSameOrigin } from "./same-origin";

export async function passthroughJson(path: string, req: Request): Promise<NextResponse> {
  const csrfBlock = assertSameOrigin(req);
  if (csrfBlock) return csrfBlock;

  const body = await req.text();
  const response = await publicBackendFetch(req, path, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });

  const payload = await response.text();
  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
