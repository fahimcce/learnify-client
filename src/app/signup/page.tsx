"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Brain,
  GraduationCap,
} from "lucide-react";
import {
  useSignUpMutation,
  useLoginMutation,
} from "@/redux/features/auth/auth.api";
import { setUser, setToken } from "@/redux/features/auth/authSlice";
import { setAuthCookies } from "@/lib/authActions";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

interface DecodedToken {
  email: string;
  role: string;
  userId?: string;
  exp: number;
  iat: number;
  name?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [signUp] = useSignUpMutation();
  const [login] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const signUpResponse = await signUp(formData).unwrap();

      if (signUpResponse?.success) {
        toast.success("Account created successfully! Logging you in...");

        try {
          const loginResponse = await login({
            email: formData.email,
            password: formData.password,
          }).unwrap();

          if (loginResponse?.success && loginResponse?.data?.accessToken) {
            const { accessToken } = loginResponse.data;
            const decodedToken: DecodedToken = jwtDecode(accessToken);
            const userName = signUpResponse?.data?.name || formData.name;

            dispatch(setToken(accessToken));
            dispatch(
              setUser({
                _id: decodedToken.userId,
                email: decodedToken.email,
                role: decodedToken.role,
                name: userName,
              })
            );

            await setAuthCookies(accessToken);
            toast.success("Welcome to Learnify! Redirecting...");

            setTimeout(() => {
              router.push("/user");
            }, 500);
          }
        } catch (loginError: any) {
          console.error("Auto-login error:", loginError);
          toast.error(
            "Account created but login failed. Please login manually."
          );
          router.push("/login");
        }
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Signup failed. Please check your information and try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const passwordRequirements = [
    { text: "At least 6 characters", met: formData.password.length >= 6 },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-blue-400 transition-colors bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-lg group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Back to Home</span>
      </Link>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-50"></div>
                  <Brain className="w-8 h-8 text-white relative z-10" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl sm:text-4xl font-black mb-2"
              >
                <span className="text-white">Join </span>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Learnify
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-slate-300 text-sm"
              >
                Start your AI-powered learning journey today
              </motion.p>
            </div>

            {/* Signup Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20"></div>
              
              <div className="relative">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-slate-200 font-semibold">
                      <User className="w-4 h-4 text-blue-400" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-slate-200 font-semibold">
                      <Phone className="w-4 h-4 text-blue-400" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      minLength={10}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-slate-200 font-semibold">
                      <Mail className="w-4 h-4 text-blue-400" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-slate-200 font-semibold">
                      <Lock className="w-4 h-4 text-blue-400" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {/* Password Requirements */}
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1 text-xs pt-2"
                      >
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 ${
                              req.met
                                ? "text-green-400"
                                : "text-slate-500"
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3 h-3 ${
                                req.met ? "fill-current" : ""
                              }`}
                            />
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="group w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800/50 px-3 text-slate-400 font-semibold">
                      Or
                    </span>
                  </div>
                </div>

                {/* Mentor Signup Link */}
                <div className="text-center text-sm mb-3">
                  <span className="text-slate-400">
                    Are you a mentor?{" "}
                  </span>
                  <Link
                    href="/signup/mentor"
                    className="font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                  >
                    Sign up as Mentor
                  </Link>
                </div>

                {/* Login Link */}
                <div className="text-center text-sm">
                  <span className="text-slate-400">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
