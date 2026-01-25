"use client";

import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Shield,
  LogOut,
  CheckCircle,
  Mail,
  RefreshCw,
} from "lucide-react";
import { logout } from "@/redux/features/auth/authSlice";
import { clearAuthCookies } from "@/lib/authActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MentorVerificationPending() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    clearAuthCookies().catch((error) => {
      console.warn("Server-side cookie cleanup failed (non-critical):", error);
    });
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const handleRefresh = () => {
    // Force page reload to get new token with updated isVerified status
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="overflow-hidden shadow-2xl border-2 border-orange-500/20">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full">
                  <Clock className="h-10 w-10 text-white" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Verification Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-lg">
                Welcome,{" "}
                <span className="font-semibold text-foreground">
                  {user?.name}
                </span>
                !
              </p>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Your mentor account is currently under review. Once an
                  administrator approves your request, you will have full access
                  to the mentor dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-orange-500 font-semibold">
                    Awaiting Admin Approval
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Already approved?</strong> Click the button below to
                  refresh your session and access your dashboard.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Session & Login Again
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Need help? Contact support at{" "}
                <a
                  href="mailto:support@learnify.com"
                  className="text-primary hover:underline"
                >
                  support@learnify.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
