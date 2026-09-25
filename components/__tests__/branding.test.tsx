import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuthPanel } from "@/components/auth/auth-layout";
import { BrandLogo } from "@/components/brand-logo";
import { StepIndicator } from "@/components/auth/step-indicator";

afterEach(cleanup);

describe("marca Debandeja", () => {
  it("exibe a nova marca com uma imagem acessível no painel de autenticação", () => {
    render(<AuthPanel heading="Controle seu estoque" description="Descrição" />);

    expect(screen.getByRole("img", { name: "Debandeja" })).toBeTruthy();
    expect(screen.getByText("© 2026 Debandeja Sistemas · Suporte")).toBeTruthy();
    expect(screen.queryByText(/Casco/)).toBeNull();
  });

  it("usa uma versão compacta da marca quando solicitado", () => {
    render(<BrandLogo variant="mark" />);

    const logo = screen.getByRole("img", { name: "Debandeja" });
    expect(logo.getAttribute("src")).toContain("debandeja-mark.png");
  });

  it("expõe semanticamente a etapa atual do cadastro", () => {
    render(<StepIndicator steps={["Conta", "Distribuidora", "Filial"]} activeStep={2} />);

    const progress = screen.getByRole("list", { name: "Progresso do cadastro" });
    expect(progress.querySelector('[aria-current="step"]')?.textContent).toBe("Distribuidora");
  });
});
