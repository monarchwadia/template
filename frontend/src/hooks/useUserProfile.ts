import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../trpc/trpcClient';
import { AuthUtils } from '../utils/auth.utils';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const token = AuthUtils.getToken();
      if (!token) return null;
      // Set token in trpc client headers if needed
      // (Assumes trpc client supports setting headers dynamically)
      return await trpcClient.auth.getSelf.query();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
