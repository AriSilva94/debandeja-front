import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authApi } from "@/lib/api/client";
import type { DefaultScreen, Me, MyTenant } from "@/lib/api/types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<Me>("/me"),
  });
}

export function useMyTenants(enabled = true) {
  return useQuery({
    queryKey: ["me", "tenants"],
    queryFn: () => api.get<MyTenant[]>("/me/tenants"),
    enabled,
  });
}

export function useSelectTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => authApi.post<{ ok: true; screen: DefaultScreen }>("/tenant/select", { tenantId }),
    onSuccess: () => queryClient.resetQueries(),
  });
}
