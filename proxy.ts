import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, TENANT_ID_COOKIE } from "@/lib/server/auth-cookies";

const AUTH_PAGES = ["/login", "/criar-conta", "/recuperar-senha"];
const SHELL_PAGES = [
  "/",
  "/produtos",
  "/estoque",
  "/movimentacoes",
  "/equipe",
  "/filiais",
  "/assinatura",
  "/configuracoes",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(
    request.cookies.get(REFRESH_TOKEN_COOKIE) || request.cookies.get(ACCESS_TOKEN_COOKIE),
  );
  const hasTenant = Boolean(request.cookies.get(TENANT_ID_COOKIE));

  if (AUTH_PAGES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isShellPage = SHELL_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isShellPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isShellPage && isAuthenticated && !hasTenant) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (pathname === "/onboarding" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
