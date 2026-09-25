import type { PermissionModule, Role } from "@/lib/api/types";

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  SALES: "Vendedor",
  STOCKIST: "Estoquista",
};

export const ROLE_TONE: Record<Role, "brand" | "info" | "neutral"> = {
  OWNER: "brand",
  ADMIN: "info",
  MANAGER: "neutral",
  SALES: "neutral",
  STOCKIST: "neutral",
};

export const INVITABLE_ROLES = ["ADMIN", "MANAGER", "STOCKIST", "SALES"] as const satisfies readonly Role[];
export type InvitableRole = (typeof INVITABLE_ROLES)[number];

export const ROLE_DESCRIPTION: Record<InvitableRole, string> = {
  ADMIN: "Acesso total a todas as filiais, exceto excluir a conta.",
  MANAGER: "Edita produtos e estoque e registra movimentações nas filiais permitidas.",
  STOCKIST: "Registra entradas, saídas e ajustes nas filiais permitidas.",
  SALES: "Registra saídas e consulta estoque nas filiais permitidas.",
};

export const FULL_ACCESS_ROLES: readonly Role[] = ["OWNER", "ADMIN"];

const LEVEL_LABEL = ["—", "Leitura", "Editar", "Total"];

export function permissionLabel(role: Role, module: PermissionModule, level: number) {
  if (module === "movements" && level >= 2) {
    if (role === "SALES") return "Saídas";
    if (level === 2) return "Registrar";
  }
  return LEVEL_LABEL[level] ?? "—";
}
