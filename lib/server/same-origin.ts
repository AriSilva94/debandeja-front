import { NextResponse } from "next/server";

export function assertSameOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin") ?? refererOrigin(req.headers.get("referer"));
  if (!origin) {
    return NextResponse.json({ message: "Origem da requisição não identificada" }, { status: 403 });
  }

  const host = req.headers.get("host");
  if (!host || hostOf(origin) !== host) {
    return NextResponse.json({ message: "Origem da requisição não permitida" }, { status: 403 });
  }

  return null;
}

function hostOf(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

function refererOrigin(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}
