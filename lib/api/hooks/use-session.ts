import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PermissionModule, SessionContext } from "@/lib/api/types";

export const PERMISSION_LEVEL = { NONE: 0, READ: 1, WRITE: 2, FULL: 3 } as const;

export function useSessionContext() {
  return useQuery({
    queryKey: ["context"],
    queryFn: () => api.get<SessionContext>("/me/context"),
    staleTime: 5 * 60_000,
  });
}

export function usePermission() {
  const { data } = useSessionContext();
  return (module: PermissionModule, level: keyof typeof PERMISSION_LEVEL = "WRITE") =>
    Boolean(data && data.permissions[module] >= PERMISSION_LEVEL[level]);
}

export function useMovementPermissions() {
  const canMove = usePermission()("movements");
  const onlyExits = useSessionContext().data?.role === "SALES";
  return { canMove, onlyExits, canRegisterEntries: canMove && !onlyExits };
}
