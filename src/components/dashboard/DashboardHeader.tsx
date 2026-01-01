"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGetMyProfileQuery } from "@/redux/features/user/user.api";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { data: profile } = useGetMyProfileQuery();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isDark = theme === "dark";

  const getProfilePhotoUrl = (profilePhoto?: string) => {
    if (!profilePhoto) return null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const photoPath = profilePhoto.startsWith("/")
      ? profilePhoto
      : `/${profilePhoto}`;
    return `${apiUrl}${photoPath}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Side - Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative hidden md:block max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-full rounded-lg bg-muted border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
</div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-9 w-9 rounded-lg"
            >
              {isDark ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted border border-border">
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              {profile?.profilePhoto ? (
                <AvatarImage
                  src={getProfilePhotoUrl(profile.profilePhoto) || undefined}
                  alt={profile.name}
                />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {profile?.name ? getInitials(profile.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">
                {profile?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
