"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { MentorSidebar } from "@/components/dashboard/MentorSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MentorVerificationPending } from "@/components/dashboard/MentorVerificationPending";
import { Loader2 } from "lucide-react";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If not mounted yet, show loading to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user (logout happened), show blank screen and redirect
  if (!user) {
    router.replace("/login");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if mentor is verified - if isVerified is not explicitly true, show pending
  if (user.role === "mentor" && user.isVerified !== true) {
    return <MentorVerificationPending />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MentorSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
