import { useQuery } from "@tanstack/react-query";
import type { BrazilState } from "@/lib/api/types";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} respondeu ${response.status}`);
  return (await response.json()) as T;
}

export function useBrazilStates() {
  return useQuery({
    queryKey: ["locations", "states"],
    queryFn: () => getJson<BrazilState[]>("/api/locations/states"),
    staleTime: Infinity,
    retry: 1,
  });
}

export function useCities(uf: string) {
  return useQuery({
    queryKey: ["locations", "cities", uf],
    queryFn: () => getJson<string[]>(`/api/locations/states/${uf}/cities`),
    enabled: uf !== "",
    staleTime: Infinity,
    retry: 1,
  });
}
