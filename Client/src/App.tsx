import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { trpc } from '@/lib/trpc';
import { useStore } from '@/store/store';
import Auth from '@/pages/Auth';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import Loader from '@/pages/Loader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userInfo = useStore((s) => s.userInfo);
  return userInfo ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const userInfo = useStore((s) => s.userInfo);
  if (!userInfo) return <>{children}</>;
  return <Navigate to={userInfo.profileSetup ? '/chat' : '/profile'} replace />;
};

const App = () => {
  const userInfo = useStore((s) => s.userInfo);
  const setUserInfo = useStore((s) => s.setUserInfo);

  const { data, isLoading, isError } = trpc.auth.userInfo.useQuery(undefined, {
    enabled: !userInfo,
    retry: false,
  });

  useEffect(() => {
    if (data?.user) setUserInfo(data.user as never);
  }, [data, setUserInfo]);

  if (isLoading && !userInfo && !isError) return <Loader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
