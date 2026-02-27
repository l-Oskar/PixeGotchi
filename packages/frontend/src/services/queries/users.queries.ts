import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/services/api/users.api";
import { UserProfile } from "@shared";

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
