import { useMutation } from "@tanstack/react-query";
import { authApi, api } from "@/lib/api/client";
import type { OnboardingBranchResult, OnboardingCompanyResult } from "@/lib/api/types";

export function useCreateCompany() {
  return useMutation({
    mutationFn: (data: { legalName: string; tradeName?: string; cnpj?: string }) =>
      authApi.post<OnboardingCompanyResult>("/onboarding/company", data),
  });
}

export function useCreateFirstBranch() {
  return useMutation({
    mutationFn: (data: { name: string; city: string; uf: string }) =>
      api.post<OnboardingBranchResult>("/onboarding/branch", data),
  });
}
