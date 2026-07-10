import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/api/users.api";
import { UserProfile } from "@pixegotchi/shared";
import { useUserStore } from "@/store/user.store";

export const USER_KEYS = {
  profile: ["userProfile"] as const,
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: async () => {
      const data = usersApi.getProfile();
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) =>
      usersApi.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_KEYS.profile, data);
      setUser(data);
    },
  });
};

export const useUpdateUserPgc = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (amount: number) => usersApi.updateUserPgc(amount),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_KEYS.profile, data);
      setUser(data);
    },
  });
};
