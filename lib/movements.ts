import type { MovementType } from "@/lib/api/types";

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
};

export const MOVEMENT_TYPE_GLYPH: Record<MovementType, string> = {
  ENTRADA: "↑",
  SAIDA: "↓",
  AJUSTE: "±",
};

export const MOVEMENT_TYPE_TONE: Record<MovementType, "success" | "error" | "info"> = {
  ENTRADA: "success",
  SAIDA: "error",
  AJUSTE: "info",
};
