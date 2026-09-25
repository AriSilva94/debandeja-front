import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/client";
import type { RegisterResult, AcceptInviteResult, PostAuthResult } from "@/lib/api/types";

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.post<PostAuthResult>("/auth/login", data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      authApi.post<RegisterResult>("/auth/register", data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authApi.post<{ ok: true }>("/auth/logout"),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.post<PostAuthResult>("/auth/verify-email", { token }),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.post<{ message: string }>("/auth/resend-verification", { email }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.post<{ message: string }>("/auth/forgot-password", { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.post<{ message: string }>("/auth/reset-password", data),
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (data: { token: string; name?: string; password?: string }) =>
      authApi.post<AcceptInviteResult>("/invites/accept", data),
  });
}
