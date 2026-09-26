import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import type { DoctorDashboardData, Equipment, LanguageCode, PatientDashboardData, SahayakDashboardData, User } from "@/types/api";
import { queryKeys } from "./keys";

type UserResponse = { user: User };

function useUserMutation<TInput>(request: (input: TInput) => Promise<UserResponse>) {
  const { setUser } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: ({ user }) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export const useUpdateProfile = () =>
  useUserMutation((input: Record<string, unknown>) => api<UserResponse>("/profile", { method: "PATCH", body: input }));

export const useSaveLanguage = () =>
  useUserMutation((preferredLanguage: LanguageCode) =>
    api<UserResponse>("/profile/language", { method: "PATCH", body: { preferredLanguage } }),
  );

export const useSetAvailability = () =>
  useUserMutation((isAvailable: boolean) => api<UserResponse>("/profile/availability", { method: "PATCH", body: { isAvailable } }));

export const useSetEquipment = () =>
  useUserMutation((equipment: Equipment) => api<UserResponse>("/profile/equipment", { method: "PATCH", body: equipment }));

export function useDashboard<T extends PatientDashboardData | DoctorDashboardData | SahayakDashboardData>(pollMs?: number) {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api<T>("/dashboard"),
    refetchInterval: pollMs ?? false,
  });
}
