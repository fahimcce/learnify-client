"use client";

import { useSelector } from "react-redux";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const user = useSelector((state: any) => state.auth.user);
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

  if (!mounted) {
    return (
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-full items-center justify-end px-4 lg:px-6">
          <div className="flex items-center gap-4">
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
