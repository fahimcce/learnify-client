"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetAllEnrollmentsQuery,
  useDeleteEnrollmentMutation,
  useGetEnrollmentStatisticsQuery,
  useGetAdminMentorEnrollmentsQuery,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Trash2,
  Edit,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminEnrollmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteEnrollmentId, setDeleteEnrollmentId] = useState<string | null>(
    null,
  );

  const { data: enrollments, isLoading: isUserEnrollmentsLoading } =
    useGetAllEnrollmentsQuery({
      status: statusFilter !== "all" ? statusFilter : undefined,
    });
  const { data: mentorEnrollments, isLoading: isMentorEnrollmentsLoading } =
    useGetAdminMentorEnrollmentsQuery();

  const { data: statistics } = useGetEnrollmentStatisticsQuery();
  const [deleteEnrollment, { isLoading: isDeleting }] =
    useDeleteEnrollmentMutation();

  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  const mentorEnrollmentsArray = Array.isArray(mentorEnrollments)
    ? mentorEnrollments
    : [];

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

  const handleDelete = async () => {
    if (!deleteEnrollmentId) return;
    try {
      await deleteEnrollment(deleteEnrollmentId).unwrap();
      toast.success("Enrollment deleted successfully!");
      setDeleteEnrollmentId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete enrollment. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isUserEnrollmentsLoading || isMentorEnrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
        <p className="text-muted-foreground mt-2">
          Manage learner and mentor course assignments
        </p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Enrollments
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalEnrollments}
              </div>
            </CardContent>
          </Card>

          {statistics.enrollmentsByStatus.map((status) => (
            <Card key={status._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {status._id.replace("-", " ")}
                </CardTitle>
                {status._id === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                )}
                {status._id === "in-progress" && (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                )}
                {status._id === "enrolled" && (
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                )}
                {status._id === "cancelled" && (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learner Enrollments Column */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Learner Enrollments
            </h2>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              {enrollmentsArray.length > 0 ? (
                <div className="space-y-4">
                  {enrollmentsArray.map((enrollment: Enrollment) => (
                    <motion.div
                      key={enrollment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-3 space-y-2 bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">
                              {enrollment.courseId?.courseName ||
                                "Unknown Course"}
                            </h3>
                            <Badge
                              className={`text-[10px] h-4 px-1 ${getStatusColor(
                                enrollment.status,
                              )}`}
                            >
                              {enrollment.status.charAt(0).toUpperCase() +
                                enrollment.status.slice(1).replace("-", " ")}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {enrollment.courseId?.courseCode || "N/A"}
                          </p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">
                              Learner:
                            </span>{" "}
                            {enrollment.userId?.name || "Unknown"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {enrollment.userId?.email || "N/A"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteEnrollmentId(enrollment._id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(
                              enrollment.enrollmentDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {enrollment.userLevel && (
                          <div className="text-right">
                            <p className="text-muted-foreground">Level</p>
                            <p className="font-medium">
                              {enrollment.userLevel}/10
                            </p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-muted-foreground">Progress</p>
                          <p className="font-medium">{enrollment.progress}%</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No learner enrollments found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mentor Enrollments Column */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            Mentor Enrollments
          </h2>

          <Card>
            <CardContent className="p-4">
              {mentorEnrollmentsArray.length > 0 ? (
                <div className="space-y-4">
                  {mentorEnrollmentsArray.map((course: any) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-3 space-y-2 bg-orange-50/10 dark:bg-orange-950/5 border-orange-200/50 dark:border-orange-800/30"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{course.courseName}</h3>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {course.courseCode}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs overflow-hidden">
                              {course.mentorId?.image ? (
                                <img
                                  src={course.mentorId.image}
                                  alt={course.mentorId.name}
                                />
                              ) : (
                                course.mentorId?.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium">
                                {course.mentorId?.name || "No Mentor"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {course.mentorId?.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-500">
                          Mentor Assigned
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-orange-200/50 dark:border-orange-800/30">
                        <div>
                          <p className="text-muted-foreground">
                            Assigned Since
                          </p>
                          <p className="font-medium">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Contact</p>
                          <p className="font-medium">
                            {course.mentorId?.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No mentors assigned to courses yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteEnrollmentId}
        onOpenChange={(open) => !open && setDeleteEnrollmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              enrollment record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
