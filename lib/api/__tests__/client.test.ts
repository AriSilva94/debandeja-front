import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "@/lib/api/client";

function mockFetch(body: string, status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status, headers: { "content-type": "application/json" } })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("resolve resposta 200 sem corpo rotulada como JSON", async () => {
    mockFetch("", 200);
    await expect(api.delete<void>("/team/m-1")).resolves.toBeUndefined();
  });

  it("lê JSON quando há corpo", async () => {
    mockFetch(JSON.stringify({ id: "m-1" }), 200);
    await expect(api.get<{ id: string }>("/team/m-1")).resolves.toEqual({ id: "m-1" });
  });

  it("propaga a mensagem do backend em erro", async () => {
    mockFetch(JSON.stringify({ message: "Sem permissão" }), 403);
    await expect(api.delete("/team/m-1")).rejects.toEqual(new ApiError("Sem permissão", 403));
  });
});
