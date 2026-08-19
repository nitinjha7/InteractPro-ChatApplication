import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CollaborativeEditor from '@/components/editor/CollaborativeEditor';
import { useCodeSessionById } from '@/hooks/useCodeSession';
import { useStore } from '@/store/store';
import { trpc } from '@/lib/trpc';
import Loader from './Loader';

export default function CodeSession() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const userInfo = useStore((s) => s.userInfo);
  const utils = trpc.useUtils();

  const { data, isLoading, isError } = useCodeSessionById(sessionId);
  const join = trpc.codeSession.join.useMutation({
    onSuccess: () => utils.codeSession.getById.invalidate({ id: sessionId }),
  });

  // a shared link lands here as a non-participant; join once, then the query succeeds
  useEffect(() => {
    if (isError && sessionId && !join.isPending && !join.isSuccess) {
      join.mutate({ id: sessionId });
    }
  }, [isError, sessionId, join]);

  if (isLoading || join.isPending) return <Loader />;

  if (!data?.session) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
        <p>This session could not be opened.</p>
        <Button onClick={() => navigate('/session')}>Back to sessions</Button>
      </div>
    );
  }

  const session = data.session;
  const me = session.participants.find((p) => p.userId === userInfo?.id);

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/session')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Sessions
        </Button>
        <div>
          <div className="font-medium">{session.name}</div>
          <div className="text-xs text-muted-foreground">{session.language}</div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <CollaborativeEditor
          sessionId={session.id}
          language={session.language}
          userName={userInfo?.firstName || userInfo?.email || 'Anonymous'}
          userColor={me?.color ?? '#f4753e'}
        />
      </div>
    </div>
  );
}
