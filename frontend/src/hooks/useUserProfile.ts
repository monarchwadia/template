import { useQuery } from '@tanstack/react-query';
import { useTrpcClient } from '../trpc/useTrpcClient';

export function useUserProfile() {
    const trpc = useTrpcClient();
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      // Set token in trpc client headers if needed
      // (Assumes trpc client supports setting headers dynamically)
      return await trpc.auth.getSelf.query();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
