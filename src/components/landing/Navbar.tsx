"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isDark = theme === "dark";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-xl shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Premium Design */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative px-4 py-2 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span className="text-xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      LEARNIFY
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="relative p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="absolute cursor-pointer inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isDark ? (
                  <Moon className="h-4 w-4 cursor-pointer text-slate-300 group-hover:text-blue-400 transition-colors relative z-10" />
                ) : (
                  <Sun className="h-4 w-4 cursor-pointer text-slate-300 group-hover:text-yellow-400 transition-colors relative z-10" />
                )}
                <span className="sr-only">Toggle theme</span>
              </motion.button>
            )}

            {/* Get Started Button - Premium */}
            <Link href="/login">
              <Button
                size="lg"
                className="group relative px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 border-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - Premium */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-slate-300" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-slate-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Premium Design */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Theme Toggle Mobile */}
              {mounted && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <>
                        <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                          <Moon className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-sm font-semibold text-slate-200">
                          Dark Mode
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                          <Sun className="h-4 w-4 text-slate-300 group-hover:text-yellow-400 transition-colors" />
                        </div>
                        <span className="text-sm font-semibold text-slate-200">
                          Light Mode
                        </span>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      animate={{ left: isDark ? 4 : 28 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.button>
              )}

              {/* Get Started Button Mobile */}
              <Link href="/login" className="block">
                <Button
                  size="lg"
                  className="group relative w-full px-6 py-6 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 border-0"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
