import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Code2, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/store/store';

const items = [
  { key: 'chat', path: '/chat', icon: MessageSquare, label: 'Chats' },
  { key: 'session', path: '/session', icon: Code2, label: 'Code sessions' },
] as const;

const NavRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useStore((s) => s.userInfo);

  return (
    <nav className="flex h-screen w-[72px] flex-col items-center gap-2 border-r border-border bg-card py-4">
      {items.map(({ key, path, icon: Icon, label }) => {
        const active = location.pathname.startsWith(path);
        return (
          <button
            key={key}
            onClick={() => navigate(path)}
            title={label}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon size={20} />
          </button>
        );
      })}
      <div className="mt-auto">
        <button onClick={() => navigate('/profile')} title="Profile">
          <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/50 transition-all">
            {userInfo?.image ? (
              <AvatarImage src={userInfo.image} alt="Profile" className="object-cover" />
            ) : (
              <UserCircle2 className="text-muted-foreground" />
            )}
          </Avatar>
        </button>
      </div>
    </nav>
  );
};

export default NavRail;
