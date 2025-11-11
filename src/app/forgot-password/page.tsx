"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { Mail, ArrowLeft, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useForgotPasswordMutation } from "@/redux/features/auth/auth.api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword({ email }).unwrap();

      if (response?.success) {
        setOtpSent(true);
        toast.success("OTP sent to your email! Please check your inbox.");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      // Don't reveal if email exists or not for security
      // But show success message anyway to prevent email enumeration
      setOtpSent(true);
      toast.success(
        "If an account exists with this email, you will receive an OTP."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToReset = () => {
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Back to Login Link */}
      <Link
        href="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-foreground hover:text-primary transition-colors bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Login</span>
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
            src="/images/login.png"
            alt="Forgot Password"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        </motion.div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl font-bold mb-2"
              >
                Forgot Password?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-muted-foreground"
              >
                {otpSent
                  ? "We've sent an OTP to your email"
                  : "Enter your email to receive a reset OTP"}
              </motion.p>
            </div>

            {/* Card */}
            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                  {otpSent ? "OTP Sent" : "Reset Password"}
                </CardTitle>
                <CardDescription className="text-center">
                  {otpSent
                    ? "Check your email for the OTP code"
                    : "We'll send you a 6-digit OTP code"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {otpSent ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="flex justify-center mb-4"
                    >
                      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </motion.div>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        OTP has been sent to
                      </p>
                      <p className="font-medium">{email}</p>
                      <p className="text-xs text-muted-foreground mt-4">
                        The OTP will expire in 15 minutes
                      </p>
                    </div>

                    <Button
                      onClick={handleContinueToReset}
                      className="w-full h-11 text-base"
                      size="lg"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Continue to Reset Password
                    </Button>

                    <div className="text-center text-sm space-y-2">
                      <button
                        onClick={async () => {
                          setOtpSent(false);
                          setIsLoading(true);
                          try {
                            const response = await forgotPassword({
                              email,
                            }).unwrap();
                            if (response?.success) {
                              setOtpSent(true);
                              toast.success("OTP resent to your email!");
                            }
                          } catch (error) {
                            // Show success anyway for security
                            setOtpSent(true);
                            toast.success(
                              "If an account exists with this email, you will receive an OTP."
                            );
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        className="text-primary hover:underline"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Resend OTP"}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Didn't receive the email? Check your spam folder
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-11 text-base"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Back to Login */}
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    Remember your password?{" "}
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
