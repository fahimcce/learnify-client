"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGetMyEnrollmentsQuery,
  Enrollment,
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
  Loader2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
} from "lucide-react";

export default function MyEnrollmentsPage() {
  const { data: enrollments, isLoading, error } = useGetMyEnrollmentsQuery();
  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  // Filter out enrollments with null courseId
  const validEnrollments = enrollmentsArray.filter(
    (enrollment) => enrollment.courseId && enrollment.courseId._id
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "enrolled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4" />;
      case "enrolled":
        return <BookOpen className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load enrollments. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Enrollments</h1>
        <p className="text-muted-foreground mt-2">
          View all your enrolled courses
        </p>
      </div>

      {/* Enrollments Grid */}
      {validEnrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {validEnrollments.map((enrollment: Enrollment) => (
            <motion.div
              key={enrollment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {enrollment.courseId?.courseName || "Unknown Course"}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm mt-1">
                        {enrollment.courseId?.courseCode || "N/A"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(enrollment.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(enrollment.status)}
                        {enrollment.status.charAt(0).toUpperCase() +
                          enrollment.status.slice(1).replace("-", " ")}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* Course Level */}
                    {enrollment.courseId?.level && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Course Level:
                        </span>
                        <Badge
                          className={getLevelColor(enrollment.courseId.level)}
                        >
                          {enrollment.courseId.level.charAt(0).toUpperCase() +
                            enrollment.courseId.level.slice(1)}
                        </Badge>
                      </div>
                    )}

                    {/* User Level */}
                    {enrollment.userLevel && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Your Level:
                        </span>
                        <Badge variant="outline">
                          {enrollment.userLevel}/10
                        </Badge>
                      </div>
                    )}

                    {/* Enrollment Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Enrolled:{" "}
                        {new Date(
                          enrollment.enrollmentDate
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Completion Date */}
                    {enrollment.completionDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>
                          Completed:{" "}
                          {new Date(
                            enrollment.completionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t mt-auto">
                      <Link
                        href={`/user/enrollments/${enrollment._id}`}
                        className="w-full"
                      >
                        <Button className="w-full" variant="default">
                          {enrollment.status === "completed"
                            ? "View Details"
                            : "Continue Learning"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No enrollments found
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't enrolled in any courses yet. Browse available
                courses to get started!
              </p>
              <Link href="/user/courses">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
