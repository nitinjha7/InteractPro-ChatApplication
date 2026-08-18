import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useStore } from '@/store/store';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setUserInfo = useStore((s) => s.setUserInfo);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const onSuccess = (data: { user: { profileSetup: boolean } }) => {
    setUserInfo(data.user as never);
    if (!data.user.profileSetup) {
      navigate('/profile');
      return;
    }
    navigate(from && from !== '/auth' ? from : '/chat');
  };

  const login = trpc.auth.login.useMutation({
    onSuccess,
    onError: (e) => toast.error(e.message),
  });
  const signup = trpc.auth.signup.useMutation({
    onSuccess,
    onError: (e) => toast.error(e.message),
  });

  const loading = login.isPending || signup.isPending;

  const handleSubmit = () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    if (isLogin) {
      login.mutate({ email, password });
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    signup.mutate({ email, password });
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mx-auto mb-8 max-w-xs">
          <div className="relative flex justify-between rounded-xl border border-border bg-secondary/50 p-1">
            <div
              className={cn(
                'absolute top-1 h-[calc(100%-8px)] rounded-lg bg-primary transition-all duration-200',
                isLogin ? 'left-1' : 'left-[calc(50%+4px)]'
              )}
              style={{ width: 'calc(50% - 4px)' }}
            />
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                'z-10 w-1/2 rounded-lg py-2 text-sm font-medium transition-colors',
                isLogin ? 'text-white' : 'text-muted-foreground'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                'z-10 w-1/2 rounded-lg py-2 text-sm font-medium transition-colors',
                !isLogin ? 'text-white' : 'text-muted-foreground'
              )}
            >
              Sign Up
            </button>
          </div>
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">DevChat</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background/60 pl-10 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="border-input bg-background/60 pl-10 pr-10 text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-input bg-background/60 pl-10 text-foreground"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
