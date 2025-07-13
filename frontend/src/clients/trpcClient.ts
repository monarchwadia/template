import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@coolproject/backend';
import { AuthUtils } from '../utils/auth.utils';

const buildTrpcClient = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: apiUrl,
        headers: () => {
          const token = AuthUtils.getToken();
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

export const trpcClient = buildTrpcClient();