"use client";

import { useGetMyEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMyProfileQuery } from "@/redux/features/user/user.api";
import { BookOpen, Clock, Award, TrendingUp, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  DashboardCard,
  DashboardStatCard,
  DashboardPageHeader,
} from "@/components/dashboard/DashboardComponents";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const router = useRouter();
  const { data: userProfile } = useGetMyProfileQuery();
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetMyEnrollmentsQuery();

  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  const activeEnrollments = enrollmentsArray.filter(
    (enrollment) => !enrollment.isDeleted
  );

  // Calculate stats
  const enrolledCount = activeEnrollments.length;
  const completedCount = activeEnrollments.filter(
    (enrollment) => enrollment.status === "completed"
  ).length;
  const inProgressCount = activeEnrollments.filter(
    (enrollment) => enrollment.status === "in-progress"
  ).length;
  const averageProgress =
    activeEnrollments.length > 0
      ? Math.round(
          activeEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            activeEnrollments.length
        )
      : 0;

  const stats = [
    {
      title: "Enrolled Courses",
      value: enrolledCount.toString(),
      description: "Active courses",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "In Progress",
      value: inProgressCount.toString(),
      description: "Courses started",
      icon: Clock,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      description: "Finished courses",
      icon: Award,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      description: "Overall completion",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  // Get recent courses
  const recentCourses = activeEnrollments
    .filter((enrollment) => enrollment.courseId && enrollment.courseId._id)
    .sort((a, b) => {
      const dateA = new Date(b.updatedAt).getTime();
      const dateB = new Date(a.updatedAt).getTime();
      return dateA - dateB;
    })
    .slice(0, 6)
    .map((enrollment) => ({
      id: enrollment._id,
      courseId: enrollment.courseId!._id,
      title: enrollment.courseId!.courseName,
      courseCode: enrollment.courseId!.courseCode,
      progress: enrollment.progress || 0,
      lastAccessed: formatDistanceToNow(new Date(enrollment.updatedAt), {
        addSuffix: true,
      }),
      status: enrollment.status,
    }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <DashboardPageHeader
        title={`Welcome back, ${userProfile?.name || "Learner"}!`}
        description="Continue your learning journey and achieve your goals."
        action={
          <Link href="/user/courses">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Courses
            </Button>
          </Link>
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

      {/* Recent Courses & Recommendations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-foreground">Continue Learning</h2>
              <p className="text-sm text-muted-foreground mt-1">Pick up where you left off</p>
            </div>
            <Link href="/user/enrollments">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          {isLoadingEnrollments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentCourses.length > 0 ? (
            <div className="space-y-3">
              {recentCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => router.push(`/user/courses/${course.courseId}`)}
                  className="group p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 hover:bg-accent transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-background rounded">
                      {course.courseCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground min-w-12 text-right">
                      {course.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last accessed {course.lastAccessed}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No enrolled courses yet. Start learning by enrolling in a course!
              </p>
              <Link href="/user/courses">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </DashboardCard>

        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-8 text-center h-full">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-30"></div>
              <div className="relative p-4 bg-muted rounded-full">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">
              AI Recommendations
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get personalized learning suggestions powered by Google Gemini AI
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
