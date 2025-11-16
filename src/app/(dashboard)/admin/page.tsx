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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  Loader2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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

  // Get recent enrollments for activity
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
    },
    {
      title: "Total Courses",
      value: isLoadingCourses ? "..." : totalCourses.toLocaleString(),
      description: "Published courses",
      icon: BookOpen,
    },
    {
      title: "Resources",
      value: isLoadingResources ? "..." : totalResources.toLocaleString(),
      description: "Uploaded resources",
      icon: FileText,
    },
    {
      title: "Enrollments",
      value: isLoadingEnrollmentStats
        ? "..."
        : totalEnrollments.toLocaleString(),
      description: "Total enrollments",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userProfile?.name || "Admin"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your platform today.
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

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest enrollments and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEnrollments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {enrollment.userId?.name || "Unknown User"} enrolled in{" "}
                        {enrollment.courseId?.courseName || "Unknown Course"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(enrollment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {enrollment.status}
                    </Badge>
                  </div>
                ))}
                <Link href="/admin/enrollments">
                  <Button variant="outline" className="w-full">
                    View All Enrollments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Courses
                </Button>
              </Link>
              <Link href="/admin/resources">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Resources
                </Button>
              </Link>
              <Link href="/admin/enrollments">
                <Button variant="outline" className="w-full justify-start">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  View Enrollments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Newly added courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {recentCourses.map((course) => (
                <Link
                  key={course._id}
                  href={`/admin/courses/${course._id}`}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{course.courseName}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    {course.courseCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created{" "}
                    {formatDistanceToNow(new Date(course.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </Link>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
