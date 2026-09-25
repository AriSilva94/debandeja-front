import type { DefaultScreen, PostAuthResult } from "@/lib/api/types";

export const SCREEN_PATH: Record<DefaultScreen, string> = {
  dashboard: "/",
  products: "/produtos",
  stock: "/estoque",
};

export function destinationPath(result: PostAuthResult) {
  if (result.destination === "dashboard") return SCREEN_PATH[result.screen];
  return result.destination === "onboarding" ? "/onboarding" : "/selecionar-distribuidora";
}
