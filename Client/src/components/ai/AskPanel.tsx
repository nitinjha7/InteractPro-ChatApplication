import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAI } from '@/hooks/useAI';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AskPanel({ open, onClose }: Props) {
  const { isConfigured, ask } = useAI();
  const [question, setQuestion] = useState('');

  const submit = () => {
    if (!question.trim()) return;
    ask.mutate({ query: question.trim() });
  };

  const answer = ask.data?.answer;
  const citations = ask.data?.citations ?? [];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Ask your chat history
          </DialogTitle>
        </DialogHeader>

        {!isConfigured && (
          <p className="text-sm text-muted-foreground">
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
              <p className="mt-3 text-sm text-destructive">{ask.error.message}</p>
            )}

            {answer && (
              <div className="mt-4">
                <p className="whitespace-pre-wrap text-sm text-foreground">{answer}</p>

                {citations.length > 0 && (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Sources
                    </p>
                    <ol className="space-y-2">
                      {citations.map((c: { messageId: string; content: string }, i: number) => (
                        <li
                          key={c.messageId}
                          className="rounded-md border border-border bg-card p-2 text-xs text-muted-foreground"
                        >
                          <span className="font-mono text-primary">[{i + 1}]</span> {c.content}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
