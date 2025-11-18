"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGetMyEnrollmentByIdQuery,
  useUpdateUserLevelMutation,
  useUnenrollFromCourseMutation,
} from "@/redux/features/enrollment/enrollment.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trash2,
  Save,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EnrollmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.id as string;
  const [userLevel, setUserLevel] = useState<number>(5);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);

  const {
    data: enrollment,
    isLoading,
    error,
  } = useGetMyEnrollmentByIdQuery(enrollmentId);
  const [updateUserLevel, { isLoading: isUpdatingLevel }] =
    useUpdateUserLevelMutation();
  const [unenroll, { isLoading: isUnenrolling }] =
    useUnenrollFromCourseMutation();

  useEffect(() => {
    if (enrollment) {
      setUserLevel(enrollment.userLevel || 5);
    }
  }, [enrollment]);

  const handleUpdateUserLevel = async () => {
    try {
      await updateUserLevel({
        id: enrollmentId,
        data: { userLevel },
      }).unwrap();
      toast.success("User level updated successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update user level. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleUnenroll = async () => {
    try {
      await unenroll(enrollmentId).unwrap();
      toast.success("Successfully unenrolled from course");
      router.push("/user/enrollments");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to unenroll. Please try again.";
      toast.error(errorMessage);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              Failed to load enrollment details.
            </p>
            <Link href="/user/enrollments">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Enrollments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/user/enrollments">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Enrollments
        </Button>
      </Link>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {enrollment.courseId.courseName}
                </CardTitle>
                <CardDescription className="font-mono mt-1">
                  {enrollment.courseId.courseCode}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(enrollment.status)}>
                {enrollment.status.charAt(0).toUpperCase() +
                  enrollment.status.slice(1).replace("-", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Enrollment Date
                  </p>
                  <p className="font-medium">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
                {enrollment.completionDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Completion Date
                    </p>
                    <p className="font-medium">
                      {new Date(enrollment.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Update User Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Skill Level</CardTitle>
            <CardDescription>
              Update your skill level for this course (1-10)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userLevel">Skill Level (1-10)</Label>
              <Input
                id="userLevel"
                type="number"
                min="1"
                max="10"
                value={userLevel}
                onChange={(e) => setUserLevel(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                1-3: Beginner • 4-6: Intermediate • 7-8: Advanced • 9-10: Expert
              </p>
            </div>
            <Button
              onClick={handleUpdateUserLevel}
              disabled={isUpdatingLevel}
              variant="outline"
              className="w-full"
            >
              {isUpdatingLevel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Update Level
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex gap-4"
      >
        <Link
          href={`/user/courses/${enrollment.courseId._id}`}
          className="flex-1"
        >
          <Button variant="outline" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            View Course
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={() => setShowUnenrollDialog(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Unenroll
        </Button>
      </motion.div>

      {/* Unenroll Dialog */}
      <AlertDialog
        open={showUnenrollDialog}
        onOpenChange={setShowUnenrollDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unenroll you from the course. You can re-enroll later if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnenrolling}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenroll}
              disabled={isUnenrolling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUnenrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unenrolling...
                </>
              ) : (
                "Unenroll"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
