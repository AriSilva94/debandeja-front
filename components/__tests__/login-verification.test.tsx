import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CriarContaPage from "@/app/(auth)/criar-conta/page";
import LoginPage from "@/app/(auth)/login/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      if (path === "/api/auth/login") {
        return new Response(JSON.stringify({ message: "E-mail não verificado" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ message: "ok" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function withProviders(ui: ReactNode) {
  return <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>;
}

describe("login com e-mail não confirmado", () => {
  it("oferece reenviar o link de confirmação para o e-mail digitado", async () => {
    render(withProviders(<LoginPage />));

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "dono@distribuidora.com" } });
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    fireEvent.click(await screen.findByRole("button", { name: "Reenviar link de confirmação" }));

    expect(await screen.findByText(/Enviamos um novo link de confirmação/)).toBeTruthy();
    const resendCall = vi.mocked(fetch).mock.calls.find(([path]) => path === "/api/auth/resend-verification");
    expect(JSON.parse(String(resendCall?.[1]?.body))).toEqual({ email: "dono@distribuidora.com" });
  });

  it("oferece login Google com ícone da biblioteca e tratamento visual da marca", () => {
    render(withProviders(<LoginPage />));

    const googleLogin = screen.getByRole("link", { name: "Continuar com Google" });
    expect(googleLogin.className).toContain("bg-brand-subtle");
    expect(googleLogin.querySelector("svg")).toBeTruthy();
  });
});

describe("criação de conta", () => {
  it("oferece retorno à página inicial após enviar a confirmação", async () => {
    render(withProviders(<CriarContaPage />));

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Ana Silva" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@distribuidora.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect((await screen.findByRole("link", { name: "Voltar para o início" })).getAttribute("href")).toBe("/");
  });
});
