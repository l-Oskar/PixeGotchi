import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/api/users.api";
import { UserProfile } from "@pixegotchi/shared";

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

  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) =>
      usersApi.updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_KEYS.profile, data);
    },
  });
};
