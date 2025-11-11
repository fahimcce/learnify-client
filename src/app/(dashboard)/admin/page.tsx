"use client";

import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const user = useSelector((state: any) => state.auth.user);

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      description: "Active users",
      icon: Users,
      change: "+12.5%",
    },
    {
      title: "Total Courses",
      value: "56",
      description: "Published courses",
      icon: BookOpen,
      change: "+5.2%",
    },
    {
      title: "Resources",
      value: "234",
      description: "Uploaded resources",
      icon: FileText,
      change: "+8.1%",
    },
    {
      title: "Growth",
      value: "24%",
      description: "This month",
      icon: TrendingUp,
      change: "+3.2%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || "Admin"}!
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
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
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
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Course published</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Resource uploaded</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors">
                Manage Users
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors">
                Create Course
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors">
                Upload Resources
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors">
                View Analytics
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
