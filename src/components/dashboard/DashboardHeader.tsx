"use client";

import { useSelector } from "react-redux";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function DashboardHeader() {
  const user = useSelector((state: any) => state.auth.user);
  console.log("user", user);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-full items-center justify-end px-4 lg:px-6">
        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-card">
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
