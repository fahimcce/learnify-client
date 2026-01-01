"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  File,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import { clearAuthCookies } from "@/lib/authActions";
import { toast } from "sonner";
import { useState } from "react";

const userMenuItems = [
  {
    title: "Dashboard",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    title: "Courses",
    href: "/user/courses",
    icon: BookOpen,
  },
  {
    title: "My Enrollments",
    href: "/user/enrollments",
    icon: GraduationCap,
  },
  {
    title: "Learning Path",
    href: "/user/learning-path",
    icon: Sparkles,
  },
  {
    title: "Notes",
    href: "/user/notes",
    icon: FileText,
  },
  {
    title: "Quizzes",
    href: "/user/quizzes",
    icon: File,
  },
  {
    title: "Profile",
    href: "/user/profile",
    icon: User,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
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
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-border px-4">
            <Link
              href="/user"
              className="flex items-center gap-2 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-1.5 bg-muted rounded-lg border border-border">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                LEARNIFY
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
            {userMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/user"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110"
                  )} />
                  <span>{item.title}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
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
