import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { BillingPlan, BillingSubscription, Invoice } from "@/lib/api/types";

export function useBillingSubscription() {
  return useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: () => api.get<BillingSubscription>("/billing/subscription"),
  });
}

export function useBillingPlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => api.get<BillingPlan[]>("/billing/plans"),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => api.get<Invoice[]>("/billing/invoices"),
  });
}
