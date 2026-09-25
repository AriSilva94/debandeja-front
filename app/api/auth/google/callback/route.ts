import { NextRequest, NextResponse } from "next/server";
import { destinationPath } from "@/lib/post-auth";
import { publicBackendFetch } from "@/lib/server/backend-fetch";
import {
  establishSessionAndResolveDestination,
} from "@/lib/server/resolve-destination";
import {
  googleCallbackUrl,
  googleOAuthCookieOptions,
  GOOGLE_OAUTH_NONCE_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
} from "@/lib/server/google-oauth";

function loginRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL("/login?erro=google", request.url));
}

function clearGoogleOAuthCookies(response: NextResponse) {
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { ...googleOAuthCookieOptions, maxAge: 0 });
  response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, "", { ...googleOAuthCookieOptions, maxAge: 0 });
  response.cookies.set(GOOGLE_OAUTH_VERIFIER_COOKIE, "", { ...googleOAuthCookieOptions, maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const expectedState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(GOOGLE_OAUTH_VERIFIER_COOKIE)?.value;
  const nonce = request.cookies.get(GOOGLE_OAUTH_NONCE_COOKIE)?.value;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = googleCallbackUrl();

  if (!code || !state || state !== expectedState || !verifier || !nonce || !clientId || !clientSecret || !redirectUri) {
    return clearGoogleOAuthCookies(loginRedirect(request));
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const token = (await tokenResponse.json().catch(() => null)) as { id_token?: unknown } | null;
    if (!tokenResponse.ok || typeof token?.id_token !== "string") {
      return clearGoogleOAuthCookies(loginRedirect(request));
    }

    const backendResponse = await publicBackendFetch(request, "/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token.id_token, nonce }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!backendResponse.ok) {
      return clearGoogleOAuthCookies(loginRedirect(request));
    }

    const destination = await establishSessionAndResolveDestination(
      (await backendResponse.json()) as Parameters<typeof establishSessionAndResolveDestination>[0],
    );
    return clearGoogleOAuthCookies(
      NextResponse.redirect(new URL(destinationPath(destination), request.url)),
    );
  } catch {
    return clearGoogleOAuthCookies(loginRedirect(request));
  }
}
