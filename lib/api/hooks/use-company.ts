import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Company } from "@/lib/api/types";
import { useInvalidate } from "@/lib/api/hooks/use-invalidate";

export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: () => api.get<Company>("/company"),
  });
}

export function useUpdateCompany() {
  const invalidate = useInvalidate(["company", "context", "me"]);
  return useMutation({
    mutationFn: (data: Partial<Company>) => api.patch<Company>("/company", data),
    onSuccess: invalidate,
  });
}
