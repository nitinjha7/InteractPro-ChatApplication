import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAI } from '@/hooks/useAI';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AskPanel({ open, onClose }: Props) {
  const { isConfigured, ask } = useAI();
  const [question, setQuestion] = useState('');

  if (!open) return null;

  const submit = () => {
    if (!question.trim()) return;
    ask.mutate({ query: question.trim() });
  };

  const answer = ask.data?.answer;
  const citations = ask.data?.citations ?? [];

  return (
    <div className="absolute right-4 top-16 z-50 w-[420px] rounded-lg border border-dark-accent/30 bg-dark-secondary p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-dark-text">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="font-medium">Ask your chat history</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!isConfigured && (
        <p className="text-sm text-dark-muted">
          AI search is not configured on this server. Set GEMINI_API_KEY to enable it.
        </p>
      )}

      {isConfigured && (
        <>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. how do we handle auth?"
            />
            <Button onClick={submit} disabled={ask.isPending}>
              {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
            </Button>
          </div>

          {ask.isError && (
            <p className="mt-3 text-sm text-red-400">{ask.error.message}</p>
          )}

          {answer && (
            <div className="mt-4">
              <p className="whitespace-pre-wrap text-sm text-dark-text">{answer}</p>

              {citations.length > 0 && (
                <div className="mt-4 border-t border-dark-accent/30 pt-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-dark-muted">Sources</p>
                  <ol className="space-y-2">
                    {citations.map((c: { messageId: string; content: string }, i: number) => (
                      <li key={c.messageId} className="text-xs text-dark-muted">
                        <span className="text-blue-400">[{i + 1}]</span> {c.content}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
