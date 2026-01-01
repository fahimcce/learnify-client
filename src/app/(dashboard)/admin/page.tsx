"use client";

import {
  useGetMyProfileQuery,
  useGetAllUsersQuery,
} from "@/redux/features/user/user.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { useGetAllResourcesQuery } from "@/redux/features/courseResource/courseResource.api";
import {
  useGetEnrollmentStatisticsQuery,
  useGetAllEnrollmentsQuery,
} from "@/redux/features/enrollment/enrollment.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  Loader2,
  GraduationCap,
  ArrowRight,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  DashboardCard,
  DashboardStatCard,
  DashboardPageHeader,
} from "@/components/dashboard/DashboardComponents";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: userProfile } = useGetMyProfileQuery();
  const { data: users, isLoading: isLoadingUsers } = useGetAllUsersQuery();
  const { data: courses, isLoading: isLoadingCourses } =
    useGetAllCoursesQuery();
  const { data: resources, isLoading: isLoadingResources } =
    useGetAllResourcesQuery({});
  const { data: enrollmentStats, isLoading: isLoadingEnrollmentStats } =
    useGetEnrollmentStatisticsQuery();
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetAllEnrollmentsQuery({});

  // Calculate statistics
  const totalUsers = users?.filter((u) => !u.isDeleted).length || 0;
  const totalCourses = courses?.filter((c) => !c.isDeleted).length || 0;
  const totalResources = resources?.filter((r) => !r.isDeleted).length || 0;
  const totalEnrollments = enrollmentStats?.totalEnrollments || 0;

  // Get recent enrollments
  const recentEnrollments =
    enrollments
      ?.filter((e) => !e.isDeleted)
      .sort((a, b) => {
        const dateA = new Date(b.createdAt).getTime();
        const dateB = new Date(a.createdAt).getTime();
        return dateA - dateB;
      })
      .slice(0, 5) || [];

  // Get recent courses
  const recentCourses =
    courses
      ?.filter((c) => !c.isDeleted)
      .sort((a, b) => {
        const dateA = new Date(b.createdAt).getTime();
        const dateB = new Date(a.createdAt).getTime();
        return dateA - dateB;
      })
      .slice(0, 3) || [];

  const stats = [
    {
      title: "Total Users",
      value: isLoadingUsers ? "..." : totalUsers.toLocaleString(),
      description: "Active users",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Total Courses",
      value: isLoadingCourses ? "..." : totalCourses.toLocaleString(),
      description: "Published courses",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Resources",
      value: isLoadingResources ? "..." : totalResources.toLocaleString(),
      description: "Uploaded resources",
      icon: FileText,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Enrollments",
      value: isLoadingEnrollmentStats
        ? "..."
        : totalEnrollments.toLocaleString(),
      description: "Total enrollments",
      icon: GraduationCap,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <DashboardPageHeader
        title={`Welcome back, ${userProfile?.name || "Admin"}!`}
        description="Here's what's happening with your platform today."
        action={
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">Admin Panel</span>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent Activity */}
      <DashboardCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">Latest enrollments and updates</p>
          </div>
          <Link href="/admin/enrollments">
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        {isLoadingEnrollments ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : recentEnrollments.length > 0 ? (
          <div className="space-y-3">
            {recentEnrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 hover:bg-accent transition-all"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {enrollment.userId?.name || "Unknown User"} enrolled in{" "}
                    {enrollment.courseId?.courseName || "Unknown Course"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(enrollment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {enrollment.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <p className="text-slate-400">No recent activity</p>
          </div>
        )}
      </DashboardCard>

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <DashboardCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-foreground">Recent Courses</h2>
              <p className="text-sm text-muted-foreground mt-1">Newly added courses</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recentCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/admin/courses/${course._id}`}
                  className="block p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 hover:bg-accent transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {course.courseName}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2 px-2 py-1 bg-muted rounded w-fit">
                    {course.courseCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created{" "}
                    {formatDistanceToNow(new Date(course.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/admin/courses">
              <Button variant="outline" className="w-full">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
