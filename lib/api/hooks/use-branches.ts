import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Branch, BranchInput } from "@/lib/api/types";
import { useInvalidate } from "@/lib/api/hooks/use-invalidate";

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get<Branch[]>("/branches"),
  });
}

function useInvalidateBranches() {
  return useInvalidate(["branches", "stock", "dashboard", "alerts", "billing"]);
}

export function useSaveBranch() {
  const invalidate = useInvalidateBranches();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: BranchInput }) =>
      id ? api.patch<Branch>(`/branches/${id}`, data) : api.post<Branch>("/branches", data),
    onSuccess: invalidate,
  });
}

export function useSetBranchActive() {
  const invalidate = useInvalidateBranches();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? api.patch<Branch>(`/branches/${id}`, { active: true }) : api.delete<Branch>(`/branches/${id}`),
    onSuccess: invalidate,
  });
}

