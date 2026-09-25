import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { StockLevel, StockList } from "@/lib/api/types";

export type StockFilters = {
  search?: string;
  branchId?: string;
  productId?: string;
  status?: StockLevel;
  page?: number;
  pageSize?: number;
};

export function useStock(filters: StockFilters, enabled = true) {
  return useQuery({
    queryKey: ["stock", filters],
    queryFn: () => api.get<StockList>("/stock", filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}
