import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/services/api/users.api";
import { UserProfile } from "@shared";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const data = usersApi.getProfile();
      console.log(data);
      return data;
    },
  });
};

export const useUpdateProfile = (updates: Partial<UserProfile>) => {
  return useQuery({
    queryKey: ["usernameInfo"],
    queryFn: () => usersApi.updateProfile(updates),
  });
};
