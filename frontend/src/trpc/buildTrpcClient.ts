import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@git-reports/backend';

export const buildTrpcClient = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: apiUrl,
        headers: () => {
          const token = localStorage.getItem('token');
          if (token) {
            return {
              Authorization: `Bearer ${token}`,
            }
          } else {
            return {};
          }
        }
      }),
    ],
  });
  return trpc;
}