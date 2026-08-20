import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { trpc } from '@/lib/trpc';
import { useStore } from '@/store/store';
import AppShell from '@/components/shell/AppShell';
import Auth from '@/pages/Auth';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import Loader from '@/pages/Loader';
import CodeSession from '@/pages/CodeSession';
import CodeSessionList from '@/pages/CodeSessionList';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userInfo = useStore((s) => s.userInfo);
  const location = useLocation();
  return userInfo ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth" replace state={{ from: location.pathname }} />
  );
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

  // the query resolving and the store catching up happen on different
  // renders (setUserInfo only runs after this effect flushes), so gate on
  // both — otherwise ProtectedRoute sees userInfo still undefined for one
  // render and bounces to /auth before the store has a chance to update
  const authPending = isLoading || (!!data?.user && !userInfo);
  if (authPending && !isError) return <Loader />;

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
              <AppShell>
                <Chat />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppShell>
                <Profile />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/session"
          element={
            <ProtectedRoute>
              <AppShell>
                <div className="flex flex-1 overflow-hidden">
                  <CodeSessionList />
                  <div className="flex flex-1 items-center justify-center bg-background text-muted-foreground">
                    Select a session or create a new one
                  </div>
                </div>
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:sessionId"
          element={
            <ProtectedRoute>
              <AppShell>
                <div className="flex flex-1 overflow-hidden">
                  <CodeSessionList />
                  <CodeSession />
                </div>
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
