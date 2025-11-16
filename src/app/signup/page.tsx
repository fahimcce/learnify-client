"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
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
  userId?: string; // User ID from token
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
      // Sign up the user
      const signUpResponse = await signUp(formData).unwrap();

      if (signUpResponse?.success) {
        toast.success("Account created successfully! Logging you in...");

        // Automatically login after signup
        try {
          const loginResponse = await login({
            email: formData.email,
            password: formData.password,
          }).unwrap();

          if (loginResponse?.success && loginResponse?.data?.accessToken) {
            const { accessToken } = loginResponse.data;

            // Decode token to get user info
            const decodedToken: DecodedToken = jwtDecode(accessToken);

            // Get user name from signup response or form data
            const userName = signUpResponse?.data?.name || formData.name;

            // Set token and user in Redux (include _id if available in token)
            dispatch(setToken(accessToken));
            dispatch(
              setUser({
                _id: decodedToken.userId, // Extract user ID from token
                email: decodedToken.email,
                role: decodedToken.role,
                name: userName,
              })
            );

            // Set cookies for middleware
            await setAuthCookies(accessToken);

            // Note: Redux setUser action will also set the user cookie with the name

            toast.success("Welcome to Learnify! Redirecting...");

            // Redirect to user dashboard (signup always creates a user, not admin)
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
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-foreground hover:text-primary transition-colors bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      {/* Image Section - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src="/images/sign up.png"
            alt="Sign Up"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl font-bold mb-2"
              >
                Join{" "}
                <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Learnify
                </span>{" "}
                Today
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-muted-foreground"
              >
                Start your learning journey with AI-powered education
              </motion.p>
            </div>

            {/* Signup Card */}
            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                  Create Account
                </CardTitle>
                <CardDescription className="text-center">
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
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
                      className="h-11"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
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
                      className="h-11"
                      minLength={10}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
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
                      className="h-11"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
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
                        className="h-11 pr-10"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Password Requirements */}
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1 text-xs"
                      >
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 ${
                              req.met
                                ? "text-green-600"
                                : "text-muted-foreground"
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
                    className="w-full h-11 text-base mt-6"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
