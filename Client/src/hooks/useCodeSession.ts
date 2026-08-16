import { trpc } from '@/lib/trpc';

export function useCodeSessions() {
  const utils = trpc.useUtils();
  const list = trpc.codeSession.list.useQuery();

  const create = trpc.codeSession.create.useMutation({
    onSuccess: () => utils.codeSession.list.invalidate(),
  });

  const remove = trpc.codeSession.remove.useMutation({
    onSuccess: () => utils.codeSession.list.invalidate(),
  });

  return {
    sessions: list.data?.sessions ?? [],
    isLoading: list.isLoading,
    create,
    remove,
  };
}

export function useCodeSessionById(id: string) {
  return trpc.codeSession.getById.useQuery({ id }, { enabled: !!id, retry: false });
}
