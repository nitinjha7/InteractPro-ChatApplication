import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Users } from 'lucide-react';
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
    <div className="flex h-full w-[320px] flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')} title="Back to chat">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Code sessions</h1>
      </div>

      <div className="space-y-2 border-b border-border p-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Session name"
        />
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex-1 rounded-md border border-border bg-popover px-2 text-sm text-foreground"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <Button onClick={handleCreate} disabled={create.isPending} size="sm">
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {isLoading && <p className="px-1 text-sm text-muted-foreground">Loading…</p>}

        {!isLoading && sessions.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground">No sessions yet. Create one above.</p>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
          >
            <button className="min-w-0 flex-1 text-left" onClick={() => navigate(`/session/${s.id}`)}>
              <div className="truncate font-medium text-foreground">{s.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>
                  {s.language} · {s.participants.length} participant
                  {s.participants.length === 1 ? '' : 's'}
                </span>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove.mutate({ id: s.id })}
              title="Delete session"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
