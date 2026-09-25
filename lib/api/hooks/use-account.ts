import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authApi } from "@/lib/api/client";
import type { Me, NotificationSettings, Preferences, SessionContext, UserSession } from "@/lib/api/types";
import { useInvalidate } from "@/lib/api/hooks/use-invalidate";

export function useUpdateProfile() {
  const invalidate = useInvalidate(["me"]);
  return useMutation({
    mutationFn: (data: { name: string }) => api.patch<Me>("/me", data),
    onSuccess: invalidate,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => api.patch<void>("/me/password", data),
  });
}

export function useRequestEmailChange() {
  const invalidate = useInvalidate(["me"]);
  return useMutation({
    mutationFn: (data: { newEmail: string; currentPassword: string }) =>
      api.post<{ pendingEmail: string }>("/me/email", data),
    onSuccess: invalidate,
  });
}

export function useCancelEmailChange() {
  const invalidate = useInvalidate(["me"]);
  return useMutation({
    mutationFn: () => api.delete<void>("/me/email"),
    onSuccess: invalidate,
  });
}

export function useConfirmEmailChange() {
  return useMutation({
    mutationFn: (token: string) => authApi.post<{ email: string }>("/auth/confirm-email-change", { token }),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.get<UserSession[]>("/me/sessions"),
  });
}

export function useRevokeSession() {
  const invalidate = useInvalidate(["sessions"]);
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/me/sessions/${id}`),
    onSuccess: invalidate,
  });
}

export function useRevokeOtherSessions() {
  const invalidate = useInvalidate(["sessions"]);
  return useMutation({
    mutationFn: () => api.delete<void>("/me/sessions/others"),
    onSuccess: invalidate,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      api.patch<NotificationSettings>("/me/notification-settings", data),
    onSuccess: (notificationSettings) =>
      queryClient.setQueryData<Me>(["me"], (me) => me && { ...me, notificationSettings }),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Preferences>) => api.patch<Preferences>("/me/preferences", data),
    onSuccess: (preferences) =>
      queryClient.setQueryData<SessionContext>(["context"], (context) => context && { ...context, preferences }),
  });
}
