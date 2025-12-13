"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Check,
  Sparkles,
  BookOpen,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-gray-900"
            >
              Your Complete{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Learning Management System
              </span>{" "}
              with AI
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-gray-600 leading-relaxed"
            >
              Enroll in courses, track your progress, get AI-powered learning
              paths, receive daily recommendations, and collaborate with peers -
              all in one comprehensive platform.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  START FOR FREE
                </Button>
              </Link>
            </motion.div>

            {/* Benefit Statements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Free courses included
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-6 space-y-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
                    Dashboard
                  </div>
                  <div className="px-3 py-1 text-gray-600 rounded text-sm">
                    Courses
                  </div>
                  <div className="px-3 py-1 text-gray-600 rounded text-sm">
                    Progress
                  </div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600 font-medium">
                      ENROLLED
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">24</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600 font-medium">
                      COMPLETED
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">12</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600 font-medium">
                      PEERS
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">156</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-gray-600 font-medium">
                      ACHIEVEMENTS
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">8</div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Learning Progress
                  </h3>
                  <select className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700">
                    <option>Last Month</option>
                  </select>
                </div>
                <div className="h-32 bg-gradient-to-t from-blue-100 via-purple-50 to-green-50 rounded-lg flex items-end justify-around p-4">
                  <div
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: "40%" }}
                  ></div>
                  <div
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: "60%" }}
                  ></div>
                  <div
                    className="w-8 bg-purple-500 rounded-t"
                    style={{ height: "80%" }}
                  ></div>
                  <div
                    className="w-8 bg-green-500 rounded-t"
                    style={{ height: "70%" }}
                  ></div>
                  <div
                    className="w-8 bg-green-500 rounded-t"
                    style={{ height: "90%" }}
                  ></div>
                  <div
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
