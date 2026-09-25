import type { BrazilState } from "@/lib/api/types";

const IBGE_LOCALIDADES = "https://servicodados.ibge.gov.br/api/v1/localidades";
const ONE_DAY = 60 * 60 * 24;

async function ibgeGet<T>(path: string): Promise<T> {
  const response = await fetch(`${IBGE_LOCALIDADES}${path}`, { next: { revalidate: ONE_DAY } });
  if (!response.ok) throw new Error(`IBGE respondeu ${response.status}`);
  return (await response.json()) as T;
}

export async function listStates(): Promise<BrazilState[]> {
  const states = await ibgeGet<{ sigla: string; nome: string }[]>("/estados?orderBy=nome");
  return states.map((state) => ({ uf: state.sigla, name: state.nome }));
}

export async function listCities(uf: string): Promise<string[]> {
  const cities = await ibgeGet<{ nome: string }[]>(`/estados/${uf}/municipios?orderBy=nome`);
  return cities.map((city) => city.nome);
}
