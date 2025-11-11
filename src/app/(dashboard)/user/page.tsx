"use client";

import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UserDashboard() {
  const user = useSelector((state: any) => state.auth.user);

  const stats = [
    {
      title: "Enrolled Courses",
      value: "5",
      description: "Active courses",
      icon: BookOpen,
    },
    {
      title: "Study Time",
      value: "24h",
      description: "This week",
      icon: Clock,
    },
    {
      title: "Achievements",
      value: "12",
      description: "Completed",
      icon: Award,
    },
    {
      title: "Progress",
      value: "68%",
      description: "Overall completion",
      icon: TrendingUp,
    },
  ];

  const recentCourses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      progress: 75,
      lastAccessed: "2 hours ago",
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      progress: 45,
      lastAccessed: "1 day ago",
    },
    {
      id: 3,
      title: "React Fundamentals",
      progress: 30,
      lastAccessed: "3 days ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || "Learner"}!
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
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
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
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/user/courses">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
              <Link href="/user/learning-path">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Learning Path
                </Button>
              </Link>
              <Link href="/user/resources">
                <Button className="w-full justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  Resources
                </Button>
              </Link>
              <Link href="/user/profile">
                <Button className="w-full justify-start" variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
