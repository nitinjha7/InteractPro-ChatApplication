import { trpc } from '@/lib/trpc';

export function useAI() {
  const status = trpc.ai.status.useQuery();
  const ask = trpc.ai.ragQuery.useMutation();

  return {
    isConfigured: status.data?.configured ?? false,
    ask,
  };
}
