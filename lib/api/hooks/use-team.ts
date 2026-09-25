import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useInvalidate } from "@/lib/api/hooks/use-invalidate";
import type { MemberInput, RolesMatrix, TeamMember } from "@/lib/api/types";

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: () => api.get<TeamMember[]>("/team"),
  });
}

export function useRolesMatrix() {
  return useQuery({
    queryKey: ["roles-matrix"],
    queryFn: () => api.get<RolesMatrix>("/team/roles-matrix"),
    staleTime: Infinity,
  });
}

export function useInviteMember() {
  const invalidate = useInvalidate(["team", "billing"]);
  return useMutation({
    mutationFn: (data: MemberInput & { email: string }) => api.post<TeamMember>("/team/invite", data),
    onSuccess: invalidate,
  });
}

export function useUpdateMember() {
  const invalidate = useInvalidate(["team", "billing"]);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberInput }) => api.patch<TeamMember>(`/team/${id}`, data),
    onSuccess: invalidate,
  });
}

export function useRemoveMember() {
  const invalidate = useInvalidate(["team", "billing"]);
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/team/${id}`),
    onSuccess: invalidate,
  });
}

export function useResendInvite() {
  const invalidate = useInvalidate(["team", "billing"]);
  return useMutation({
    mutationFn: (id: string) => api.post<TeamMember>(`/team/${id}/resend-invite`),
    onSuccess: invalidate,
  });
}
