import { MessageSquare } from "lucide-react";

const Loader = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <MessageSquare className="h-10 w-10 animate-pulse text-primary" />
      <span className="text-sm text-muted-foreground">Loading DevChat…</span>
    </div>
  </div>
);

export default Loader;
