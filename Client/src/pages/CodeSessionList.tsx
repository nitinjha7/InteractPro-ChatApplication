import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCodeSessions } from '@/hooks/useCodeSession';
import { LANGUAGES } from '@/components/editor/languages';

export default function CodeSessionList() {
  const navigate = useNavigate();
  const { sessions, isLoading, create, remove } = useCodeSessions();
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Give the session a name');
      return;
    }
    create.mutate(
      { name: name.trim(), language },
      {
        onSuccess: (data) => {
          setName('');
          navigate(`/session/${data.session.id}`);
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="min-h-screen bg-dark-primary p-8 text-dark-text">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/chat')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to chat
        </Button>

        <h1 className="mb-6 text-2xl font-bold">Code sessions</h1>

        <div className="mb-8 flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Session name"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border border-dark-accent/30 bg-dark-secondary px-3 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <Button onClick={handleCreate} disabled={create.isPending}>
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>

        {isLoading && <p className="text-dark-muted">Loading…</p>}

        {!isLoading && sessions.length === 0 && (
          <p className="text-dark-muted">No sessions yet. Create one above.</p>
        )}

        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-dark-accent/30 bg-dark-secondary p-4"
            >
              <button className="flex-1 text-left" onClick={() => navigate(`/session/${s.id}`)}>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-dark-muted">
                  {s.language} · {s.participants.length} participant
                  {s.participants.length === 1 ? '' : 's'}
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate({ id: s.id })}
                title="Delete session"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
