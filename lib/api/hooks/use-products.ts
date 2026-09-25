import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Product, ProductCategory, ProductInput, ProductList, ProductTab, StockLevel } from "@/lib/api/types";
import { useInvalidate } from "@/lib/api/hooks/use-invalidate";

export type ProductFilters = {
  search?: string;
  category?: string;
  tab?: ProductTab;
  level?: StockLevel;
  sortBy?: "name" | "sku" | "price" | "stock";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export function useProducts(filters: ProductFilters, enabled = true) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => api.get<ProductList>("/products", filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["products", "categories"],
    queryFn: () => api.get<ProductCategory[]>("/products/categories"),
  });
}

export function useCreateProductCategory() {
  const invalidate = useInvalidate(["products"]);
  return useMutation({
    mutationFn: (name: string) => api.post<ProductCategory>("/products/categories", { name }),
    onSuccess: invalidate,
  });
}

function useInvalidateCatalog() {
  return useInvalidate(["products", "stock", "alerts", "dashboard", "billing"]);
}

export function useSaveProduct() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: ProductInput }) =>
      id ? api.patch<Product>(`/products/${id}`, data) : api.post<Product>("/products", data),
    onSuccess: invalidate,
  });
}

export function useDuplicateProduct() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (id: string) => api.post<Product>(`/products/${id}/duplicate`),
    onSuccess: invalidate,
  });
}

export function useDeactivateProduct() {
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: (id: string) => api.delete<Product>(`/products/${id}`),
    onSuccess: invalidate,
  });
}
