"use client";

import { GraduationCap, BookOpen, Users, Loader2 } from "lucide-react";
import {
  DashboardStatCard,
  DashboardPageHeader,
} from "@/components/dashboard/DashboardComponents";
import { motion } from "framer-motion";
import { useGetMentorStatisticsQuery } from "@/redux/features/mentor/mentor.api";

export default function MentorDashboardPage() {
  const { data: statsData, isLoading } = useGetMentorStatisticsQuery();

  const stats = [
    {
      title: "Assigned Courses",
      value: statsData?.assignedCoursesCount || "0",
      description: "Courses assigned to you",
      icon: BookOpen,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Enrollments",
      value: statsData?.totalEnrollments || "0",
      description: "Students enrolled in your courses",
      icon: GraduationCap,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Students",
      value: statsData?.activeStudents || "0",
      description: "Currently active learners",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardPageHeader
        title="Mentor Dashboard"
        description="Manage your courses and track student enrollments"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <DashboardStatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              gradient={stat.gradient}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
