import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CityCombobox } from "@/components/location/city-combobox";

const SP_CITIES = ["Araraquara", "São Carlos", "São José do Rio Preto", "São Paulo", "Sorocaba"];

let citiesStatus = 200;

beforeEach(() => {
  citiesStatus = 200;
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      citiesStatus === 200
        ? new Response(JSON.stringify(SP_CITIES), { status: 200, headers: { "content-type": "application/json" } })
        : new Response("{}", { status: citiesStatus }),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Harness({ uf, onChange = vi.fn() }: { uf: string; onChange?: (city: string) => void }) {
  const [city, setCity] = useState("");
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <label htmlFor="city">Cidade</label>
      <CityCombobox
        id="city"
        uf={uf}
        value={city}
        onChange={(value) => {
          setCity(value);
          onChange(value);
        }}
      />
    </QueryClientProvider>
  );
}

describe("CityCombobox", () => {
  it("fica bloqueado até escolher o estado", () => {
    render(<Harness uf="" />);
    const input = screen.getByLabelText("Cidade") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe("Escolha o estado primeiro");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("busca sem acento, prioriza quem começa com o termo e escolhe pelo teclado", async () => {
    const onChange = vi.fn();
    render(<Harness uf="SP" onChange={onChange} />);
    const input = await screen.findByPlaceholderText("Buscar cidade");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "sao" } });
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["São Carlos", "São José do Rio Preto", "São Paulo"]);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenLastCalledWith("São Paulo");
    expect((input as HTMLInputElement).value).toBe("São Paulo");
  });

  it("nome exato digitado vale como escolha ao sair com Tab", async () => {
    const onChange = vi.fn();
    render(<Harness uf="SP" onChange={onChange} />);
    const input = await screen.findByPlaceholderText("Buscar cidade");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "araraquara" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(onChange).toHaveBeenLastCalledWith("Araraquara");
  });

  it("sem a lista do IBGE, libera digitação livre com opção de tentar de novo", async () => {
    citiesStatus = 502;
    render(<Harness uf="SP" />);

    expect(await screen.findByText(/Não conseguimos carregar a lista de cidades/, undefined, { timeout: 4000 })).toBeTruthy();
    const input = screen.getByLabelText("Cidade") as HTMLInputElement;
    expect(input.getAttribute("role")).toBeNull();
    fireEvent.change(input, { target: { value: "Cidade Nova" } });
    expect(input.value).toBe("Cidade Nova");
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
  });
});
