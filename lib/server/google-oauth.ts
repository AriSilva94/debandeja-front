import { createHash, randomBytes } from "node:crypto";

type GoogleAuthorizationParams = {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
};

export const GOOGLE_OAUTH_STATE_COOKIE = "debandeja_google_oauth_state";
export const GOOGLE_OAUTH_VERIFIER_COOKIE = "debandeja_google_oauth_verifier";
export const GOOGLE_OAUTH_NONCE_COOKIE = "debandeja_google_oauth_nonce";

export const googleOAuthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth/google",
  maxAge: 10 * 60,
};

export function createGoogleAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  nonce,
  codeChallenge,
}: GoogleAuthorizationParams) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

export function createGoogleOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function createGoogleOAuthNonce() {
  return randomBytes(32).toString("base64url");
}

export function createGoogleCodeVerifier() {
  return randomBytes(64).toString("base64url");
}

export function createGoogleCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function googleCallbackUrl() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!redirectUri) return null;

  try {
    const url = new URL(redirectUri);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function googleLoginErrorRedirectUrl(requestUrl: string) {
  return googleCallbackDestinationUrl("/login?erro=google", requestUrl);
}

export function googleCallbackDestinationUrl(path: string, requestUrl: string) {
  return new URL(path, googleCallbackUrl() ?? requestUrl).toString();
}
