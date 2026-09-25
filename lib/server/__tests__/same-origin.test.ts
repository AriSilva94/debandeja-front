import { describe, expect, it } from "vitest";
import { assertSameOrigin } from "@/lib/server/same-origin";

const INTERNAL_URL = "http://0.0.0.0:3000/api/auth/login";

function request(headers: Record<string, string>) {
  return new Request(INTERNAL_URL, { method: "POST", headers });
}

describe("assertSameOrigin", () => {
  it("aceita quando a origem do browser bate com o Host, mesmo atrás de proxy", () => {
    expect(assertSameOrigin(request({ host: "app.debandeja.com.br", origin: "https://app.debandeja.com.br" }))).toBeNull();
  });

  it("aceita pelo Referer quando não há Origin", () => {
    expect(assertSameOrigin(request({ host: "localhost:3101", referer: "http://localhost:3101/login" }))).toBeNull();
  });

  it("recusa origem de outro site", () => {
    expect(assertSameOrigin(request({ host: "app.debandeja.com.br", origin: "https://evil.example" }))?.status).toBe(403);
  });

  it("recusa sem Origin nem Referer", () => {
    expect(assertSameOrigin(request({ host: "app.debandeja.com.br" }))?.status).toBe(403);
  });
});
