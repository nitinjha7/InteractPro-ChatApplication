import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const onSuccess = (data: { user: { profileSetup: boolean } }) => {
    setUserInfo(data.user as never);
    navigate(data.user.profileSetup ? '/chat' : '/profile');
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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800/30 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-8 max-w-xs">
          <div className="relative flex justify-between rounded-xl border border-gray-700 bg-gray-800/50 p-1">
            <div
              className={cn(
                'absolute top-1 h-[calc(100%-8px)] rounded-lg bg-blue-600/90 transition-all duration-200',
                isLogin ? 'left-1' : 'left-[calc(50%+4px)]'
              )}
              style={{ width: 'calc(50% - 4px)' }}
            />
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                'z-10 w-1/2 rounded-lg py-2 text-sm font-medium transition-colors',
                isLogin ? 'text-white' : 'text-gray-400'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                'z-10 w-1/2 rounded-lg py-2 text-sm font-medium transition-colors',
                !isLogin ? 'text-white' : 'text-gray-400'
              )}
            >
              Sign Up
            </button>
          </div>
        </div>

        <h1 className="mb-6 text-center text-2xl font-bold text-white">InteractPro</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-700 bg-gray-800/30 pl-10 text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="border-gray-700 bg-gray-800/30 pl-10 pr-10 text-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-gray-700 bg-gray-800/30 pl-10 text-gray-200"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
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
