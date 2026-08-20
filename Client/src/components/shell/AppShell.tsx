import type { ReactNode } from 'react';
import NavRail from './NavRail';

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <NavRail />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default AppShell;
