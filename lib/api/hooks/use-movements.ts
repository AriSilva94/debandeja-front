import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Movement, MovementInput, MovementType, Paginated } from "@/lib/api/types";
import { useInvalidate } from "@/lib/api/hooks/use-invalidate";

export type MovementFilters = {
  branchId?: string;
  type?: MovementType;
  dateFrom?: string;
  page?: number;
  pageSize?: number;
};

export function useMovements(filters: MovementFilters, enabled = true) {
  return useQuery({
    queryKey: ["movements", filters],
    queryFn: () => api.get<Paginated<Movement>>("/movements", filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

function useInvalidateBalances() {
  return useInvalidate(["movements", "stock", "products", "alerts", "dashboard"]);
}

export function useCreateMovement() {
  const invalidate = useInvalidateBalances();
  return useMutation({
    mutationFn: (data: MovementInput) => api.post<Movement>("/movements", data),
    onSuccess: invalidate,
  });
}

export function useReverseMovement() {
  const invalidate = useInvalidateBalances();
  return useMutation({
    mutationFn: (id: string) => api.post<Movement>(`/movements/${id}/reverse`),
    onSuccess: invalidate,
  });
}
