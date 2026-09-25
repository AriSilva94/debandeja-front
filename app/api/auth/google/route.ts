import { NextResponse } from "next/server";
import {
  createGoogleAuthorizationUrl,
  createGoogleCodeChallenge,
  createGoogleCodeVerifier,
  createGoogleOAuthNonce,
  createGoogleOAuthState,
  googleCallbackUrl,
  googleOAuthCookieOptions,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_NONCE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
} from "@/lib/server/google-oauth";

export function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = googleCallbackUrl();
  if (!clientId || !redirectUri) {
    return NextResponse.json({ message: "Login com Google não configurado" }, { status: 503 });
  }

  const state = createGoogleOAuthState();
  const nonce = createGoogleOAuthNonce();
  const verifier = createGoogleCodeVerifier();
  const response = NextResponse.redirect(
    createGoogleAuthorizationUrl({
      clientId,
      redirectUri,
      state,
      nonce,
      codeChallenge: createGoogleCodeChallenge(verifier),
    }),
  );
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, googleOAuthCookieOptions);
  response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, nonce, googleOAuthCookieOptions);
  response.cookies.set(GOOGLE_OAUTH_VERIFIER_COOKIE, verifier, googleOAuthCookieOptions);
  return response;
}
