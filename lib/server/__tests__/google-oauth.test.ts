import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createGoogleAuthorizationUrl,
  googleCallbackUrl,
  googleCallbackDestinationUrl,
  googleLoginErrorRedirectUrl,
} from "@/lib/server/google-oauth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createGoogleAuthorizationUrl", () => {
  it("usa Authorization Code com PKCE e escopos mínimos de identidade", () => {
    const url = new URL(
      createGoogleAuthorizationUrl({
        clientId: "client-id.apps.googleusercontent.com",
        redirectUri: "https://dev.debandeja.store/api/auth/google/callback",
        state: "state-value",
        nonce: "nonce-value",
        codeChallenge: "challenge-value",
      }),
    );

    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("client-id.apps.googleusercontent.com");
    expect(url.searchParams.get("redirect_uri")).toBe("https://dev.debandeja.store/api/auth/google/callback");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.searchParams.get("nonce")).toBe("nonce-value");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-value");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("usa a URI de callback configurada", () => {
    vi.stubEnv(
      "GOOGLE_REDIRECT_URI",
      "https://dev.debandeja.store/api/auth/google/callback",
    );

    const callbackUrl = googleCallbackUrl as unknown as () => string;

    expect(callbackUrl()).toBe(
      "https://dev.debandeja.store/api/auth/google/callback",
    );
  });

  it("redireciona falhas para a origem configurada do callback", () => {
    vi.stubEnv(
      "GOOGLE_REDIRECT_URI",
      "https://dev.debandeja.store/api/auth/google/callback",
    );

    expect(
      googleLoginErrorRedirectUrl(
        "https://0.0.0.0:3000/api/auth/google/callback",
      ),
    ).toBe("https://dev.debandeja.store/login?erro=google");
  });

  it("redireciona sucessos para a origem configurada do callback", () => {
    vi.stubEnv(
      "GOOGLE_REDIRECT_URI",
      "https://dev.debandeja.store/api/auth/google/callback",
    );

    expect(
      googleCallbackDestinationUrl(
        "/onboarding",
        "https://0.0.0.0:3000/api/auth/google/callback",
      ),
    ).toBe("https://dev.debandeja.store/onboarding");
  });
});
