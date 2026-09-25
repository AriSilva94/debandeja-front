import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/server/backend-fetch";
import { assertSameOrigin } from "@/lib/server/same-origin";

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  if (hasBody) {
    const csrfBlock = assertSameOrigin(req);
    if (csrfBlock) return csrfBlock;
  }

  const search = req.nextUrl.search;
  const targetPath = `/${path.join("/")}${search}`;
  const body = hasBody ? await req.text() : undefined;

  const response = await backendFetch(req, targetPath, {
    method: req.method,
    body: body || undefined,
    headers: hasBody ? { "Content-Type": "application/json" } : {},
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "application/json";
  const payload = await response.text();
  return new NextResponse(payload, {
    status: response.status,
    headers: { "Content-Type": contentType },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
