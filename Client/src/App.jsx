import React, { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import { useStore } from "@/store/store";
import apiClient from "./lib/apiClient";
import Loader from "./pages/Loader";

const ProtectedRoutes = ({ children }) => {
  const { userInfo } = useStore();
  const isAutheticated = !!userInfo;
  return isAutheticated ? children : <Navigate to="/auth" />;
};

const AuthRoutes = ({ children }) => {
  const { userInfo } = useStore();
  const isAutheticated = !!userInfo;
  const profile = userInfo?.profileSetup;
  return isAutheticated ? profile ? <Navigate to="/chat" /> : <Navigate to="/profile" /> : children;
};

const App = () => {
  const { userInfo, setUserInfo } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/api/auth/userInfo', {withCredentials: true});

        if(response.status == 200 && response.data.user._id){
          setUserInfo(response.data.user);
        }else{
          setUserInfo(undefined);
        }
      }
      catch (error) {
        setUserInfo(undefined);
        console.error(error);
      }
      finally{
        setLoading(false);
      }
    }

    if (userInfo == undefined) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return <Loader />
  }


  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoutes>
              <Auth />
            </AuthRoutes>
          }
        ></Route>
        <Route
          path="/chat"
          element={
            <ProtectedRoutes>
              <Chat />
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/profile"
          element={
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          }
        ></Route>

        <Route path="*" element={<Navigate to="/auth" />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
