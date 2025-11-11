"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetAllEnrollmentsQuery,
  useUpdateEnrollmentStatusMutation,
  useDeleteEnrollmentMutation,
  useHardDeleteEnrollmentMutation,
  useGetEnrollmentStatisticsQuery,
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
import { Progress } from "@/components/ui/progress";
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
    null
  );
  const [hardDeleteEnrollmentId, setHardDeleteEnrollmentId] = useState<
    string | null
  >(null);

  const { data: enrollments, isLoading } = useGetAllEnrollmentsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: statistics } = useGetEnrollmentStatisticsQuery();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateEnrollmentStatusMutation();
  const [deleteEnrollment, { isLoading: isDeleting }] =
    useDeleteEnrollmentMutation();
  const [hardDeleteEnrollment, { isLoading: isHardDeleting }] =
    useHardDeleteEnrollmentMutation();

  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];

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

  const handleUpdateStatus = async (
    enrollmentId: string,
    status: string,
    progress?: number
  ) => {
    try {
      await updateStatus({
        id: enrollmentId,
        data: {
          status: status as any,
          progress,
        },
      }).unwrap();
      toast.success("Enrollment status updated successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update enrollment status. Please try again.";
      toast.error(errorMessage);
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

  const handleHardDelete = async () => {
    if (!hardDeleteEnrollmentId) return;
    try {
      await hardDeleteEnrollment(hardDeleteEnrollmentId).unwrap();
      toast.success("Enrollment permanently deleted!");
      setHardDeleteEnrollmentId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete enrollment. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
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
          Manage all course enrollments in the system
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Status</option>
            <option value="enrolled">Enrolled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
          <CardDescription>
            {enrollmentsArray.length} enrollment
            {enrollmentsArray.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollmentsArray.length > 0 ? (
            <div className="space-y-4">
              {enrollmentsArray.map((enrollment: Enrollment) => (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {enrollment.courseId.courseName}
                        </h3>
                        <Badge className={getStatusColor(enrollment.status)}>
                          {enrollment.status.charAt(0).toUpperCase() +
                            enrollment.status.slice(1).replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        {enrollment.courseId.courseCode}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Student: {enrollment.userId.name} ({enrollment.userId.email})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className="font-semibold">{enrollment.progress}%</p>
                      <Progress value={enrollment.progress} className="h-2 mt-1" />
                    </div>
                    {enrollment.userLevel && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          User Level
                        </p>
                        <p className="font-semibold">
                          {enrollment.userLevel}/10
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Enrollment Date
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    {enrollment.completionDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Completion Date
                        </p>
                        <p className="font-semibold text-sm">
                          {new Date(
                            enrollment.completionDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(enrollment._id, "completed", 100)
                      }
                      disabled={isUpdatingStatus || enrollment.status === "completed"}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(enrollment._id, "in-progress")
                      }
                      disabled={isUpdatingStatus || enrollment.status === "in-progress"}
                    >
                      Mark In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteEnrollmentId(enrollment._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHardDeleteEnrollmentId(enrollment._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Hard Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No enrollments found
              </h3>
              <p className="text-muted-foreground">
                {statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No enrollments in the system yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteEnrollmentId}
        onOpenChange={(open) => !open && setDeleteEnrollmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the enrollment. The enrollment can be
              restored later.
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

      {/* Hard Delete Confirmation Dialog */}
      <AlertDialog
        open={!!hardDeleteEnrollmentId}
        onOpenChange={(open) => !open && setHardDeleteEnrollmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              enrollment from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={isHardDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isHardDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

