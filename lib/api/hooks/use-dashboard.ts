import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { DashboardSummary, StockAlert } from "@/lib/api/types";

export function useDashboardSummary(filters: { branchId?: string; dateFrom?: string }) {
  return useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => api.get<DashboardSummary>("/dashboard/summary", filters),
    placeholderData: keepPreviousData,
  });
}

export function useStockAlerts(branchId?: string, enabled = true) {
  return useQuery({
    queryKey: ["alerts", branchId],
    queryFn: () => api.get<StockAlert[]>("/alerts", { branchId }),
    placeholderData: keepPreviousData,
    enabled,
  });
}
