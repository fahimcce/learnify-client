"use client";

import { useGetMyEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMyProfileQuery } from "@/redux/features/user/user.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, Award, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

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
    },
    {
      title: "In Progress",
      value: inProgressCount.toString(),
      description: "Courses started",
      icon: Clock,
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      description: "Finished courses",
      icon: Award,
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      description: "Overall completion",
      icon: TrendingUp,
    },
  ];

  // Get recent courses (sorted by updatedAt, most recent first)
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.name || "Learner"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Continue your learning journey and achieve your goals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Courses */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Your recent courses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEnrollments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() =>
                      router.push(`/user/courses/${course.courseId}`)
                    }
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {course.courseCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-12 text-right">
                          {course.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last accessed {course.lastAccessed}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No enrolled courses yet. Start learning by enrolling in a
                  course!
                </p>
                <Link href="/user/courses">
                  <Button variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>AI Powered daily recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4">
                <Award className="h-16 w-16 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                AI Powered Daily Recommendation
              </h3>
              <p className="text-muted-foreground">Feature coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
