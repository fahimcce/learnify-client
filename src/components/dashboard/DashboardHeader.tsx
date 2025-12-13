"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useGetMyProfileQuery } from "@/redux/features/user/user.api";

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

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-full items-center justify-end px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-card">
              <Avatar className="h-8 w-8">
                {profile?.profilePhoto ? (
                  <AvatarImage
                    src={getProfilePhotoUrl(profile.profilePhoto) || undefined}
                    alt={profile.name}
                  />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {profile?.name ? getInitials(profile.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {profile?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-full items-center justify-end px-4 lg:px-6">
        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-card">
            <Avatar className="h-8 w-8">
              {profile?.profilePhoto ? (
                <AvatarImage
                  src={getProfilePhotoUrl(profile.profilePhoto) || undefined}
                  alt={profile.name}
                />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {profile?.name ? getInitials(profile.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">
                {profile?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
