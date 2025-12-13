"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { clearAuthCookies } from "@/lib/authActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

const mentorMenuItems = [
  {
    title: "Dashboard",
    href: "/mentor",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    href: "/mentor/courses",
    icon: BookOpen,
  },
  {
    title: "Enrollments",
    href: "/mentor/enrollments",
    icon: GraduationCap,
  },
  {
    title: "Profile",
    href: "/mentor/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/mentor/settings",
    icon: Settings,
  },
];

export function MentorSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-center border-b border-border px-4">
            <Link
              href="/mentor"
              className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Learnify
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {mentorMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/mentor"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
