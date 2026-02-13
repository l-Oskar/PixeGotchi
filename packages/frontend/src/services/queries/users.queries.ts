import { useQuery } from "@tanstack/react-query";
import { usersApi, UserProfile } from "@/services/api/users.api";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: usersApi.getProfile,
  });
};

export const useUpdateProfile = (updates: Partial<UserProfile>) => {
  return useQuery({
    queryKey: ["usernameInfo"],
    queryFn: () => usersApi.updateProfile(updates),
  });
};
