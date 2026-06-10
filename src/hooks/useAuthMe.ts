import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

export const useAuthMe = () => {
  const { authMe } = useAuthStore();

  return useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      return await authMe();
    },
    retry: false,
  });
};
