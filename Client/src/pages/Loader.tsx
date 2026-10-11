import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

const Loader = () => {
  const [isWakingServer, setIsWakingServer] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsWakingServer(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <MessageSquare className="h-10 w-10 animate-pulse text-primary" />
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {isWakingServer ? 'The server is waking up. This may take up to a minute...' : 'Loading InteractPro...'}
        </span>
        {isWakingServer && (
          <p className="animate-fade-in-up text-xs text-muted-foreground/75">
            Please keep this page open while the connection is starting.
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;
