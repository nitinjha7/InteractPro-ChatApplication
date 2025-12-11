import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import animationData from "@/assets/animation.json";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { setUserInfo } = useStore();
  const navigate = useNavigate();

  const validateSignup = (email, password, confirmPassword) => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateLogin = (email, password) => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (validateSignup(email, password, confirmPassword)) {
      setLoading(true);
      try {
        const response = await apiClient.post(
          "api/auth/signup",
          { email, password },
          { withCredentials: true }
        );
        if (response.status === 201) {
          setUserInfo(response.data.user);
          toast.success("Account created successfully");
          navigate("/profile");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogIn = async () => {
    if (validateLogin(email, password)) {
      setLoading(true);
      try {
        const response = await apiClient.post(
          "api/auth/login",
          { email, password },
          { withCredentials: true }
        );
        if (response.data.user?._id) {
          setUserInfo(response.data.user);
          toast.success("Logged in successfully");
          navigate(response.data.user.profileSetup ? "/chat" : "/profile");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoLogin = async () => {
    setEmail("test@gmail.com");
    setPassword("1234");

    setLoading(true);
    try {
      const response = await apiClient.post(
        "api/auth/login",
        { email: "test@gmail.com", password: "1234" },
        { withCredentials: true }
      );

      if (response.data.user?._id) {
        setUserInfo(response.data.user);
        toast.success("Logged in with demo account");
        navigate(response.data.user.profileSetup ? "/chat" : "/profile");
      }
    } catch (error) {
      toast.error("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl h-[600px] flex rounded-2xl overflow-hidden shadow-2xl bg-gray-800/30 backdrop-blur-xl border border-gray-700">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-6">
              Welcome to{" "}
              <span className="text-black font-bold text-6xl">InteractPro</span>
            </h1>
            <p className="text-blue-100 text-lg">
              Connect with friends and colleagues in a secure and modern
              environment.
            </p>
            <div className="w-48 mx-auto mt-4 scale-150">
              <Lottie animationData={animationData} loop={true} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center"
        >
          <div className="max-w-md w-full mx-auto space-y-8">
            <AnimatePresence>
              {showAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-yellow-500/10 text-yellow-300 border border-yellow-500 p-3 rounded-lg flex items-center justify-between"
                >
                  <p className="text-sm">
                    Our servers may take a few seconds to start if they have
                    been idle. Please be patient!
                  </p>
                  <button onClick={() => setShowAlert(false)}>
                    <XCircle className="h-5 w-5 text-yellow-400 hover:text-yellow-500 transition" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center mb-8">
              <div className="relative bg-gray-800/50 p-1 rounded-xl flex justify-between items-center backdrop-blur-sm border border-gray-700 w-full max-w-xs">
                <motion.div
                  className="absolute top-1 left-1 h-[calc(100%-8px)] bg-blue-600/90 rounded-lg"
                  initial={false}
                  animate={{ x: isLogin ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: "calc(50% - 4px)" }}
                />
                <button
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "z-10 w-1/2 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isLogin ? "text-white" : "text-gray-400"
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "z-10 w-1/2 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    !isLogin ? "text-white" : "text-gray-400"
                  )}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleDemoLogin}
                  className="
                    cursor-pointer
                    rounded-xl
                    p-4
                    bg-gradient-to-r from-amber-500/20 to-yellow-500/20
                    border border-amber-400/40
                    backdrop-blur-md
                    shadow-xl
                    hover:bg-amber-500/20
                    transition-all duration-300
                    flex flex-col items-center justify-center
                    text-center
                  "
                >
                  <div className="select-none">
                    <p className="text-base font-semibold text-amber-300">
                      Demo Login
                    </p>
                    <p className="text-sm text-amber-200/80">
                      Instant access
                    </p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "easeInOut",
                      repeatType: "mirror",
                    }}
                    className="mt-2"
                  >
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>


            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800/30 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-800/30 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-gray-800/30 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={isLogin ? handleLogIn : handleSignUp}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-all duration-200 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:hover:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  </div>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Auth;
