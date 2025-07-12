import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';
import { AuthUtils } from '../utils/auth.utils';
import { queryClient } from '../clients/reactQueryClient';

const keys = {
  userProfile: ['user-profile'],
}

export function useUserProfile() {
  return useQuery({
    queryKey: keys.userProfile,
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

export const invalidateUserProfile = () => {
  queryClient.invalidateQueries({ queryKey: keys.userProfile });
}